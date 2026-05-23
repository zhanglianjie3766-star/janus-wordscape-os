import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Folder,
  GitBranch,
  Play,
  Plus,
  RotateCcw,
  Settings,
  Volume2
} from 'lucide-react';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { defaultDomainPacks, getPackName } from './domainPacks';
import { formatFrequencyTier, frequencyTierOptions } from './frequencyTiers';
import { previewReviewIntervals } from './fsrsEngine';
import { importPackage, parsePackageText } from './importer';
import { getCardPhonetic, getPronunciationAccentLabel, playCardPronunciation } from './pronunciation';
import { applyReview, getReviewStageQueue, isReviewStageDue } from './scheduler';
import { createBackup, hasLastImportRollback, loadData, loadLastImportRollbackAsync, loadPersistedData, normalizeAppData, resetData, saveData, saveLastImportRollback, type PersistenceLoadSource } from './storage';
import { loadUserProfile, saveUserProfile, type UserProfile } from './userProfile';
import type { AppData, DomainPack, FrequencyTier, ImportResult, Rating, WordCard } from './types';

type ViewKey = 'today' | 'decks' | 'review' | 'browser' | 'galaxy' | 'stats' | 'settings';
type TopNavKey = 'today' | 'decks' | 'stats' | 'galaxy' | 'settings';

const ALL_DECK_ID = 'all';
const APP_DISPLAY_NAME = '雅努斯词境 OS';

const LazyReviewView = lazy(() => import('./views/ReviewView'));
const LazyBrowserView = lazy(() => import('./views/BrowserView'));
const LazyGalaxyView = lazy(() => import('./views/GalaxyView'));
const LazySettingsView = lazy(() => import('./views/SettingsView'));
const LazyStatsView = lazy(() => import('./views/StatsView'));

const navItems: Array<{ key: TopNavKey; label: string; icon: typeof Activity }> = [
  { key: 'today', label: '今日', icon: CalendarDays },
  { key: 'decks', label: '单词本', icon: BookOpen },
  { key: 'stats', label: '统计', icon: BarChart3 },
  { key: 'galaxy', label: '图谱', icon: GitBranch },
  { key: 'settings', label: '设置', icon: Settings }
];

const mobileNavItems = navItems;

function getTopNavKey(view: ViewKey): TopNavKey {
  if (view === 'review') {
    return 'today';
  }
  if (view === 'browser') {
    return 'decks';
  }
  return view;
}
type PersistenceUiStatus = {
  source: PersistenceLoadSource | 'loading';
  migrated_from_localstorage: boolean;
  error?: string;
};

function LazyViewFallback({ title }: { title: string }) {
  return (
    <section className="rounded-lg border border-line bg-white p-6 text-center shadow-sm">
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="mt-2 text-sm text-muted">Loading module...</p>
    </section>
  );
}

function formatDue(value?: string) {
  if (!value) {
    return '未排程';
  }

  const now = Date.now();
  const due = new Date(value).getTime();
  const diff = due - now;
  const absMinutes = Math.max(1, Math.round(Math.abs(diff) / 60000));
  const prefix = diff < 0 ? '逾期 ' : '';

  if (absMinutes < 60) {
    return `${prefix}${absMinutes} 分钟`;
  }

  const hours = Math.round(absMinutes / 60);
  if (hours < 24) {
    return `${prefix}${hours} 小时`;
  }

  const days = Math.round(hours / 24);
  return `${prefix}${days} 天`;
}

function stageLabel(stage?: string) {
  const labels: Record<string, string> = {
    new: '新卡',
    learning: '学习中',
    reviewing: '复习中',
    reinforce: '巩固',
    downgrade: '降级',
    release: '放行',
    due: '到期',
    overdue: '逾期'
  };

  return labels[stage ?? 'new'] ?? stage ?? '新卡';
}

function stagePillClass(stage?: string) {
  const classes: Record<string, string> = {
    new: 'bg-slate-100 text-slate-600',
    learning: 'bg-amber-50 text-amber-700',
    reviewing: 'bg-brand/10 text-brand',
    reinforce: 'bg-amber-50 text-amber-700',
    downgrade: 'bg-amber-50 text-amber-700',
    release: 'bg-sky-50 text-sky-700',
    due: 'bg-brand/10 text-brand',
    overdue: 'bg-brand/10 text-brand'
  };

  return classes[stage ?? 'new'] ?? classes.new;
}

function getDeckStats(data: AppData, domainPackId: string) {
  const cards = data.cards.filter((card) => card.domain_pack_id === domainPackId);
  const states = cards.map((card) => data.memory_states[card.card_id]);
  const now = Date.now();

  return {
    cards,
    total: cards.length,
    new: states.filter((state) => state?.stage === 'new').length,
    learning: states.filter((state) => state?.stage === 'learning').length,
    review: states.filter((state) => state && ['reviewing', 'due', 'overdue'].includes(state.stage)).length,
    weak: states.filter((state) => state && ['reinforce', 'downgrade'].includes(state.stage)).length,
    release: states.filter((state) => state?.stage === 'release').length,
    overdue: states.filter((state) => state?.due_at && new Date(state.due_at).getTime() < now && state.stage !== 'new' && state.stage !== 'release').length
  };
}

const packShortName: Record<string, string> = {
  'ai-programming-english': 'AI编程',
  'web3-developer-english': 'Web3',
  'programming-language-runtime-english': '语言运行时',
  'ai-platform-model-tools-english': 'AI平台',
  'developer-cloud-collaboration-english': '云与协作',
  'product-design-creative-tools-english': '设计创作'
};

const sceneDisplayName: Record<string, string> = {
  ide_editor: 'IDE界面',
  ai_code_assistant: 'AI代码助手',
  agentic_coding: 'AI代理编程',
  git_version_control: '版本控制',
  cli_terminal: '命令行终端',
  debugging: '调试排错',
  technical_docs: '技术文档',
  wallet: '钱包',
  smart_contract: '智能合约',
  defi: 'DeFi',
  rpc: 'RPC节点',
  block_explorer: '区块浏览器',
  security: '安全审计',
  on_chain_development: '链上开发',
  python: 'Python',
  typescript_javascript: 'TS/JS',
  node_runtime: 'Node运行时',
  shell: 'Shell',
  yaml: 'YAML',
  frameworks: '框架',
  dependencies: '依赖管理',
  build_tools: '构建工具',
  model_api: '模型API',
  console: '控制台',
  tokens: 'Token',
  context_window: '上下文窗口',
  billing: '账号计费',
  account: '账户',
  api_keys: 'API密钥',
  model_docs: '模型文档',
  github: 'GitHub',
  cloud: '云服务',
  permissions: '权限',
  files: '文件协作',
  collaboration: '协作',
  deployment_environment: '部署环境',
  workspace_admin: '工作区管理',
  figma: 'Figma',
  gamma: 'Gamma',
  lovart: 'Lovart',
  prototype: '原型',
  canvas: '画布',
  presentation: '演示',
  generative_design: '生成式设计',
  creative_workflow: '创作流程',
  ungrouped: '未分组'
};

