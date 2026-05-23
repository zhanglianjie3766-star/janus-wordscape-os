import { getDueReviewQueue, getTodayQueue, getWeakQueue } from './scheduler';
import type { AppData } from './types';

export interface QueueForecastPoint {
  label: string;
  offset_days: number;
  date: string;
  today_queue: number;
  due_reviews: number;
  weak_items: number;
}

export interface SessionDriftReport {
  checked_at: string;
  status: 'pass' | 'watch' | 'risk';
  total_cards: number;
  review_events: number;
  weak_items_total: number;
  weak_items_scheduled: number;
  weak_queue_capped: boolean;
  daily_review_limit: number;
  daily_weak_limit: number;
  backup_recovery_ready: boolean;
  overload_risk: 'low' | 'medium' | 'high';
  forecast: QueueForecastPoint[];
  notes: string[];
}

const forecastOffsets = [0, 1, 3, 7, 14, 30];

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function queuePoint(data: AppData, now: Date, offsetDays: number): QueueForecastPoint {
  const date = addDays(now, offsetDays);
  const weakItems = getWeakQueue(data, date);

  return {
    label: offsetDays === 0 ? '今天' : `+${offsetDays} 天`,
    offset_days: offsetDays,
    date: formatDate(date),
    today_queue: getTodayQueue(data, date).length,
    due_reviews: getDueReviewQueue(data, date).length,
    weak_items: weakItems.length
  };
}

export function buildSessionDriftReport(data: AppData, now = new Date()): SessionDriftReport {
  const allWeakItems = data.cards.filter((card) => {
    const stage = data.memory_states[card.card_id]?.stage;
    return stage === 'downgrade' || stage === 'reinforce';
  });
  const scheduledWeakItems = getWeakQueue(data, now);
  const weakQueueCapped = allWeakItems.length > scheduledWeakItems.length;
  const forecast = forecastOffsets.map((days) => queuePoint(data, now, days));
  const maxForecastQueue = Math.max(...forecast.map((point) => point.today_queue), 0);
  const backupRecoveryReady = data.cards.length > 0 && data.review_events.length > 0 && Object.keys(data.memory_states).length >= data.cards.length;
  const notes: string[] = [];

  let overloadRisk: SessionDriftReport['overload_risk'] = 'low';
  if (data.cards.length >= 1000 || maxForecastQueue > data.learning_plan.daily_review_limit + data.learning_plan.daily_new_limit) {
    overloadRisk = 'medium';
  }
  if (data.cards.length >= 2000 || maxForecastQueue > (data.learning_plan.daily_review_limit + data.learning_plan.daily_new_limit) * 2) {
    overloadRisk = 'high';
  }

  if (weakQueueCapped) {
    notes.push('弱项队列已被当前每日弱项/复习上限截断。');
  }
  if (!backupRecoveryReady) {
    notes.push('备份恢复还未完全验证：需要同时存在词卡和 ReviewEvent 复习记录。');
  }
  if (overloadRisk !== 'low') {
    notes.push(`大词卡包负载风险为 ${overloadRisk}，建议保持保守的每日学习上限。`);
  }
  if (forecast.some((point) => point.due_reviews >= data.learning_plan.daily_review_limit)) {
    notes.push('未来队列中至少有一个时间点会触达每日复习上限。');
  }

  const status: SessionDriftReport['status'] =
    overloadRisk === 'high' || !backupRecoveryReady
      ? 'risk'
      : weakQueueCapped || overloadRisk === 'medium'
        ? 'watch'
        : 'pass';

  return {
    checked_at: now.toISOString(),
    status,
    total_cards: data.cards.length,
    review_events: data.review_events.length,
    weak_items_total: allWeakItems.length,
    weak_items_scheduled: scheduledWeakItems.length,
    weak_queue_capped: weakQueueCapped,
    daily_review_limit: data.learning_plan.daily_review_limit,
    daily_weak_limit: data.learning_plan.daily_weak_limit,
    backup_recovery_ready: backupRecoveryReady,
    overload_risk: overloadRisk,
    forecast,
    notes
  };
}
