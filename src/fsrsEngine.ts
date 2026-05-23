import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating as FSRSRating,
  State as FSRSState
} from 'ts-fsrs';
import type { Card as FSRSCard, Grade as FSRSGrade } from 'ts-fsrs';
import type { LearningPlan, MemoryStage, Rating, SerializedFSRSCard, UserMemoryState } from './types';

type FSRSRuntimeOptions = Pick<LearningPlan, 'target_retention' | 'maximum_interval_days' | 'relearning_interval_minutes' | 'leech_lapse_threshold'>;

export const FSRS_SCHEDULER = 'ts-fsrs';
export const FSRS_SCHEDULER_VERSION = '5.4.0';

export interface FSRSAuditReviewResult {
  fsrs_raw_state_after: UserMemoryState;
  state_after: UserMemoryState;
}

const defaultRuntimeOptions: FSRSRuntimeOptions = {
  target_retention: 0.9,
  maximum_interval_days: 365,
  relearning_interval_minutes: 10,
  leech_lapse_threshold: 4
};

const ratingToFSRS: Record<Rating, FSRSGrade> = {
  again: FSRSRating.Again,
  hard: FSRSRating.Hard,
  good: FSRSRating.Good,
  easy: FSRSRating.Easy
};

function normalizeOptions(options: Partial<FSRSRuntimeOptions> = {}): FSRSRuntimeOptions {
  return {
    target_retention: Math.min(0.98, Math.max(0.7, options.target_retention ?? defaultRuntimeOptions.target_retention)),
    maximum_interval_days: Math.max(1, Math.round(options.maximum_interval_days ?? defaultRuntimeOptions.maximum_interval_days)),
    relearning_interval_minutes: Math.max(1, Math.round(options.relearning_interval_minutes ?? defaultRuntimeOptions.relearning_interval_minutes)),
    leech_lapse_threshold: Math.max(1, Math.round(options.leech_lapse_threshold ?? defaultRuntimeOptions.leech_lapse_threshold))
  };
}

function createScheduler(options: Partial<FSRSRuntimeOptions> = {}) {
  const safeOptions = normalizeOptions(options);
  return fsrs(
    generatorParameters({
      request_retention: safeOptions.target_retention
    })
  );
}

