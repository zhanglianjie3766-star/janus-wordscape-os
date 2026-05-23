import type { AppData, FrequencyTier, MemoryStage, WordCard } from './types';

export type IntegritySeverity = 'error' | 'warning';

export interface IntegrityIssue {
  severity: IntegritySeverity;
  code: string;
  message: string;
  card_id?: string;
  field?: string;
}

export interface IntegrityReport {
  checked_at: string;
  status: 'pass' | 'warning' | 'error';
  summary: {
    cards: number;
    domain_packs: number;
    packages: number;
    review_events: number;
    memory_states: number;
    errors: number;
    warnings: number;
  };
  issues: IntegrityIssue[];
}

const frequencyTiers: FrequencyTier[] = ['F1', 'F2', 'F3', 'F4'];
const memoryStages: MemoryStage[] = ['new', 'learning', 'reviewing', 'reinforce', 'downgrade', 'release', 'due', 'overdue'];

function isNonEmptyText(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function addIssue(issues: IntegrityIssue[], severity: IntegritySeverity, code: string, message: string, card_id?: string, field?: string) {
  issues.push({ severity, code, message, card_id, field });
}

function checkCardContent(card: WordCard, knownPackIds: Set<string>, issues: IntegrityIssue[]) {
  const requiredTextFields: Array<keyof WordCard> = ['card_id', 'headword', 'definition_zh', 'definition_en', 'part_of_speech', 'domain_pack_id'];

  for (const field of requiredTextFields) {
    if (!isNonEmptyText(card[field])) {
      addIssue(issues, 'error', 'card.required_field_missing', `词卡必填字段 ${field} 为空。`, card.card_id, field);
    }
  }

  if (!knownPackIds.has(card.domain_pack_id)) {
    addIssue(issues, 'error', 'card.unknown_domain_pack', `词卡所属领域包 ${card.domain_pack_id} 未注册。`, card.card_id, 'domain_pack_id');
  }

  if (!frequencyTiers.includes(card.frequency_tier)) {
    addIssue(issues, 'error', 'card.invalid_frequency_tier', `词频等级必须是 ${frequencyTiers.join(', ')} 之一。`, card.card_id, 'frequency_tier');
  }

  if (!Array.isArray(card.examples) || card.examples.length < 2) {
    addIssue(issues, 'error', 'card.examples_too_few', '每张导入词卡至少需要 2 条例句。', card.card_id, 'examples');
  } else {
    card.examples.forEach((example, index) => {
      if (!isNonEmptyText(example.example_en)) {
        addIssue(issues, 'error', 'card.example_en_missing', `第 ${index + 1} 条例句缺少英文内容。`, card.card_id, 'examples');
      }
      if (!isNonEmptyText(example.example_zh)) {
        addIssue(issues, 'error', 'card.example_zh_missing', `第 ${index + 1} 条例句缺少中文翻译。`, card.card_id, 'examples');
      }
    });
  }

  if (!Array.isArray(card.scene_tags) || card.scene_tags.length === 0) {
    addIssue(issues, 'warning', 'card.scene_tags_missing', '词卡缺少场景标签，会削弱牌组筛选和图谱过滤效果。', card.card_id, 'scene_tags');
  }

  if (!Array.isArray(card.usage_tasks) || card.usage_tasks.length === 0) {
    addIssue(issues, 'warning', 'card.usage_tasks_missing', '词卡缺少使用任务，会削弱真实使用场景下的学习引导。', card.card_id, 'usage_tasks');
  }

  if (!card.source || !isNonEmptyText(card.source.source_id) || !isNonEmptyText(card.source.source_name)) {
    addIssue(issues, 'error', 'card.source_identity_missing', '词卡必须包含来源 ID 和来源名称。', card.card_id, 'source');
  }

  if (!card.source?.source_url || !isValidUrl(card.source.source_url)) {
    addIssue(issues, 'warning', 'card.source_url_invalid', '词卡来源链接为空，或不是有效的 http(s) 链接。', card.card_id, 'source.source_url');
  }
}

export function buildIntegrityReport(data: AppData): IntegrityReport {
  const issues: IntegrityIssue[] = [];
  const cardIds = new Set<string>();
  const knownPackIds = new Set(data.domain_packs.map((pack) => pack.domain_pack_id));
  const headwordByPack = new Map<string, Set<string>>();

  data.cards.forEach((card) => {
    if (cardIds.has(card.card_id)) {
      addIssue(issues, 'error', 'card.duplicate_card_id', `存在重复的 card_id：${card.card_id}。`, card.card_id, 'card_id');
    }
    cardIds.add(card.card_id);

    const headwordKey = card.headword.trim().toLowerCase();
    const packHeadwords = headwordByPack.get(card.domain_pack_id) ?? new Set<string>();
    if (headwordKey && packHeadwords.has(headwordKey)) {
      addIssue(issues, 'warning', 'card.duplicate_headword_in_pack', `单词 ${card.headword} 在 ${card.domain_pack_id} 中出现了多次。`, card.card_id, 'headword');
    }
    packHeadwords.add(headwordKey);
    headwordByPack.set(card.domain_pack_id, packHeadwords);

    checkCardContent(card, knownPackIds, issues);

    const state = data.memory_states[card.card_id];
    if (!state) {
      addIssue(issues, 'error', 'memory_state.missing_for_card', '词卡缺少 UserMemoryState，无法安全进入复习排程。', card.card_id, 'memory_states');
    }
  });

  Object.values(data.memory_states).forEach((state) => {
    if (!cardIds.has(state.card_id)) {
      addIssue(issues, 'warning', 'memory_state.orphan', '存在指向已不存在词卡的 UserMemoryState。', state.card_id, 'memory_states');
    }

    if (!memoryStages.includes(state.stage)) {
      addIssue(issues, 'error', 'memory_state.invalid_stage', `无效的记忆阶段：${state.stage}。`, state.card_id, 'stage');
    }

    if (!state.due_at || Number.isNaN(new Date(state.due_at).getTime())) {
      addIssue(issues, 'error', 'memory_state.invalid_due_at', '记忆状态缺少有效的 due_at 到期时间。', state.card_id, 'due_at');
    }
  });

  data.review_events.forEach((event) => {
    if (!cardIds.has(event.card_id)) {
      addIssue(issues, 'warning', 'review_event.orphan', '存在指向已不存在词卡的 ReviewEvent。', event.card_id, 'review_events');
    }
  });

  if (data.cards.length > 0 && data.import_reports.length === 0) {
    addIssue(issues, 'warning', 'import_report.missing', '当前已有词卡，但缺少导入报告历史。');
  }

  const errors = issues.filter((item) => item.severity === 'error').length;
  const warnings = issues.filter((item) => item.severity === 'warning').length;

  return {
    checked_at: new Date().toISOString(),
    status: errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'pass',
    summary: {
      cards: data.cards.length,
      domain_packs: data.domain_packs.length,
      packages: data.packages.length,
      review_events: data.review_events.length,
      memory_states: Object.keys(data.memory_states).length,
      errors,
      warnings
    },
    issues
  };
}
