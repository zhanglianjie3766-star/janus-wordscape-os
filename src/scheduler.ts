import type { AppData, Rating, ReviewEvent, ReviewMode, UserMemoryState, WordCard } from './types';
import { FSRS_SCHEDULER, FSRS_SCHEDULER_VERSION, ensureFSRSState, reviewWithFSRSAudit } from './fsrsEngine';

const reviewQueueStages = ['reviewing', 'due', 'overdue'];

function isSameLocalDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function isDue(state: UserMemoryState, now = new Date()): boolean {
  return new Date(state.due_at).getTime() <= now.getTime();
}

export function isReviewStageDue(state: UserMemoryState | null | undefined, now = new Date()): boolean {
  if (!state || !reviewQueueStages.includes(state.stage)) {
    return false;
  }

  return isDue(ensureFSRSState(state, state.card_id, now), now);
}

export function getManualDueReviewCardIds(data: AppData, now = new Date()): Set<string> {
  const latestEventsByCard = new Map<string, ReviewEvent>();

  for (const event of data.review_events) {
    const existing = latestEventsByCard.get(event.card_id);
    if (existing && new Date(existing.reviewed_at).getTime() >= new Date(event.reviewed_at).getTime()) {
      continue;
    }
    latestEventsByCard.set(event.card_id, event);
  }

  const ids = new Set<string>();
  for (const [cardId, event] of latestEventsByCard.entries()) {
    if (event.review_mode !== 'browser_detail' || event.rating !== 'again') {
      continue;
    }

    if (isReviewStageDue(data.memory_states[cardId], now)) {
      ids.add(cardId);
    }
  }

  return ids;
}

export function getTodayReviewedDueReviewCardIds(data: AppData, now = new Date()): Set<string> {
  const ids = new Set<string>();
  const manualDueIds = getManualDueReviewCardIds(data, now);

  for (const event of data.review_events) {
    if (event.review_mode !== 'daily_task') {
      continue;
    }

    if (manualDueIds.has(event.card_id)) {
      continue;
    }

    const reviewedAt = new Date(event.reviewed_at);
    if (!isSameLocalDay(reviewedAt, now)) {
      continue;
    }

    if (isReviewStageDue(event.state_before, reviewedAt)) {
      ids.add(event.card_id);
    }
  }

  return ids;
}

function uniqueCards(cards: WordCard[]): WordCard[] {
  const seen = new Set<string>();
  const result: WordCard[] = [];

  for (const card of cards) {
    if (seen.has(card.card_id)) {
      continue;
    }
    seen.add(card.card_id);
    result.push(card);
  }

  return result;
}

function byDueAt(data: AppData, now: Date, prioritizeOverdue: boolean) {
  return (left: WordCard, right: WordCard) => {
    const leftState = ensureFSRSState(data.memory_states[left.card_id] ?? null, left.card_id, now);
    const rightState = ensureFSRSState(data.memory_states[right.card_id] ?? null, right.card_id, now);
    const leftDue = new Date(leftState.due_at).getTime();
    const rightDue = new Date(rightState.due_at).getTime();

    if (prioritizeOverdue) {
      return leftDue - rightDue;
    }

    return Math.abs(leftDue - now.getTime()) - Math.abs(rightDue - now.getTime());
  };
}

function byReviewPriority(data: AppData, now: Date) {
  if (data.learning_plan.review_sort_order === 'low_retrievability') {
    return (left: WordCard, right: WordCard) => {
      const leftState = ensureFSRSState(data.memory_states[left.card_id] ?? null, left.card_id, now);
      const rightState = ensureFSRSState(data.memory_states[right.card_id] ?? null, right.card_id, now);
      const leftRetrievability = leftState.retrievability || 0;
      const rightRetrievability = rightState.retrievability || 0;

      if (leftRetrievability !== rightRetrievability) {
        return leftRetrievability - rightRetrievability;
      }

      return new Date(leftState.due_at).getTime() - new Date(rightState.due_at).getTime();
    };
  }

  return byDueAt(data, now, data.learning_plan.prioritize_overdue);
}