function formatSceneLabel(scene: string) {
  return sceneDisplayName[scene] ?? scene.replace(/[_-]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
}

function clampDisplayLabel(label: string, maxChars: number) {
  const chars = Array.from(label);
  if (chars.length <= maxChars) {
    return label;
  }

  return `${chars.slice(0, Math.max(1, maxChars - 1)).join('')}…`;
}

function formatPrimarySceneNavLabel(label: string) {
  return clampDisplayLabel(label, 5);
}

function formatSecondarySceneNavLabel(label: string) {
  return clampDisplayLabel(label, 7);
}

function makeUiDemoWordCard(domainPackId: string, scene: string, index: number): WordCard {
  const sceneLabel = formatSceneLabel(scene);
  const sceneToken = scene.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase();
  const demoTerms = ['signal', 'workflow', 'checkpoint'];
  const term = demoTerms[index - 1] ?? `term-${index}`;

  return {
    card_id: `ui-demo-${domainPackId}-${sceneToken}-${String(index).padStart(3, '0')}`,
    headword: `${sceneToken}-${term}`,
    definition_zh: `UI 演示词：用于预览“${sceneLabel}”场景文件夹的第 ${index} 个测试词。`,
    definition_en: `A UI-only demo word for previewing the ${sceneLabel} scene folder.`,
    part_of_speech: 'noun',
    examples: [
      {
        example_en: `Use this ${term} to inspect the ${sceneLabel} browsing layout.`,
        example_zh: `使用这个 ${term} 检查“${sceneLabel}”浏览布局。`,
        context: 'UI demo'
      },
      {
        example_en: `The ${sceneLabel} folder keeps three demo cards for interface testing.`,
        example_zh: `“${sceneLabel}”文件夹保留 3 张演示卡用于界面测试。`,
        context: 'UI demo'
      }
    ],
    source: {
      source_id: 'techlex-ui-demo',
      source_name: 'TechLex OS UI Demo',
      source_url: 'https://techlex-os.local/ui-demo',
      source_type: 'other',
      source_priority: 'P4'
    },
    domain_pack_id: domainPackId,
    scene_tags: [scene],
    frequency_tier: 'F4',
    usage_tasks: [`Preview the ${sceneLabel} folder, word list, and card detail UI.`],
    synonyms: ['demo', 'mock'],
    confusing_words: ['real card'],
    word_family: ['demoing', 'demonstration'],
    tags: ['ui-demo', `scene/${scene}`],
    links: [],
    aliases: [],
    notes: 'UI-only demo card. It is generated in memory and is not persisted.'
  };
}

function createUiDemoNotebookData(data: AppData): AppData {
  const cards = defaultDomainPacks.flatMap((pack) => (pack.scenes ?? []).flatMap((scene) => [1, 2, 3].map((index) => makeUiDemoWordCard(pack.domain_pack_id, scene, index))));
  const dueAt = '2099-01-01T00:00:00.000Z';
  const memoryStates: AppData['memory_states'] = {};

  cards.forEach((card) => {
    memoryStates[card.card_id] = {
      card_id: card.card_id,
      stage: 'new',
      difficulty: 0,
      stability: 0,
      retrievability: 1,
      due_at: dueAt,
      review_count: 0,
      lapse_count: 0,
      recommended_action: 'new'
    };
  });

  return {
    ...data,
    domain_packs: defaultDomainPacks,
    cards,
    review_events: [],
    memory_states: memoryStates
  };
}

function isUiDemoCard(card: WordCard) {
  return card.card_id.startsWith('ui-demo-');
}

function getPackShortName(pack: DomainPack) {
  return packShortName[pack.domain_pack_id] ?? pack.name.replace(/\s*English$/i, '');
}

function getCardsForPack(data: AppData, domainPackId: string) {
  return data.cards.filter((card) => card.domain_pack_id === domainPackId);
}

type DeckProgressStats = {
  total: number;
  unlearned: number;
  learning: number;
  review: number;
};

function countDeckProgress(data: AppData, cards: WordCard[]): DeckProgressStats {
  return cards.reduce(
    (stats, card) => {
      const state = data.memory_states[card.card_id];
      const stage = state?.stage ?? 'new';
      stats.total += 1;
      if (stage === 'new') {
        stats.unlearned += 1;
      } else if (isReviewStageDue(state, new Date())) {
        stats.review += 1;
      } else if (['learning', 'reinforce', 'downgrade', 'reviewing', 'due', 'overdue'].includes(stage)) {
        stats.learning += 1;
      }
      return stats;
    },
    { total: 0, unlearned: 0, learning: 0, review: 0 }
  );
}

function getPackStats(data: AppData, domainPackId: string) {
  return countDeckProgress(data, getCardsForPack(data, domainPackId));
}

function getSceneStats(data: AppData, domainPackId: string, scene: string) {
  return countDeckProgress(
    data,
    getCardsForPack(data, domainPackId).filter((card) => {
      const scenes = card.scene_tags.length > 0 ? card.scene_tags : ['ungrouped'];
      return scenes.includes(scene);
    })
  );
}

function getAllSceneStats(data: AppData, scene: string) {
  return countDeckProgress(
    data,
    data.cards.filter((card) => {
      const scenes = card.scene_tags.length > 0 ? card.scene_tags : ['ungrouped'];
      return scenes.includes(scene);
    })
  );
}

function getDeckTreeStats(data: AppData) {
  return countDeckProgress(data, data.cards);
}

function getCardsForAllScenes(data: AppData, selectedScene?: string | null) {
  if (!selectedScene) {
    return data.cards;
  }

  return data.cards.filter((card) => {
    const scenes = card.scene_tags.length > 0 ? card.scene_tags : ['ungrouped'];
    return scenes.includes(selectedScene);
  });
}

type SceneFolder = {
  scene: string;
  label: string;
  cards: WordCard[];
  stats: DeckProgressStats;
  newCount: number;
  dueCount: number;
  weakCount: number;
  releaseCount: number;
};

type SceneStatusFilter = 'all' | 'unlearned' | 'learning' | 'review' | 'mastered';
type SceneRangeKind = 'all' | 'packScenes' | 'scene';
type SceneFrequencyFilter = 'all' | FrequencyTier;
type SceneFrequencySelection = FrequencyTier[];
type CardLearningBucket = Exclude<SceneStatusFilter, 'all'>;

const sceneStatusFilters: Array<{ key: SceneStatusFilter; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'unlearned', label: '未学习' },
  { key: 'learning', label: '学习中' },
  { key: 'review', label: '待复习' },
  { key: 'mastered', label: '已掌握' }
];

function getCardLearningBucket(data: AppData, card: WordCard): CardLearningBucket {
  const state = data.memory_states[card.card_id];
  const stage = state?.stage ?? 'new';
  if (stage === 'new') {
    return 'unlearned';
  }
  if (isReviewStageDue(state, new Date())) {
    return 'review';
  }
  if (['learning', 'reinforce', 'downgrade', 'reviewing', 'due', 'overdue'].includes(stage)) {
    return 'learning';
  }
  return 'mastered';
}

function sceneBucketLabel(bucket: CardLearningBucket) {
  const labels: Record<CardLearningBucket, string> = {
    unlearned: '未学习',
    learning: '学习中',
    review: '待复习',
    mastered: '已掌握'
  };

  return labels[bucket];
}

function sceneBucketPillClass(bucket: CardLearningBucket) {
  const classes: Record<CardLearningBucket, string> = {
    unlearned: 'bg-slate-100 text-slate-600',
    learning: 'bg-amber-50 text-amber-700',
    review: 'bg-brand/10 text-brand',
    mastered: 'bg-sky-50 text-sky-700'
  };

  return classes[bucket];
}

