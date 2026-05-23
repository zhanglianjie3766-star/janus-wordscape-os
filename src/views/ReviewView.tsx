import { Check, HelpCircle, Volume2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { formatFrequencyTier } from '../frequencyTiers';
import { previewReviewIntervals } from '../fsrsEngine';
import { getCardPhonetic, getPronunciationAccentLabel, playCardPronunciation } from '../pronunciation';
import { getTodayReviewedDueReviewCardIds } from '../scheduler';
import type { AppData, Rating, WordCard } from '../types';

const ALL_SCENES = 'all';
const UNGROUPED_SCENE = 'ungrouped';

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

function getCardScenes(card: WordCard) {
  return card.scene_tags.length > 0 ? card.scene_tags : [UNGROUPED_SCENE];
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

function formatDue(value?: string) {
  if (!value) {
    return '未排程';
  }

  const now = Date.now();
  const due = new Date(value).getTime();
  const diff = due - now;
  const absMinutes = Math.max(1, Math.round(Math.abs(diff) / 60000));
  const prefix = diff < 0 ? '已逾期 ' : '';

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

function speakWord(card: WordCard) {
  playCardPronunciation(card);
}

type ReviewViewProps = {
  queue: WordCard[];
  data: AppData;
  onRate: (card: WordCard, rating: Rating, startedAt: number) => void;
  scopeCardIds?: string[];
  scopeTitle?: string;
  sessionKey?: string;
};

export default function ReviewView({ queue, data, onRate, scopeCardIds, scopeTitle, sessionKey = 'global-review' }: ReviewViewProps) {
  const [selectedScene, setSelectedScene] = useState(ALL_SCENES);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [dueHelpOpen, setDueHelpOpen] = useState(false);
  const [startedAt, setStartedAt] = useState(Date.now());
  const cardsById = useMemo(() => new Map(data.cards.map((card) => [card.card_id, card])), [data.cards]);
  const scopedCardIdSet = useMemo(() => (scopeCardIds ? new Set(scopeCardIds) : null), [scopeCardIds]);
  const reviewedTodayCardIds = useMemo(() => getTodayReviewedDueReviewCardIds(data), [data]);
  const scopedReviewedTodayCardIds = useMemo(() => {
    if (!scopedCardIdSet) {
      return reviewedTodayCardIds;
    }

    const ids = new Set<string>();
    for (const cardId of reviewedTodayCardIds) {
      if (scopedCardIdSet.has(cardId)) {
        ids.add(cardId);
      }
    }

    return ids;
  }, [reviewedTodayCardIds, scopedCardIdSet]);
  const remainingQueue = useMemo(() => queue.filter((card) => !reviewedTodayCardIds.has(card.card_id)), [queue, reviewedTodayCardIds]);
  const sceneSummaries = useMemo(() => {
    const counts = new Map<string, number>();

    for (const card of remainingQueue) {
      for (const scene of getCardScenes(card)) {
        counts.set(scene, (counts.get(scene) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([scene, count]) => ({ scene, count, label: formatSceneLabel(scene) }))
      .sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'));
  }, [remainingQueue]);
  const filteredQueue = useMemo(
    () => (selectedScene === ALL_SCENES ? remainingQueue : remainingQueue.filter((card) => getCardScenes(card).includes(selectedScene))),
    [remainingQueue, selectedScene]
  );
  const card = filteredQueue[index];
  const showSceneFilter = sceneSummaries.length > 1;
  const reviewedTodayCount = useMemo(() => {
    if (selectedScene === ALL_SCENES) {
      return scopedReviewedTodayCardIds.size;
    }

    let count = 0;
    for (const cardId of scopedReviewedTodayCardIds) {
      const reviewedCard = cardsById.get(cardId);
      if (reviewedCard && getCardScenes(reviewedCard).includes(selectedScene)) {
        count += 1;
      }
    }

    return count;
  }, [cardsById, scopedReviewedTodayCardIds, selectedScene]);
  const todayRemainingCount = filteredQueue.length;
  const todayReviewTotal = reviewedTodayCount + todayRemainingCount;
  const allDueReviewsDone = !scopeTitle && todayReviewTotal > 0 && todayRemainingCount === 0;
  const statsLabels = scopeTitle
    ? { total: '本次词卡', reviewed: '已完成', remaining: '本次剩余' }
    : { total: '待复习', reviewed: '已复习', remaining: '剩余' };
  const reviewStatsPanel = (
    <section className="rounded-2xl border border-line bg-white px-3 py-3 shadow-sm sm:px-4">
      <div className="grid grid-cols-3 divide-x divide-slate-100 text-center">
        <div className="relative px-2 py-1">
          <div className="text-3xl font-semibold leading-none text-ink tabular-nums">{todayReviewTotal}</div>
          <div className="mt-2 inline-flex items-center justify-center gap-1 text-sm text-muted">
            <span>{statsLabels.total}</span>
            {!scopeTitle ? (
              <button
                aria-label="今日待复习说明"
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-muted transition hover:bg-slate-100 hover:text-ink"
                onClick={() => setDueHelpOpen((open) => !open)}
                type="button"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {!scopeTitle && dueHelpOpen ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-56 rounded-xl border border-line bg-white p-3 text-left text-xs leading-5 text-muted shadow-lg">
              常规到期词卡按每天复习上限截取；手动点开标记不会的词卡会优先进入今日。
            </div>
          ) : null}
        </div>
        <div className="px-2 py-1">
          <div className="text-3xl font-semibold leading-none text-ink tabular-nums">{reviewedTodayCount}</div>
          <div className="mt-2 text-sm text-muted">{statsLabels.reviewed}</div>
        </div>
        <div className="px-2 py-1">
          <div className="text-3xl font-semibold leading-none text-ink tabular-nums">{todayRemainingCount}</div>
          <div className="mt-2 text-sm text-muted">{statsLabels.remaining}</div>
        </div>
      </div>
    </section>
  );

  useEffect(() => {
    setIndex(0);
    setRevealed(false);
    setStartedAt(Date.now());
  }, [filteredQueue.length, selectedScene]);

  useEffect(() => {
    setSelectedScene(ALL_SCENES);
    setIndex(0);
    setRevealed(false);
    setStartedAt(Date.now());
  }, [sessionKey]);

  useEffect(() => {
    if (selectedScene !== ALL_SCENES && !sceneSummaries.some((summary) => summary.scene === selectedScene)) {
      setSelectedScene(ALL_SCENES);
    }
  }, [sceneSummaries, selectedScene]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (!card) {
        return;
      }
      if ((event.key === ' ' || event.key === 'Enter') && !revealed) {
        event.preventDefault();
        setRevealed(true);
      }
      if (!revealed) {
        return;
      }
      if (event.key === '1') {
        rate('again');
      }
      if (event.key === '2') {
        rate('hard');
      }
      if (event.key === '3') {
        rate('good');
      }
      if (event.key === '4') {
        rate('easy');
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  if (!card) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <div className="space-y-3">
          {scopeTitle ? <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-line">当前场景：{scopeTitle}</div> : null}
          {reviewStatsPanel}
          {showSceneFilter ? (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="待复习场景筛选">
            <button
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedScene === ALL_SCENES ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-line'}`}
              onClick={() => setSelectedScene(ALL_SCENES)}
            >
              全部 ({remainingQueue.length})
            </button>
            {sceneSummaries.map((summary) => (
              <button
                className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedScene === summary.scene ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-line'}`}
                key={summary.scene}
                onClick={() => setSelectedScene(summary.scene)}
              >
                {summary.label} ({summary.count})
              </button>
            ))}
          </div>
          ) : null}
        </div>
        <section className="rounded-lg border border-line bg-white p-6 text-center shadow-sm">
          <Check className="mx-auto h-10 w-10 text-brand" />
          <h1 className="mt-3 text-xl font-semibold text-ink">{allDueReviewsDone ? '今日待复习已完成' : '暂无待复习词卡'}</h1>
          <p className="mt-2 text-sm text-muted">
            {allDueReviewsDone ? `今日已复习 ${reviewedTodayCount} 张，当前剩余 0 张。新的到期词卡出现后会自动进入本页。` : '这里不会混入新卡或学习中词卡；待复习状态出现后会自动进入本页。'}
          </p>
        </section>
      </div>
    );
  }

  const state = data.memory_states[card.card_id];
  const intervals = previewReviewIntervals(state ?? null, card.card_id, new Date(), {
    target_retention: data.learning_plan.target_retention,
    maximum_interval_days: data.learning_plan.maximum_interval_days,
    relearning_interval_minutes: data.learning_plan.relearning_interval_minutes,
    leech_lapse_threshold: data.learning_plan.leech_lapse_threshold
  });
  const phonetic = getCardPhonetic(card);

  function rate(rating: Rating) {
    onRate(card, rating, startedAt);
    setRevealed(false);
    setStartedAt(Date.now());
    setIndex(0);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="space-y-3">
        {scopeTitle ? <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-line">当前场景：{scopeTitle}</div> : null}
        {reviewStatsPanel}
        {showSceneFilter ? (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" aria-label="待复习场景筛选">
          <button
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedScene === ALL_SCENES ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-line'}`}
            onClick={() => setSelectedScene(ALL_SCENES)}
          >
            全部 ({remainingQueue.length})
          </button>
          {sceneSummaries.map((summary) => (
            <button
              className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${selectedScene === summary.scene ? 'bg-brand text-white' : 'bg-white text-muted ring-1 ring-line'}`}
              key={summary.scene}
              onClick={() => setSelectedScene(summary.scene)}
            >
              {summary.label} ({summary.count})
            </button>
          ))}
        </div>
        ) : null}
      </div>

      <section className="overflow-hidden rounded-lg border border-line bg-white shadow-sm">
        <div className="border-b border-line bg-slate-50 px-5 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">{formatFrequencyTier(card.frequency_tier)}</span>
            <span className={`rounded px-2 py-1 text-xs font-medium ${stagePillClass(state?.stage)}`}>{stageLabel(state?.stage)}</span>
            {card.scene_tags.slice(0, 4).map((scene) => (
              <span className="rounded bg-white px-2 py-1 text-xs text-slate-700" key={scene}>
                {formatSceneLabel(scene)}
              </span>
            ))}
          </div>
        </div>
        <div className="p-5 sm:p-7">
          <div className="text-sm text-muted">这个词在真实技术场景中是什么意思？</div>
          <div className="mt-4 break-words text-4xl font-semibold tracking-tight text-ink sm:text-5xl">{card.headword}</div>
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

          {!revealed ? (
            <button className="mt-7 w-full rounded-md bg-brand px-4 py-3.5 text-base font-medium text-white shadow-sm sm:w-72" onClick={() => setRevealed(true)}>
              显示答案
            </button>
          ) : (
            <div className="mt-8 space-y-5">
              <div>
                <div className="text-2xl font-semibold text-ink">{card.definition_zh}</div>
                <p className="mt-2 text-sm leading-6 text-muted">{card.definition_en}</p>
              </div>

              <div className="space-y-3">
                {card.examples.map((example, exampleIndex) => (
                  <div className="rounded-md border border-line bg-panel p-3" key={`${card.card_id}-${exampleIndex}`}>
                    <p className="text-sm font-medium leading-6 text-ink">{example.example_en}</p>
                    <p className="mt-1 text-sm leading-6 text-muted">{example.example_zh}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 rounded-md border border-line p-3 text-sm md:grid-cols-3">
                <div>
                  <div className="text-xs text-muted">使用任务</div>
                  <div className="mt-1 text-ink">{card.usage_tasks.join('；') || '未提供'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">易混词</div>
                  <div className="mt-1 text-ink">{card.confusing_words?.join(', ') || '无'}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">词族</div>
                  <div className="mt-1 text-ink">{card.word_family?.join(', ') || '无'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {[
                  ['again', '忘记', 'bg-red-50 text-red-700'],
                  ['hard', '困难', 'bg-orange-50 text-orange-700'],
                  ['good', '良好', 'bg-green-50 text-green-700'],
                  ['easy', '简单', 'bg-blue-50 text-blue-700']
                ].map(([rating, label, className], buttonIndex) => (
                  <button className={`rounded-md px-3 py-3 text-left font-medium ${className}`} key={rating} onClick={() => rate(rating as Rating)}>
                    <span className="block text-xs opacity-70">{buttonIndex + 1}</span>
                    <span className="block text-base">{label}</span>
                    <span className="mt-1 block text-xs opacity-80">下次 {intervals[rating as Rating]}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