function serializeDate(value: Date | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

function restoreDate(value: string | undefined): Date | undefined {
  return value ? new Date(value) : undefined;
}

export function serializeFSRSCard(card: FSRSCard): SerializedFSRSCard {
  return {
    due: card.due.toISOString(),
    stability: card.stability,
    difficulty: card.difficulty,
    elapsed_days: card.elapsed_days,
    scheduled_days: card.scheduled_days,
    learning_steps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    last_review: serializeDate(card.last_review)
  };
}

export function restoreFSRSCard(serialized: SerializedFSRSCard): FSRSCard {
  return {
    due: new Date(serialized.due),
    stability: serialized.stability,
    difficulty: serialized.difficulty,
    elapsed_days: serialized.elapsed_days,
    scheduled_days: serialized.scheduled_days,
    learning_steps: serialized.learning_steps,
    reps: serialized.reps,
    lapses: serialized.lapses,
    state: serialized.state,
    last_review: restoreDate(serialized.last_review)
  };
}

function mapRawFSRSState(card: FSRSCard): MemoryStage {
  if (card.state === FSRSState.New) {
    return 'new';
  }

  if (card.state === FSRSState.Learning) {
    return 'learning';
  }

  if (card.state === FSRSState.Relearning) {
    return 'reinforce';
  }

  return 'reviewing';
}

function mapAdaptedFSRSState(card: FSRSCard, rating?: Rating): MemoryStage {
  if (rating === 'again') {
    return 'downgrade';
  }

  if (rating === 'hard') {
    return 'reinforce';
  }

  if (rating === 'easy' && card.reps >= 3 && card.scheduled_days >= 21) {
    return 'release';
  }

  return mapRawFSRSState(card);
}

function recommendedAction(card: FSRSCard, stage: MemoryStage, now: Date): MemoryStage {
  if (stage === 'downgrade' || stage === 'reinforce' || stage === 'release') {
    return stage;
  }

  if (card.due.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
    return 'overdue';
  }

  if (card.due.getTime() <= now.getTime()) {
    return 'due';
  }

  return stage;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function applyRuntimeLimits(card: FSRSCard, rating: Rating, reviewedAt: Date, options: FSRSRuntimeOptions): FSRSCard {
  const next = { ...card };

  if (rating === 'again') {
    next.due = addMinutes(reviewedAt, options.relearning_interval_minutes);
    next.scheduled_days = Math.max(0, Math.round(options.relearning_interval_minutes / 1440));
    return next;
  }

  const latestDue = addDays(reviewedAt, options.maximum_interval_days);
  if (next.due.getTime() > latestDue.getTime()) {
    next.due = latestDue;
    next.scheduled_days = options.maximum_interval_days;
  }

  return next;
}

function toMemoryState(cardId: string, card: FSRSCard, reviewedAt: Date, scheduler: ReturnType<typeof createScheduler>, stage: MemoryStage): UserMemoryState {
  const retrievability = card.stability > 0 ? scheduler.get_retrievability(card, reviewedAt, false) : 0;

  return {
    card_id: cardId,
    stage,
    scheduler: FSRS_SCHEDULER,
    scheduler_version: FSRS_SCHEDULER_VERSION,
    fsrs_card: serializeFSRSCard(card),
    difficulty: Number(card.difficulty.toFixed(4)),
    stability: Number(card.stability.toFixed(4)),
    retrievability: Number(retrievability.toFixed(4)),
    due_at: card.due.toISOString(),
    last_reviewed_at: reviewedAt.toISOString(),
    review_count: card.reps,
    lapse_count: card.lapses,
    recommended_action: recommendedAction(card, stage, reviewedAt)
  };
}

export function createInitialMemoryState(cardId: string, now = new Date()): UserMemoryState {
  const fsrsCard = createEmptyCard(now);
  const serialized = serializeFSRSCard(fsrsCard);

  return {
    card_id: cardId,
    stage: 'new',
    scheduler: FSRS_SCHEDULER,
    scheduler_version: FSRS_SCHEDULER_VERSION,
    fsrs_card: serialized,
    difficulty: fsrsCard.difficulty,
    stability: fsrsCard.stability,
    retrievability: 0,
    due_at: serialized.due,
    review_count: fsrsCard.reps,
    lapse_count: fsrsCard.lapses,
    recommended_action: 'new'
  };
}

export function ensureFSRSState(state: UserMemoryState | null, cardId: string, now = new Date()): UserMemoryState {
  if (state?.fsrs_card) {
    return {
      ...state,
      scheduler: FSRS_SCHEDULER,
      scheduler_version: state.scheduler_version ?? FSRS_SCHEDULER_VERSION
    };
  }

  if (!state) {
    return createInitialMemoryState(cardId, now);
  }

  const fsrsCard = createEmptyCard(new Date(state.due_at || now));
  fsrsCard.reps = state.review_count;
  fsrsCard.lapses = state.lapse_count;
  fsrsCard.stability = state.stability;
  fsrsCard.difficulty = state.difficulty;

  return {
    ...state,
    scheduler: FSRS_SCHEDULER,
    scheduler_version: FSRS_SCHEDULER_VERSION,
    fsrs_card: serializeFSRSCard(fsrsCard)
  };
}

export function reviewWithFSRSAudit(previous: UserMemoryState | null, cardId: string, rating: Rating, reviewedAt: Date, options: Partial<FSRSRuntimeOptions> = {}): FSRSAuditReviewResult {
  const runtimeOptions = normalizeOptions(options);
  const ensured = ensureFSRSState(previous, cardId, reviewedAt);
  const fsrsCard = restoreFSRSCard(ensured.fsrs_card as SerializedFSRSCard);
  const scheduler = createScheduler(runtimeOptions);
  const rawNext = scheduler.next(fsrsCard, reviewedAt, ratingToFSRS[rating]).card;
  const next = applyRuntimeLimits(rawNext, rating, reviewedAt, runtimeOptions);
  const rawStage = mapRawFSRSState(rawNext);
  const stage = mapAdaptedFSRSState(next, rating);

  return {
    fsrs_raw_state_after: toMemoryState(cardId, rawNext, reviewedAt, scheduler, rawStage),
    state_after: toMemoryState(cardId, next, reviewedAt, scheduler, stage)
  };
}

export function reviewWithFSRS(previous: UserMemoryState | null, cardId: string, rating: Rating, reviewedAt: Date, options: Partial<FSRSRuntimeOptions> = {}): UserMemoryState {
  return reviewWithFSRSAudit(previous, cardId, rating, reviewedAt, options).state_after;
}

function formatInterval(target: Date, now: Date): string {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) {
    return '现在';
  }

  if (minutes < 60) {
    return `${minutes} 分钟`;
  }

  const hours = Math.round(minutes / 60);
  if (hours < 24) {
    return `${hours} 小时`;
  }

  const days = Math.round(hours / 24);
  if (days < 30) {
    return `${days} 天`;
  }

  const months = Math.round(days / 30);
  if (months < 12) {
    return `${months} 个月`;
  }

  return `${Math.round(months / 12)} 年`;
}

export function previewReviewIntervals(previous: UserMemoryState | null, cardId: string, reviewedAt: Date, options: Partial<FSRSRuntimeOptions> = {}): Record<Rating, string> {
  const runtimeOptions = normalizeOptions(options);
  const ensured = ensureFSRSState(previous, cardId, reviewedAt);
  const fsrsCard = restoreFSRSCard(ensured.fsrs_card as SerializedFSRSCard);
  const scheduler = createScheduler(runtimeOptions);

  return {
    again: formatInterval(applyRuntimeLimits(scheduler.next(fsrsCard, reviewedAt, ratingToFSRS.again).card, 'again', reviewedAt, runtimeOptions).due, reviewedAt),
    hard: formatInterval(applyRuntimeLimits(scheduler.next(fsrsCard, reviewedAt, ratingToFSRS.hard).card, 'hard', reviewedAt, runtimeOptions).due, reviewedAt),
    good: formatInterval(applyRuntimeLimits(scheduler.next(fsrsCard, reviewedAt, ratingToFSRS.good).card, 'good', reviewedAt, runtimeOptions).due, reviewedAt),
    easy: formatInterval(applyRuntimeLimits(scheduler.next(fsrsCard, reviewedAt, ratingToFSRS.easy).card, 'easy', reviewedAt, runtimeOptions).due, reviewedAt)
  };
}