function cardMatchesSceneFilter(data: AppData, card: WordCard, filter: SceneStatusFilter) {
  if (filter === 'all') {
    return true;
  }

  return getCardLearningBucket(data, card) === filter;
}

function getSceneFilterCounts(data: AppData, cards: WordCard[]): Record<SceneStatusFilter, number> {
  const counts: Record<SceneStatusFilter, number> = {
    all: cards.length,
    unlearned: 0,
    learning: 0,
    review: 0,
    mastered: 0
  };

  for (const card of cards) {
    const bucket = getCardLearningBucket(data, card);
    counts[bucket] += 1;
  }

  return counts;
}

function sortCardsByInsertionDesc(cards: WordCard[], orderByCardId: Map<string, number>) {
  return [...cards].sort((left, right) => {
    const leftOrder = orderByCardId.get(left.card_id) ?? -1;
    const rightOrder = orderByCardId.get(right.card_id) ?? -1;

    if (leftOrder !== rightOrder) {
      return rightOrder - leftOrder;
    }

    return left.headword.localeCompare(right.headword, 'en');
  });
}

function getFrequencySelectionLabel(selection: SceneFrequencySelection) {
  if (selection.length === 0) {
    return '全部';
  }

  return frequencyTierOptions.filter((tier) => selection.includes(tier)).map(formatFrequencyTier).join('/');
}

function getSceneRangeTitle(kind: SceneRangeKind, pack: DomainPack | undefined, scene: string | null) {
  if (kind === 'all') {
    return '全部';
  }
  if (kind === 'scene') {
    return scene ? formatSceneLabel(scene) : '二级场景';
  }
  if (!pack) {
    return '一级场景';
  }
  return getPackShortName(pack);
}

function sceneFilterActionLabel(filter: SceneStatusFilter) {
  if (filter === 'review') {
    return '开始场景复习';
  }

  if (filter === 'unlearned') {
    return '开始学习新词';
  }

  if (filter === 'learning') {
    return '继续学习';
  }

  if (filter === 'mastered') {
    return '巩固已掌握';
  }

  return '开始学习';
}

function getSceneFolders(data: AppData, pack: DomainPack): SceneFolder[] {
  const cards = getCardsForPack(data, pack.domain_pack_id);
  const sceneOrder = new Map<string, number>();
  (pack.scenes ?? []).forEach((scene, index) => sceneOrder.set(scene, index));
  const byScene = new Map<string, WordCard[]>();

  for (const scene of pack.scenes ?? []) {
    byScene.set(scene, []);
  }

  for (const card of cards) {
    const scenes = card.scene_tags.length > 0 ? card.scene_tags : ['ungrouped'];
    for (const scene of scenes) {
      byScene.set(scene, [...(byScene.get(scene) ?? []), card]);
    }
  }

  const folders = Array.from(byScene.entries())
    .filter(([, sceneCards]) => sceneCards.length > 0 || cards.length === 0)
    .map(([scene, sceneCards]) => {
      const states = sceneCards.map((card) => data.memory_states[card.card_id]);
      return {
        scene,
        label: formatSceneLabel(scene),
        cards: sceneCards,
        stats: countDeckProgress(data, sceneCards),
        newCount: states.filter((state) => !state || state.stage === 'new').length,
        dueCount: sceneCards.filter((card) => ['due', 'overdue'].includes(dueStateForCard(data, card))).length,
        weakCount: states.filter((state) => state && ['reinforce', 'downgrade'].includes(state.stage)).length,
        releaseCount: states.filter((state) => state?.stage === 'release').length
      };
    });

  return folders.sort((left, right) => {
    const leftOrder = sceneOrder.get(left.scene) ?? 999;
    const rightOrder = sceneOrder.get(right.scene) ?? 999;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return right.cards.length - left.cards.length || left.label.localeCompare(right.label, 'zh-CN');
  });
}

function getAllSceneFolders(data: AppData): SceneFolder[] {
  const sceneOrder = new Map<string, number>();
  data.domain_packs.forEach((pack) => {
    (pack.scenes ?? []).forEach((scene) => {
      if (!sceneOrder.has(scene)) {
        sceneOrder.set(scene, sceneOrder.size);
      }
    });
  });
  const byScene = new Map<string, WordCard[]>();

  for (const card of data.cards) {
    const scenes = card.scene_tags.length > 0 ? card.scene_tags : ['ungrouped'];
    for (const scene of scenes) {
      if (!sceneOrder.has(scene)) {
        sceneOrder.set(scene, sceneOrder.size);
      }
      byScene.set(scene, [...(byScene.get(scene) ?? []), card]);
    }
  }

  const folders = Array.from(byScene.entries()).map(([scene, sceneCards]) => {
    const states = sceneCards.map((card) => data.memory_states[card.card_id]);
    return {
      scene,
      label: formatSceneLabel(scene),
      cards: sceneCards,
      stats: countDeckProgress(data, sceneCards),
      newCount: states.filter((state) => !state || state.stage === 'new').length,
      dueCount: sceneCards.filter((card) => ['due', 'overdue'].includes(dueStateForCard(data, card))).length,
      weakCount: states.filter((state) => state && ['reinforce', 'downgrade'].includes(state.stage)).length,
      releaseCount: states.filter((state) => state?.stage === 'release').length
    };
  });

  return folders.sort((left, right) => {
    const leftOrder = sceneOrder.get(left.scene) ?? 999;
    const rightOrder = sceneOrder.get(right.scene) ?? 999;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }
    return right.cards.length - left.cards.length || left.label.localeCompare(right.label, 'zh-CN');
  });
}

function dueStateForCard(data: AppData, card: WordCard): 'new' | 'overdue' | 'due' | 'future' | 'release' {
  const state = data.memory_states[card.card_id];
  if (!state || state.stage === 'new') {
    return 'new';
  }
  if (state.stage === 'release') {
    return 'release';
  }
  const due = new Date(state.due_at).getTime();
  const now = Date.now();
  if (due < now - 24 * 60 * 60 * 1000) {
    return 'overdue';
  }
  if (due <= now) {
    return 'due';
  }
  return 'future';
}

