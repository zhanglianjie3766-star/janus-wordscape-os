import type { FrequencyTier } from './types';

export const frequencyTierOptions: FrequencyTier[] = ['F1', 'F2', 'F3', 'F4'];

const frequencyTierLabels: Record<FrequencyTier, string> = {
  F1: 'F1高',
  F2: 'F2中高',
  F3: 'F3中',
  F4: 'F4低'
};

export function formatFrequencyTier(tier: FrequencyTier | string | undefined) {
  if (!tier) {
    return '未设置';
  }

  return frequencyTierLabels[tier as FrequencyTier] ?? tier;
}
