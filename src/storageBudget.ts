import type { AppData } from './types';

export interface StorageBudgetReport {
  checked_at: string;
  status: 'pass' | 'watch' | 'risk';
  estimated_bytes: number;
  estimated_mb: number;
  card_count: number;
  review_event_count: number;
  memory_state_count: number;
  warning: string;
}

function byteLength(value: string): number {
  return new Blob([value]).size;
}

export function buildStorageBudgetReport(data: AppData): StorageBudgetReport {
  const estimatedBytes = byteLength(JSON.stringify(data));
  const estimatedMb = Number((estimatedBytes / 1024 / 1024).toFixed(2));
  let status: StorageBudgetReport['status'] = 'pass';
  let warning = '当前学习数据仍在本地浏览器存储预算内。';

  if (estimatedMb >= 3) {
    status = 'watch';
    warning = '学习数据已经偏大，请保持备份更新。';
  }

  if (estimatedMb >= 4.5) {
    status = 'risk';
    warning = '学习数据已接近本地浏览器存储风险区，继续扩大前请先导出备份，并优先采用更稳固的 IndexedDB 或远程持久化方案。';
  }

  return {
    checked_at: new Date().toISOString(),
    status,
    estimated_bytes: estimatedBytes,
    estimated_mb: estimatedMb,
    card_count: data.cards.length,
    review_event_count: data.review_events.length,
    memory_state_count: Object.keys(data.memory_states).length,
    warning
  };
}