function DecksView({
  data,
  onRate,
  onWriteDefaultForget,
  onOpenSettings
}: {
  data: AppData;
  onRate: (card: WordCard, rating: Rating, startedAt: number) => void;
  onWriteDefaultForget: (card: WordCard) => void;
  onOpenSettings: () => void;
}) {
  const [selectedPackId, setSelectedPackId] = useState(ALL_DECK_ID);
  const [expandedScene, setExpandedScene] = useState<string | null>(null);
  const [deckMode, setDeckMode] = useState<'folders' | 'scene'>('folders');
  const [activeScene, setActiveScene] = useState<string | null>(null);
  const [rangeSettingsOpen, setRangeSettingsOpen] = useState(false);
  const [sceneRangeKind, setSceneRangeKind] = useState<SceneRangeKind>('scene');
  const [sceneRangePackId, setSceneRangePackId] = useState<string | null>(null);
  const [sceneRangeScene, setSceneRangeScene] = useState<string | null>(null);
  const [sceneFrequencyFilters, setSceneFrequencyFilters] = useState<SceneFrequencySelection>([]);
  const [sceneStatusFilter, setSceneStatusFilter] = useState<SceneStatusFilter>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  const [inlineStudyCardIds, setInlineStudyCardIds] = useState<string[]>([]);
  const [inlineStudyCompletedIds, setInlineStudyCompletedIds] = useState<Set<string>>(() => new Set());
  const [inlineStudyRevealed, setInlineStudyRevealed] = useState(false);
  const [inlineStudyStartedAt, setInlineStudyStartedAt] = useState(Date.now());
  const [writeMessage, setWriteMessage] = useState<{ cardId: string; text: string } | null>(null);
  const isDemoMode = data.cards.length === 0;
  const notebookData = useMemo(() => (isDemoMode ? createUiDemoNotebookData(data) : data), [data, isDemoMode]);
  const isAllDeck = selectedPackId === ALL_DECK_ID;
  const selectedPack = isAllDeck ? null : (notebookData.domain_packs.find((pack) => pack.domain_pack_id === selectedPackId) ?? notebookData.domain_packs[0]);
  const effectiveDeckMode = deckMode;
  const folders = useMemo(() => (isAllDeck ? getAllSceneFolders(notebookData) : selectedPack ? getSceneFolders(notebookData, selectedPack) : []), [notebookData, isAllDeck, selectedPack]);
  const selectedStats = selectedPack ? getDeckStats(notebookData, selectedPack.domain_pack_id) : null;
  const globalStats = useMemo(() => getDeckTreeStats(notebookData), [notebookData]);
  const cardsById = useMemo(() => new Map(notebookData.cards.map((card) => [card.card_id, card])), [notebookData.cards]);
  const cardOrder = useMemo(() => new Map(notebookData.cards.map((card, index) => [card.card_id, index])), [notebookData.cards]);
  const rangePackId = sceneRangePackId ?? selectedPack?.domain_pack_id ?? notebookData.domain_packs[0]?.domain_pack_id ?? null;
  const selectedRangePack = rangePackId ? notebookData.domain_packs.find((pack) => pack.domain_pack_id === rangePackId) : undefined;
  const rangePackSceneOptions = useMemo(() => (selectedRangePack ? getSceneFolders(notebookData, selectedRangePack) : []), [notebookData, selectedRangePack]);
  const rangeScene = sceneRangeScene ?? activeScene;
  const activeSceneCards = useMemo(() => {
    let cards: WordCard[] = [];
    if (sceneRangeKind === 'all') {
      cards = notebookData.cards;
    } else if (sceneRangeKind === 'packScenes') {
      cards = selectedRangePack ? getCardsForPack(notebookData, selectedRangePack.domain_pack_id) : [];
    } else if (rangeScene) {
      cards = getCardsForAllScenes(notebookData, rangeScene);
    }

    const frequencyFiltered = sceneFrequencyFilters.length === 0 ? cards : cards.filter((card) => sceneFrequencyFilters.includes(card.frequency_tier));
    return sortCardsByInsertionDesc(frequencyFiltered, cardOrder);
  }, [cardOrder, notebookData, rangeScene, sceneFrequencyFilters, sceneRangeKind, selectedRangePack]);
  const sceneFilterCounts = useMemo(() => getSceneFilterCounts(notebookData, activeSceneCards), [activeSceneCards, notebookData]);
  const filteredSceneCards = useMemo(
    () => activeSceneCards.filter((card) => cardMatchesSceneFilter(notebookData, card, sceneStatusFilter)),
    [activeSceneCards, notebookData, sceneStatusFilter]
  );
  const activeSceneLabel = getSceneRangeTitle(sceneRangeKind, selectedRangePack, rangeScene);
  const activeFrequencyLabel = getFrequencySelectionLabel(sceneFrequencyFilters);
  const inlineStudyActive = inlineStudyCardIds.length > 0;
  const inlineStudyCurrentCard = useMemo(() => {
    for (const cardId of inlineStudyCardIds) {
      if (!inlineStudyCompletedIds.has(cardId)) {
        return cardsById.get(cardId) ?? null;
      }
    }

    return null;
  }, [cardsById, inlineStudyCardIds, inlineStudyCompletedIds]);
  const inlineStudyDone = inlineStudyActive && !inlineStudyCurrentCard;
  const inlineStudyCompletedCount = inlineStudyCompletedIds.size;
  const currentScene = effectiveDeckMode === 'scene' ? activeScene : expandedScene;
  const currentScopeStats = isAllDeck
    ? currentScene
      ? getAllSceneStats(notebookData, currentScene)
      : globalStats
    : selectedPack
      ? currentScene
      ? getSceneStats(notebookData, selectedPack.domain_pack_id, currentScene)
      : getPackStats(notebookData, selectedPack.domain_pack_id)
    : globalStats;
  function writeDefaultForget(card: WordCard) {
    if (isDemoMode || isUiDemoCard(card)) {
      setWriteMessage({
        cardId: card.card_id,
        text: 'UI 演示词不会写入复习记录。导入真实词卡后可使用“写入忘记”。'
      });
      return;
    }

    onWriteDefaultForget(card);
    setWriteMessage({
      cardId: card.card_id,
      text: `${card.headword} 已标记为不会，并进入今日待复习。`
    });
  }

  function speakWord(card: WordCard) {
    playCardPronunciation(card);
  }

  function resetToFolders() {
    setDeckMode('folders');
    setActiveScene(null);
    setRangeSettingsOpen(false);
    setExpandedCardId(null);
    setWriteMessage(null);
    resetInlineStudy();
  }

  function resetInlineStudy() {
    setInlineStudyCardIds([]);
    setInlineStudyCompletedIds(new Set());
    setInlineStudyRevealed(false);
    setInlineStudyStartedAt(Date.now());
  }

  function openScenePage(scene: string, initialFilter: SceneStatusFilter = 'unlearned') {
    const scenePackId = selectedPack?.domain_pack_id ?? notebookData.domain_packs.find((pack) => (pack.scenes ?? []).includes(scene))?.domain_pack_id ?? null;
    setActiveScene(scene);
    setRangeSettingsOpen(false);
    setSceneRangeKind('scene');
    setSceneRangePackId(scenePackId);
    setSceneRangeScene(scene);
    setSceneFrequencyFilters([]);
    setSceneStatusFilter(initialFilter);
    setDeckMode('scene');
    setExpandedScene(null);
    setExpandedCardId(null);
    setWriteMessage(null);
    resetInlineStudy();
  }

  function updateSceneFrequencyFilter(filter: SceneFrequencyFilter) {
    setSceneFrequencyFilters((current) => {
      if (filter === 'all') {
        return [];
      }

      return current.includes(filter) ? current.filter((item) => item !== filter) : [...current, filter];
    });
    setExpandedCardId(null);
    setWriteMessage(null);
    resetInlineStudy();
  }

  function handleWordListCardClick(card: WordCard, expanded: boolean) {
    if (!expanded) {
      writeDefaultForget(card);
    }
    setExpandedCardId(expanded ? null : card.card_id);
  }

  function startSceneLearning() {
    if (isDemoMode || filteredSceneCards.length === 0) {
      return;
    }

    setInlineStudyCardIds(filteredSceneCards.filter((card) => !isUiDemoCard(card)).map((card) => card.card_id));
    setInlineStudyCompletedIds(new Set());
    setInlineStudyRevealed(false);
    setInlineStudyStartedAt(Date.now());
    setExpandedCardId(null);
    setWriteMessage(null);
  }

  function rateInlineStudy(card: WordCard, rating: Rating) {
    onRate(card, rating, inlineStudyStartedAt);
    setInlineStudyCompletedIds((current) => {
      const next = new Set(current);
      next.add(card.card_id);
      return next;
    });
    setInlineStudyRevealed(false);
    setInlineStudyStartedAt(Date.now());
  }

  function renderCardDetail(card: WordCard, state: AppData['memory_states'][string] | undefined, latestReview: AppData['review_events'][number] | undefined, demoCard: boolean) {
    const bucket = getCardLearningBucket(notebookData, card);
    const phonetic = getCardPhonetic(card);
    return (
      <div className="space-y-4 border-t border-line bg-slate-50 px-4 py-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-3 py-1 text-xs ${sceneBucketPillClass(bucket)}`}>{sceneBucketLabel(bucket)}</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs text-muted">{formatFrequencyTier(card.frequency_tier)}</span>
          <span className="rounded-full bg-white px-3 py-1 text-xs text-muted">{card.part_of_speech}</span>
          {phonetic ? (
            <button
              aria-label={`Play pronunciation for ${card.headword}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-medium transition hover:bg-slate-100"
              onClick={() => speakWord(card)}
              type="button"
            >
              <span className="font-semibold text-ink">{getPronunciationAccentLabel(card)}</span>
              <span className="text-muted">{phonetic}</span>
              <Volume2 className="h-3.5 w-3.5 text-brand" />
            </button>
          ) : null}
        </div>

        <div className="rounded-xl border border-red-100 bg-red-50 p-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-semibold text-red-800">{demoCard ? 'UI 演示词不可写入' : '浏览详情记忆写入'}</div>
                <p className="mt-1 text-xs leading-5 text-red-700">
                  {demoCard ? '这是前端 UI 演示词，不会生成 ReviewEvent，也不会更新 UserMemoryState。' : '点开详情即视为不会。系统会生成 browser_detail Again 记录，并加入今日待复习。'}
                </p>
                <p className="mt-2 text-xs text-red-700">最近记录：{latestReview ? `${latestReview.rating} / ${formatDue(latestReview.state_after.due_at)}` : '无'}</p>
              </div>
              <button className={`inline-flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white ${demoCard ? 'bg-slate-500' : 'bg-red-600'}`} onClick={() => writeDefaultForget(card)}>
                <RotateCcw className="h-4 w-4" />
                {demoCard ? '演示不可写入' : '写入忘记'}
              </button>
            </div>
            {writeMessage?.cardId === card.card_id ? <div className="mt-3 rounded-md bg-white px-3 py-2 text-xs text-red-700">{writeMessage.text}</div> : null}
        </div>

        <div>
          <div className="text-xs font-semibold text-muted">英文定义</div>
          <p className="mt-1 leading-6 text-ink">{card.definition_en}</p>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted">真实场景例句</div>
          <div className="mt-2 space-y-2">
            {card.examples.map((example, index) => (
              <div className="rounded-xl bg-white p-3" key={`${card.card_id}-example-${index}`}>
                <p className="font-medium leading-6 text-ink">{example.example_en}</p>
                <p className="mt-1 leading-6 text-muted">{example.example_zh}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs font-semibold text-muted">来源</div>
            <a className="mt-1 block truncate font-medium text-brand" href={card.source.source_url} rel="noreferrer" target="_blank">
              {card.source.source_name}
            </a>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs font-semibold text-muted">场景</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {card.scene_tags.map((scene) => (
                <span className="rounded-full bg-panel px-2 py-1 text-xs text-muted" key={`${card.card_id}-${scene}`}>{formatSceneLabel(scene)}</span>
              ))}
            </div>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs font-semibold text-muted">同义词</div>
            <p className="mt-1 text-muted">{(card.synonyms ?? []).join(' / ') || '—'}</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs font-semibold text-muted">易混词</div>
            <p className="mt-1 text-muted">{(card.confusing_words ?? []).join(' / ') || '—'}</p>
          </div>
          <div className="rounded-xl bg-white p-3">
            <div className="text-xs font-semibold text-muted">词族</div>
            <p className="mt-1 text-muted">{(card.word_family ?? []).join(' / ') || '—'}</p>
          </div>
        </div>
      </div>
    );
  }

  function renderInlineStudyCard(card: WordCard) {
    const state = notebookData.memory_states[card.card_id];
    const bucket = getCardLearningBucket(notebookData, card);
    const phonetic = getCardPhonetic(card);
    const intervals = previewReviewIntervals(state ?? null, card.card_id, new Date(), {
      target_retention: notebookData.learning_plan.target_retention,
      maximum_interval_days: notebookData.learning_plan.maximum_interval_days,
      relearning_interval_minutes: notebookData.learning_plan.relearning_interval_minutes,
      leech_lapse_threshold: notebookData.learning_plan.leech_lapse_threshold
    });

    return (
      <section className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <div className="border-b border-line bg-slate-50 px-4 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-brand/10 px-3 py-2 text-sm font-medium text-brand">{formatFrequencyTier(card.frequency_tier)}</span>
            <span className={`rounded-xl px-3 py-2 text-sm font-medium ${sceneBucketPillClass(bucket)}`}>{sceneBucketLabel(bucket)}</span>
            <span className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">{activeScene ? formatSceneLabel(activeScene) : activeSceneLabel}</span>
            <span className="ml-auto text-xs text-muted">
              {Math.min(inlineStudyCompletedCount + 1, inlineStudyCardIds.length)} / {inlineStudyCardIds.length}
            </span>
          </div>
        </div>

        <div className="p-5 sm:p-7">
          <div className="text-sm text-muted">这个词在真实技术场景中是什么意思？</div>
          <div className="mt-5 break-words text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{card.headword}</div>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {phonetic ? (
              <button
                aria-label={`Play pronunciation for ${card.headword}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-slate-50 px-3.5 py-1.5 text-sm font-medium transition hover:bg-slate-100"
                onClick={() => speakWord(card)}
                type="button"
              >
                <span className="font-semibold text-ink">{getPronunciationAccentLabel(card)}</span>
                <span className="text-muted">{phonetic}</span>
                <Volume2 className="h-4 w-4 text-brand" />
              </button>
            ) : (
              <button
                aria-label={`Play pronunciation for ${card.headword}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-sm font-medium text-brand transition hover:bg-brand/15"
                onClick={() => speakWord(card)}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
                <span>读音</span>
              </button>
            )}
          </div>

          {!inlineStudyRevealed ? (
            <button className="mt-7 w-full rounded-xl bg-brand px-4 py-3.5 text-base font-medium text-white shadow-sm sm:w-72" onClick={() => setInlineStudyRevealed(true)}>
              显示答案
            </button>
          ) : (
            <div className="mt-8 space-y-5">
              <div>
                <div className="text-2xl font-semibold text-ink">{card.definition_zh}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{card.definition_en}</p>
              </div>

              <div className="space-y-3">
                {card.examples.map((example, index) => (
                  <div className="rounded-xl border border-line bg-panel p-3" key={`${card.card_id}-inline-example-${index}`}>
                    <p className="text-sm font-medium leading-6 text-ink">{example.example_en}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{example.example_zh}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ['again', '忘记', 'bg-red-50 text-red-700'],
                  ['hard', '困难', 'bg-orange-50 text-orange-700'],
                  ['good', '良好', 'bg-green-50 text-green-700'],
                  ['easy', '简单', 'bg-blue-50 text-blue-700']
                ].map(([rating, label, className], index) => (
                  <button className={`rounded-xl px-3 py-3 text-left font-medium ${className}`} key={rating} onClick={() => rateInlineStudy(card, rating as Rating)}>
                    <span className="block text-xs opacity-70">{index + 1}</span>
                    <span className="block text-base">{label}</span>
                    <span className="mt-1 block text-xs opacity-80">下次 {intervals[rating as Rating]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    );
  }

  if (!isAllDeck && (!selectedPack || !selectedStats)) {
    return (
      <section className="rounded-[22px] border border-line bg-white p-6 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-ink">单词本</h1>
        <p className="mt-2 text-sm text-muted">暂无领域包。请先在设置中导入标准词卡包。</p>
        <button className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2 text-sm font-medium text-white" onClick={onOpenSettings}>
          <Plus className="h-4 w-4" />
          导入词卡包
        </button>
      </section>
    );
  }

  return (
    <div className="relative space-y-4 pb-20">
      {effectiveDeckMode === 'folders' ? (
        <section className="rounded-2xl border border-line bg-white px-3 py-3 shadow-sm sm:px-4">
          <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
            <div className="px-2 py-1">
              <div className="text-3xl font-semibold leading-none text-ink">{currentScopeStats.unlearned}</div>
              <div className="mt-2 text-sm text-muted">未学习</div>
            </div>
            <div className="px-2 py-1">
              <div className="text-3xl font-semibold leading-none text-ink">{currentScopeStats.learning}</div>
              <div className="mt-2 text-sm text-muted">学习中</div>
            </div>
            <div className="px-2 py-1">
              <div className="text-3xl font-semibold leading-none text-ink">{currentScopeStats.review}</div>
              <div className="mt-2 text-sm text-muted">待复习</div>
            </div>
          </div>
        </section>
      ) : null}

      {effectiveDeckMode === 'folders' ? (
        <nav className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 pt-1" aria-label="单词本领域包">
          <button
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
              isAllDeck ? 'bg-brand text-white shadow-sm' : 'bg-white text-muted ring-1 ring-line'
            }`}
            onClick={() => {
              setSelectedPackId(ALL_DECK_ID);
              setExpandedScene(null);
              setActiveScene(null);
              setDeckMode('folders');
              setExpandedCardId(null);
            }}
          >
            全部 <span className={isAllDeck ? 'text-white/80' : 'text-muted'}>({globalStats.total})</span>
          </button>
          {notebookData.domain_packs.map((pack) => {
            const stats = getDeckStats(notebookData, pack.domain_pack_id);
            const active = !isAllDeck && pack.domain_pack_id === selectedPack?.domain_pack_id;
            return (
              <button
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                  active ? 'bg-brand text-white shadow-sm' : 'bg-white text-muted ring-1 ring-line'
                }`}
                key={pack.domain_pack_id}
                onClick={() => {
                  setSelectedPackId(pack.domain_pack_id);
                  setExpandedScene(null);
                  setActiveScene(null);
                  setDeckMode('folders');
                  setExpandedCardId(null);
                }}
              >
                {getPackShortName(pack)} <span className={active ? 'text-white/80' : 'text-muted'}>({stats.total})</span>
              </button>
            );
          })}
        </nav>
      ) : null}

      <section>
        {effectiveDeckMode === 'folders' ? (
          <div className="space-y-3">
            {folders.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">当前单词本没有可显示的场景文件夹。请先在设置中导入词卡包。</div>
            ) : folders.map((folder) => {
              const progress = folder.cards.length === 0 ? 0 : Math.round((folder.releaseCount / folder.cards.length) * 100);
              return (
                <button
                  aria-label={`${folder.label} 进入场景词卡`}
                  className="relative block w-full overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-sm transition hover:border-brand/30 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-brand/10"
                  key={folder.scene}
                  onClick={() => openScenePage(folder.scene, 'all')}
                  title="进入场景词卡"
                  type="button"
                >
                  <div className="flex items-start gap-3 p-4">
                    <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
                      <Folder className="h-7 w-7" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate pr-16 text-lg font-semibold text-ink">{folder.label}</div>
                      <div className="mt-1 flex max-w-full flex-wrap gap-x-3 gap-y-0.5 text-[11px] leading-5 text-muted sm:gap-x-4 sm:text-xs">
                        <span className="whitespace-nowrap tabular-nums">未学习 {folder.stats.unlearned}</span>
                        <span className="whitespace-nowrap tabular-nums text-red-600">学习中 {folder.stats.learning}</span>
                        <span className="whitespace-nowrap tabular-nums text-brand">待复习 {folder.stats.review}</span>
                        <span className="whitespace-nowrap tabular-nums">已掌握 {folder.releaseCount}</span>
                      </div>
                    </div>
                    <span className="absolute right-4 top-3 inline-flex items-center gap-1.5 rounded-full px-2 py-1.5 text-sm font-medium text-muted">
                      <span>{progress}%</span>
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3">
                <button aria-label="返回场景列表" className="inline-flex h-10 w-10 items-center justify-center justify-self-start rounded-full bg-slate-50 text-muted transition hover:bg-slate-100 hover:text-ink" onClick={resetToFolders} title="返回场景列表">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="max-w-[12rem] truncate text-center text-xl font-semibold leading-tight text-ink sm:max-w-none sm:text-2xl">{activeSceneLabel}</h1>
                <button
                  aria-label="设置词卡范围"
                  className="inline-flex h-10 w-10 items-center justify-center justify-self-end rounded-full bg-slate-50 text-muted transition hover:bg-slate-100 hover:text-ink"
                  onClick={() => setRangeSettingsOpen((open) => !open)}
                  title="词卡范围"
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>

              {rangeSettingsOpen ? (
                <div className="fixed left-3 right-3 top-24 z-30 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-2xl border border-line bg-white p-4 text-sm shadow-xl sm:absolute sm:left-auto sm:right-4 sm:top-14 sm:w-[min(24rem,calc(100vw-3rem))]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold text-ink">词卡范围</div>
                    <button className="rounded-full px-2 py-1 text-xs text-muted hover:bg-slate-50 hover:text-ink" onClick={() => setRangeSettingsOpen(false)}>
                      关闭
                    </button>
                  </div>

                  <div className="mt-4">
                    <div className="text-xs font-medium text-muted">选择词频</div>
                    <div className="mt-2 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                      <div className="self-start rounded-2xl bg-slate-50 p-1">
                        <button
                          className={`w-full truncate rounded-xl px-2 py-2 text-center text-xs font-semibold sm:px-3 ${
                            sceneFrequencyFilters.length === 0 ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-white hover:text-ink'
                          }`}
                          onClick={() => updateSceneFrequencyFilter('all')}
                          title="全部"
                          type="button"
                        >
                          全部
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {frequencyTierOptions.map((tier) => {
                          const active = sceneFrequencyFilters.includes(tier);
                          const label = formatFrequencyTier(tier);
                          return (
                            <button
                              className={`min-w-0 truncate rounded-full px-2 py-2 text-center text-xs font-medium sm:px-3 ${
                                active ? 'bg-brand text-white' : 'bg-slate-50 text-muted hover:text-ink'
                              }`}
                              key={tier}
                              onClick={() => updateSceneFrequencyFilter(tier)}
                              title={label}
                              type="button"
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5">
                    <div className="text-xs font-medium text-muted">选择场景</div>
                    <div className="mt-2 grid grid-cols-[5.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-3">
                      <div className="max-h-64 overflow-y-auto rounded-2xl bg-slate-50 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <button
                          className={`mb-1 w-full truncate rounded-xl px-2 py-2 text-left text-xs font-semibold sm:px-3 ${sceneRangeKind === 'all' ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-white hover:text-ink'}`}
                          onClick={() => {
                            setSceneRangeKind('all');
                            setSceneRangePackId(null);
                            setExpandedCardId(null);
                            setWriteMessage(null);
                            resetInlineStudy();
                          }}
                          type="button"
                        >
                          全部
                        </button>
                        {notebookData.domain_packs.map((pack) => {
                          const active = sceneRangeKind !== 'all' && rangePackId === pack.domain_pack_id;
                          const packLabel = getPackShortName(pack);
                          return (
                            <button
                              className={`mb-1 w-full truncate rounded-xl px-2 py-2 text-left text-xs font-semibold sm:px-3 ${active ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-white hover:text-ink'}`}
                              key={pack.domain_pack_id}
                              onClick={() => {
                                setSceneRangeKind('packScenes');
                                setSceneRangePackId(pack.domain_pack_id);
                                setExpandedCardId(null);
                                setWriteMessage(null);
                                resetInlineStudy();
                              }}
                              title={packLabel}
                              type="button"
                            >
                              {formatPrimarySceneNavLabel(packLabel)}
                            </button>
                          );
                        })}
                      </div>

                      <div className="max-h-64 overflow-y-auto">
                        {sceneRangeKind === 'all' ? (
                          <button
                            className="w-full truncate rounded-xl border border-brand bg-brand/10 px-2 py-2 text-center text-xs font-semibold text-brand sm:px-3"
                            onClick={() => {
                              setSceneRangeKind('all');
                              setExpandedCardId(null);
                              setWriteMessage(null);
                              resetInlineStudy();
                            }}
                            type="button"
                          >
                            全部
                          </button>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              className={`min-w-0 truncate rounded-xl px-2 py-2 text-center text-xs font-semibold sm:px-3 ${sceneRangeKind === 'packScenes' ? 'border border-brand bg-brand/10 text-brand' : 'bg-slate-50 text-muted hover:text-ink'}`}
                              onClick={() => {
                                setSceneRangeKind('packScenes');
                                setExpandedCardId(null);
                                setWriteMessage(null);
                                resetInlineStudy();
                              }}
                              type="button"
                            >
                              全部
                            </button>
                            {rangePackSceneOptions.map((scene) => {
                              const active = sceneRangeKind === 'scene' && rangeScene === scene.scene;
                              return (
                                <button
                                  className={`min-w-0 truncate rounded-xl px-2 py-2 text-center text-xs font-semibold sm:px-3 ${active ? 'border border-brand bg-brand/10 text-brand' : 'bg-slate-50 text-muted hover:text-ink'}`}
                                  key={scene.scene}
                                  onClick={() => {
                                    setSceneRangeKind('scene');
                                    setSceneRangeScene(scene.scene);
                                    setExpandedCardId(null);
                                    setWriteMessage(null);
                                    resetInlineStudy();
                                  }}
                                  title={scene.label}
                                  type="button"
                                >
                                  {formatSecondarySceneNavLabel(scene.label)}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex gap-1 overflow-x-auto rounded-2xl bg-slate-50 p-1" aria-label="词卡状态筛选">
                {sceneStatusFilters.map((filter) => {
                  const active = sceneStatusFilter === filter.key;
                  const count = sceneFilterCounts[filter.key] ?? 0;
                  return (
                    <button
                      className={`shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition ${
                        active ? 'bg-brand text-white shadow-sm' : 'text-muted hover:bg-white hover:text-ink'
                      }`}
                      key={filter.key}
                      onClick={() => {
                        setSceneStatusFilter(filter.key);
                        setExpandedCardId(null);
                        setWriteMessage(null);
                        resetInlineStudy();
                      }}
                    >
                      <span className="inline-flex items-baseline justify-center gap-1.5 whitespace-nowrap">
                        <span>{filter.label}</span>
                        <span className={`text-xs font-semibold tabular-nums ${active ? 'text-white/90' : 'text-muted'}`}>{count}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 pl-4 pr-1 text-xs text-muted">范围：{activeSceneLabel} · {sceneStatusFilters.find((filter) => filter.key === sceneStatusFilter)?.label ?? '全部'} · {activeFrequencyLabel} · {filteredSceneCards.length} 张</div>
            </div>

            {inlineStudyCurrentCard ? (
              renderInlineStudyCard(inlineStudyCurrentCard)
            ) : inlineStudyDone ? (
              <section className="rounded-2xl border border-line bg-white p-6 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-ink">本轮学习完成</h2>
                <p className="mt-2 text-sm text-muted">已完成 {inlineStudyCompletedCount} 张词卡，结果已写入正常学习记录。</p>
                <button className="mt-5 rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink" onClick={resetInlineStudy}>
                  返回单词列表
                </button>
              </section>
            ) : (
              <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand px-4 py-3 text-sm font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
                  disabled={isDemoMode || filteredSceneCards.length === 0}
                  onClick={startSceneLearning}
                >
                  <Play className="h-4 w-4" />
                  {isDemoMode ? '导入后可学习' : sceneFilterActionLabel(sceneStatusFilter)}
                </button>
              </div>
            )}

            {inlineStudyActive ? null : filteredSceneCards.length === 0 ? (
              <div className="rounded-2xl border border-line bg-white p-5 text-sm text-muted">当前筛选下没有可显示的词卡。</div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                {filteredSceneCards.map((card, cardIndex) => {
                const state = notebookData.memory_states[card.card_id];
                const bucket = getCardLearningBucket(notebookData, card);
                const expanded = expandedCardId === card.card_id;
                const latestReview = notebookData.review_events.find((event) => event.card_id === card.card_id);
                const demoCard = isDemoMode || isUiDemoCard(card);
                const phonetic = getCardPhonetic(card);
                return (
                  <article className={cardIndex === 0 ? '' : 'border-t border-line'} key={card.card_id}>
                    <div
                      className="flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 sm:px-4"
                      onClick={() => handleWordListCardClick(card, expanded)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          handleWordListCardClick(card, expanded);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
                      <button
                        aria-label={`Play pronunciation for ${card.headword}`}
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand transition hover:bg-brand/15"
                        onClick={(event) => {
                          event.stopPropagation();
                          speakWord(card);
                        }}
                        type="button"
                      >
                        <Volume2 className="h-4 w-4" />
                      </button>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-lg font-semibold leading-tight text-ink">{card.headword}</span>
                        {phonetic ? (
                          <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                            <span className="font-medium text-slate-700">{getPronunciationAccentLabel(card)}</span>
                            <span>{phonetic}</span>
                          </span>
                        ) : null}
                        <span className="mt-1 block truncate text-sm text-muted">{card.definition_zh}</span>
                      </span>
                      <span className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full px-2 py-1 text-[11px] leading-none ${sceneBucketPillClass(bucket)}`}>{sceneBucketLabel(bucket)}</span>
                      {expanded ? <ChevronDown className="h-5 w-5 text-muted" /> : <ChevronRight className="h-5 w-5 text-muted" />}
                    </div>
                    {expanded ? renderCardDetail(card, state, latestReview, demoCard) : null}
                  </article>
                );
                })}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export function App() {
  const [data, setData] = useState<AppData>(() => loadData());
  const [view, setView] = useState<ViewKey>('today');
  const [userProfile, setUserProfile] = useState<UserProfile>(() => loadUserProfile());
  const [hasImportRollback, setHasImportRollback] = useState(() => hasLastImportRollback());
  const [persistenceStatus, setPersistenceStatus] = useState<PersistenceUiStatus>({
    source: 'loading',
    migrated_from_localstorage: false
  });
  const [queueClock, setQueueClock] = useState(() => Date.now());
  const reviewStageQueue = useMemo(() => getReviewStageQueue(data, new Date(queueClock)), [data, queueClock]);

  useEffect(() => {
    const intervalId = window.setInterval(() => setQueueClock(Date.now()), 60_000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    let mounted = true;
    void loadPersistedData().then((result) => {
      if (!mounted) {
        return;
      }

      setData(result.data);
      setPersistenceStatus({
        source: result.source,
        migrated_from_localstorage: result.migrated_from_localstorage,
        error: result.error
      });
    });

    return () => {
      mounted = false;
    };
  }, []);

  function persist(next: AppData) {
    setData(next);
    saveData(next);
    setPersistenceStatus((current) => ({
      ...current,
      source: current.source === 'fallback_localstorage' ? current.source : 'indexeddb',
      migrated_from_localstorage: current.migrated_from_localstorage
    }));
  }

  function navigateToTopNav(key: TopNavKey) {
    setView(key);
  }

  function updateUserProfile(next: UserProfile) {
    setUserProfile(next);
    saveUserProfile(next);
  }

  const handleImport = useMemo(
    () => (pkg: Parameters<typeof importPackage>[1], format: Parameters<typeof importPackage>[2] = 'json', issues: Parameters<typeof importPackage>[3] = {}) => {
      saveLastImportRollback(data);
      setHasImportRollback(true);
      const imported = importPackage(data, pkg, format, issues);
      persist(imported.data);
      return imported.result;
    },
    [data]
  );

  const handleSceneDemoImport = useMemo(
    () => async () => {
      const response = await fetch('scene-classification-demo-450.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const text = await response.text();
      const parsed = parsePackageText(text, 'scene-classification-demo-450.json');
      if (!parsed.pkg) {
        throw new Error(parsed.errors[0]?.message ?? 'package validation errors');
      }

      return handleImport(parsed.pkg, parsed.format, { errors: parsed.errors, warnings: parsed.warnings });
    },
    [handleImport]
  );

  function handleRate(card: WordCard, rating: Rating, startedAt: number) {
    const next = applyReview(data, card, rating, Date.now() - startedAt);
    persist(next);
  }

  function handleBrowserForget(card: WordCard) {
    const reviewed = applyReview(data, card, 'again', 0, 'browser_detail');
    persist(reviewed);
    setQueueClock(Date.now());
  }

  function exportData() {
    const backup = createBackup(data);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `techlex-os-backup-v${backup.backup_schema_version}-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function restoreBackup(file: File) {
    try {
      const text = await file.text();
      const restored = normalizeAppData(JSON.parse(text));
      persist(restored);
      setView('today');
      window.alert('备份已恢复。');
    } catch {
      window.alert('备份恢复失败：请选择 TechLex OS 导出的 JSON 文件。');
    }
  }

  async function rollbackLastImport() {
    const rollback = await loadLastImportRollbackAsync();

    if (!rollback) {
      window.alert('没有可恢复的导入前快照。');
      setHasImportRollback(false);
      return;
    }

    if (window.confirm('确认恢复最近一次导入前的快照？当前本地学习数据会被替换。')) {
      persist(rollback);
      setView('today');
      window.alert('已恢复导入前快照。');
    }
  }

  return (
    <div className="app-shell overflow-x-hidden bg-[#eef3f8] text-ink">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-line bg-white p-4 lg:block">
        <div className="space-y-4">
          <div>
            <div className="text-lg font-semibold text-ink">{APP_DISPLAY_NAME}</div>
            <div className="text-xs text-muted">自动学习运行系统</div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <img
              alt="默认用户头像"
              className="h-11 w-11 shrink-0 rounded-full border border-white bg-white object-cover shadow-sm"
              src={userProfile.avatar_src}
            />
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-ink">{userProfile.nickname}</div>
              <div className="text-xs text-muted">个人词境</div>
            </div>
          </div>
        </div>
        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = getTopNavKey(view) === item.key;
            return (
              <button className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium ${active ? 'bg-brand/10 text-brand' : 'text-slate-600 hover:bg-panel'}`} key={item.key} onClick={() => navigateToTopNav(item.key)}>
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="mx-auto max-w-6xl px-3 py-3 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-4 sm:py-4 lg:ml-64 lg:px-8 lg:py-6 lg:pb-6">
        {view === 'today' || view === 'review' ? (
          <Suspense fallback={<LazyViewFallback title="Review" />}>
            <LazyReviewView data={data} queue={reviewStageQueue} onRate={handleRate} />
          </Suspense>
        ) : null}
        {view === 'decks' ? <DecksView data={data} onOpenSettings={() => setView('settings')} onRate={handleRate} onWriteDefaultForget={handleBrowserForget} /> : null}
        {view === 'browser' ? (
          <Suspense fallback={<LazyViewFallback title="Browser" />}>
            <LazyBrowserView data={data} onWriteDefaultForget={handleBrowserForget} />
          </Suspense>
        ) : null}
        {view === 'galaxy' ? (
          <Suspense fallback={<LazyViewFallback title="图谱" />}>
            <LazyGalaxyView data={data} onImportSceneDemo={handleSceneDemoImport} />
          </Suspense>
        ) : null}
        {view === 'stats' ? (
          <Suspense fallback={<LazyViewFallback title="Stats" />}>
            <LazyStatsView data={data} />
          </Suspense>
        ) : null}
        {view === 'settings' ? (
          <div className="space-y-4">
            <Suspense fallback={<LazyViewFallback title="Settings" />}>
              <LazySettingsView
                data={data}
                persistenceStatus={persistenceStatus}
                userProfile={userProfile}
                hasImportRollback={hasImportRollback}
                onImportPackage={handleImport}
                onExport={exportData}
                onRestore={restoreBackup}
                onRollbackLastImport={rollbackLastImport}
                onReset={() => {
                  if (window.confirm('确认清空本地学习数据？')) {
                    persist(resetData());
                  }
                }}
                onUpdatePlan={(plan) => persist({ ...data, learning_plan: plan })}
                onUpdateUserProfile={updateUserProfile}
              />
            </Suspense>
          </div>
        ) : null}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-lg backdrop-blur lg:hidden">
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = getTopNavKey(view) === item.key;
            return (
              <button
                className={`mobile-nav-button flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-medium ${active ? 'bg-brand/10 text-brand' : 'text-slate-500'}`}
                key={item.key}
                onClick={() => navigateToTopNav(item.key)}
              >
                <Icon className="h-4 w-4" />
                <span className="mobile-nav-label">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