export function getWeakQueue(data: AppData, now = new Date()): WordCard[] {
  if (!data.learning_plan.review_weak_items) {
    return [];
  }

  return data.cards
    .filter((card) => {
      const state = ensureFSRSState(data.memory_states[card.card_id] ?? null, card.card_id, now);
      return state.stage === 'downgrade' || state.stage === 'reinforce' || state.lapse_count >= data.learning_plan.leech_lapse_threshold;
    })
    .sort((left, right) => {
      const leftState = ensureFSRSState(data.memory_states[left.card_id] ?? null, left.card_id, now);
      const rightState = ensureFSRSState(data.memory_states[right.card_id] ?? null, right.card_id, now);
      const leftLeech = leftState.lapse_count >= data.learning_plan.leech_lapse_threshold ? 0 : 1;
      const rightLeech = rightState.lapse_count >= data.learning_plan.leech_lapse_threshold ? 0 : 1;

      if (leftLeech !== rightLeech) {
        return leftLeech - rightLeech;
      }

      return byReviewPriority(data, now)(left, right);
    })
    .slice(0, Math.min(data.learning_plan.daily_weak_limit, data.learning_plan.daily_review_limit));
}

export function getDueReviewQueue(data: AppData, now = new Date()): WordCard[] {
  const weakIds = new Set(getWeakQueue(data, now).map((card) => card.card_id));

  return data.cards
    .filter((card) => {
      const state = ensureFSRSState(data.memory_states[card.card_id] ?? null, card.card_id, now);
      return state.stage !== 'release' && state.stage !== 'new' && state.stage !== 'downgrade' && state.stage !== 'reinforce' && isDue(state, now) && !weakIds.has(card.card_id);
    })
    .sort(byReviewPriority(data, now))
    .slice(0, Math.max(0, data.learning_plan.daily_review_limit - weakIds.size));
}

export function getReviewStageQueue(data: AppData, now = new Date()): WordCard[] {
  const reviewedTodayIds = getTodayReviewedDueReviewCardIds(data, now);
  const remainingLimit = Math.max(0, data.learning_plan.daily_review_limit - reviewedTodayIds.size);
  const manualDueIds = getManualDueReviewCardIds(data, now);

  const dueCards = data.cards
    .filter((card) => {
      const state = data.memory_states[card.card_id];
      return isReviewStageDue(state, now);
    })
    .sort(byReviewPriority(data, now));
  const manualDueCards = dueCards.filter((card) => manualDueIds.has(card.card_id));
  const regularDueCards = dueCards.filter((card) => !manualDueIds.has(card.card_id)).slice(0, remainingLimit);

  return uniqueCards([...manualDueCards, ...regularDueCards]);
}

export function getNewCardQueue(data: AppData): WordCard[] {
  if (data.learning_plan.pause_new_cards) {
    return [];
  }

  return data.cards.filter((card) => data.memory_states[card.card_id]?.stage === 'new').slice(0, data.learning_plan.daily_new_limit);
}

export function getTodayQueue(data: AppData, now = new Date()): WordCard[] {
  return uniqueCards([...getWeakQueue(data, now), ...getDueReviewQueue(data, now), ...getNewCardQueue(data)]);
}

export function applyReview(data: AppData, card: WordCard, rating: Rating, responseTimeMs: number, reviewMode: ReviewMode = 'daily_task'): AppData {
  const now = new Date();
  const previous = data.memory_states[card.card_id] ?? null;
  const stateBefore = ensureFSRSState(previous, card.card_id, now);
  const audit = reviewWithFSRSAudit(stateBefore, card.card_id, rating, now, {
    target_retention: data.learning_plan.target_retention,
    maximum_interval_days: data.learning_plan.maximum_interval_days,
    relearning_interval_minutes: data.learning_plan.relearning_interval_minutes,
    leech_lapse_threshold: data.learning_plan.leech_lapse_threshold
  });
  const nextState = applyProductReviewAdapter(audit.state_after, rating, reviewMode, now);
  const event: ReviewEvent = {
    review_event_id: `${card.card_id}-${now.getTime()}`,
    card_id: card.card_id,
    reviewed_at: now.toISOString(),
    rating,
    response_time_ms: responseTimeMs,
    review_mode: reviewMode,
    scheduler: FSRS_SCHEDULER,
    scheduler_version: FSRS_SCHEDULER_VERSION,
    state_before: stateBefore,
    fsrs_raw_state_after: audit.fsrs_raw_state_after,
    state_after: nextState
  };

  return {
    ...data,
    review_events: [event, ...data.review_events],
    memory_states: {
      ...data.memory_states,
      [card.card_id]: nextState
    },
    updated_at: now.toISOString()
  };
}

function applyProductReviewAdapter(state: UserMemoryState, rating: Rating, reviewMode: ReviewMode, reviewedAt: Date): UserMemoryState {
  if (reviewMode !== 'browser_detail' || rating !== 'again') {
    return state;
  }

  const dueAt = new Date(reviewedAt.getTime() - 60_000).toISOString();
  return {
    ...state,
    stage: 'due',
    due_at: dueAt,
    recommended_action: 'due'
  };
}
