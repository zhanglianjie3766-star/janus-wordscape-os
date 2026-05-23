import { normalizeAppData } from './storage';
import { getBackupDataValidationErrors, isSafeAudioReference, isSafeHttpUrl } from './security';
import type { AppData, FrequencyTier, MemoryStage, Rating, ReviewMode, SchedulerKind } from './types';

interface BackupValidationResult {
  data?: AppData;
  errors: string[];
}

const frequencyTiers: FrequencyTier[] = ['F1', 'F2', 'F3', 'F4'];
const memoryStages: MemoryStage[] = ['new', 'learning', 'reviewing', 'reinforce', 'downgrade', 'release', 'due', 'overdue'];
const ratings: Rating[] = ['again', 'hard', 'good', 'easy'];
const reviewModes: ReviewMode[] = ['daily_task', 'browser_detail'];
const schedulers: SchedulerKind[] = ['phase1_simple', 'ts-fsrs'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidDateText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0 && Number.isFinite(new Date(value).getTime());
}

function validateCardLike(card: unknown, index: number, cardIds: Set<string>, errors: string[]) {
  const row = index + 1;
  if (!isRecord(card)) {
    errors.push(`cards[${row}] must be an object.`);
    return;
  }

  const cardId = asString(card.card_id);
  if (!cardId) {
    errors.push(`cards[${row}].card_id is required.`);
  } else if (cardIds.has(cardId)) {
    errors.push(`cards[${row}].card_id is duplicated: ${cardId}.`);
  } else {
    cardIds.add(cardId);
  }

  for (const field of ['headword', 'definition_zh', 'definition_en', 'part_of_speech', 'domain_pack_id']) {
    if (!asString(card[field])) {
      errors.push(`cards[${row}].${field} must be a non-empty string.`);
    }
  }

  if (!isStringArray(card.scene_tags) || card.scene_tags.length === 0) {
    errors.push(`cards[${row}].scene_tags must be a non-empty string array.`);
  }

  if (!isStringArray(card.usage_tasks) || card.usage_tasks.length === 0) {
    errors.push(`cards[${row}].usage_tasks must be a non-empty string array.`);
  }

  if (!frequencyTiers.includes(card.frequency_tier as FrequencyTier)) {
    errors.push(`cards[${row}].frequency_tier must be F1, F2, F3, or F4.`);
  }

  if (!Array.isArray(card.examples)) {
    errors.push(`cards[${row}].examples must be an array.`);
  }

  if (!isRecord(card.source)) {
    errors.push(`cards[${row}].source must be an object.`);
  } else if (!isSafeHttpUrl(asString(card.source.source_url))) {
    errors.push(`cards[${row}].source.source_url must be a safe http(s) URL.`);
  }

  for (const field of ['audio_url', 'audio_asset_id']) {
    const audioReference = asString(card[field]);
    if (audioReference && !isSafeAudioReference(audioReference)) {
      errors.push(`cards[${row}].${field} must be a safe http(s) URL or same-origin audio path.`);
    }
  }
}

function validateMemoryStateLike(state: unknown, key: string, cardIds: Set<string>, errors: string[]) {
  if (!isRecord(state)) {
    errors.push(`memory_states.${key} must be an object.`);
    return;
  }

  const cardId = asString(state.card_id);
  if (!cardId || cardId !== key || !cardIds.has(cardId)) {
    errors.push(`memory_states.${key}.card_id must match an existing card.`);
  }

  if (!memoryStages.includes(state.stage as MemoryStage)) {
    errors.push(`memory_states.${key}.stage is invalid.`);
  }

  if (!memoryStages.includes(state.recommended_action as MemoryStage)) {
    errors.push(`memory_states.${key}.recommended_action is invalid.`);
  }

  for (const field of ['difficulty', 'stability', 'retrievability', 'review_count', 'lapse_count']) {
    if (!isFiniteNumber(state[field])) {
      errors.push(`memory_states.${key}.${field} must be a finite number.`);
    }
  }

  if (!isValidDateText(state.due_at)) {
    errors.push(`memory_states.${key}.due_at must be a valid ISO date string.`);
  }
}

function validateReviewEventLike(event: unknown, index: number, cardIds: Set<string>, errors: string[]) {
  const row = index + 1;
  if (!isRecord(event)) {
    errors.push(`review_events[${row}] must be an object.`);
    return;
  }

  if (!asString(event.review_event_id)) {
    errors.push(`review_events[${row}].review_event_id is required.`);
  }

  const cardId = asString(event.card_id);
  if (!cardId || !cardIds.has(cardId)) {
    errors.push(`review_events[${row}].card_id must reference an existing card.`);
  }

  if (!isValidDateText(event.reviewed_at)) {
    errors.push(`review_events[${row}].reviewed_at must be a valid ISO date string.`);
  }

  if (!ratings.includes(event.rating as Rating)) {
    errors.push(`review_events[${row}].rating is invalid.`);
  }

  if (!reviewModes.includes(event.review_mode as ReviewMode)) {
    errors.push(`review_events[${row}].review_mode is invalid.`);
  }

  if (!schedulers.includes(event.scheduler as SchedulerKind)) {
    errors.push(`review_events[${row}].scheduler is invalid.`);
  }

  if (!asString(event.scheduler_version)) {
    errors.push(`review_events[${row}].scheduler_version is required.`);
  }

  if (event.fsrs_raw_state_after !== undefined) {
    validateMemoryStateLike(event.fsrs_raw_state_after, cardId, cardIds, errors);
  }

  if (event.state_after !== undefined) {
    validateMemoryStateLike(event.state_after, cardId, cardIds, errors);
  }

  if (event.state_before !== null && event.state_before !== undefined) {
    validateMemoryStateLike(event.state_before, cardId, cardIds, errors);
  }
}

export function validateBackupInput(input: unknown): BackupValidationResult {
  if (!isRecord(input)) {
    return { errors: ['Backup root must be an object.'] };
  }

  const data = normalizeAppData(input);
  const errors = getBackupDataValidationErrors(data);
  const cardIds = new Set<string>();

  if (!Array.isArray(data.cards)) {
    errors.push('cards must be an array.');
  } else {
    data.cards.forEach((card, index) => validateCardLike(card, index, cardIds, errors));
  }

  if (!isRecord(data.memory_states)) {
    errors.push('memory_states must be an object.');
  } else {
    Object.entries(data.memory_states).forEach(([key, value]) => validateMemoryStateLike(value, key, cardIds, errors));
  }

  if (!Array.isArray(data.review_events)) {
    errors.push('review_events must be an array.');
  } else {
    data.review_events.forEach((event, index) => validateReviewEventLike(event, index, cardIds, errors));
  }

  return errors.length > 0 ? { errors } : { data, errors: [] };
}
