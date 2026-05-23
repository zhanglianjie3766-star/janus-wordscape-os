import { CircleQuestionMark, X } from 'lucide-react';
import { useState } from 'react';
import { getReviewStageQueue, getTodayReviewedDueReviewCardIds, isReviewStageDue } from '../scheduler';
import type { AppData, MemoryStage, ReviewEvent, WordCard } from '../types';

const reviewStages: MemoryStage[] = ['reviewing', 'due', 'overdue'];
const weakStages: MemoryStage[] = ['reinforce', 'downgrade'];
const masteredStages: MemoryStage[] = ['release'];
const recentWindowMs = 30 * 24 * 60 * 60 * 1000;

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

type StatTone = 'neutral' | 'good' | 'watch' | 'danger';
type HelpPlacement = 'top' | 'bottom';

interface MetricCardProps {
  label: string;
  value: string | number;
  hint?: string;
  help?: string;
  tone?: StatTone;
}

interface DashboardPanelProps {
  helpKey: string;
  title: string;
  description: string;
  metrics: MetricCardProps[];
  helpPlacement?: HelpPlacement;
  openHelpKey: string | null;
  onToggleHelp: (key: string) => void;
}

interface StageBucket {
  key: string;
  label: string;
  count: number;
}

interface SceneRisk {
  scene: string;
  label: string;
  review: number;
  weak: number;
  overdue: number;
  againRate: number;
  recentReviews: number;
}

interface HelpItem {
  label: string;
  description: string;
}

function isSameLocalDay(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth() && left.getDate() === right.getDate();
}

function formatSceneLabel(scene: string) {
  return sceneDisplayName[scene] ?? scene.replace(/[_-]+/g, ' ').replace(/\b\w/g, (value) => value.toUpperCase());
}

function getCardScenes(card: WordCard) {
  return card.scene_tags.length > 0 ? card.scene_tags : ['ungrouped'];
}

function isWeakStage(stage?: MemoryStage) {
  return Boolean(stage && weakStages.includes(stage));
}

function isOverdue(state: AppData['memory_states'][string] | undefined, now: number) {
  return Boolean(state?.due_at && !['new', 'release'].includes(state.stage) && new Date(state.due_at).getTime() < now);
}

function toneTextClass(tone: StatTone = 'neutral') {
  const toneClass: Record<StatTone, string> = {
    neutral: 'text-slate-500',
    good: 'text-brand',
    watch: 'text-amber',
    danger: 'text-danger'
  };

  return toneClass[tone];
}

function helpPanelClass(placement: HelpPlacement) {
  const baseClass =
    'pointer-events-auto absolute left-[calc(50%_-_50px)] z-50 max-h-[calc(100vh-10rem)] w-72 -translate-x-1/2 touch-pan-y overflow-auto overscroll-contain rounded-xl border border-line bg-white p-3 text-xs leading-5 text-muted shadow-lg sm:left-1/2 sm:max-h-80 sm:w-80';

  return placement === 'top' ? `${baseClass} bottom-full mb-3` : `${baseClass} top-full mt-3`;
}

function helpArrowClass(placement: HelpPlacement) {
  const baseClass = 'absolute h-3 w-3 -translate-x-1/2 rotate-45 border-line bg-white sm:left-1/2';

  return placement === 'top'
    ? `${baseClass} left-[calc(50%_+_57px)] -bottom-1.5 border-b border-r`
    : `${baseClass} left-[calc(50%_+_50px)] -top-1.5 border-l border-t`;
}

function DashboardPanel({ helpKey, title, description, metrics, helpPlacement = 'bottom', openHelpKey, onToggleHelp }: DashboardPanelProps) {
  return (
    <section className="rounded-2xl border border-line bg-white px-4 py-3 shadow-sm sm:p-4">
      <SectionHeader
        helpKey={helpKey}
        title={title}
        description={description}
        helpItems={metrics.map((metric) => ({
          label: metric.label,
          description: metric.help ?? metric.hint ?? ''
        }))}
        helpPlacement={helpPlacement}
        openHelpKey={openHelpKey}
        onToggleHelp={onToggleHelp}
      />
      <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-6">
        {metrics.map(({ label, value, tone }) => (
          <div className="min-w-0 text-center" key={label}>
            <div className={`truncate text-xs font-medium leading-5 sm:text-sm ${toneTextClass(tone)}`}>{label}</div>
            <div className="mt-2.5 whitespace-nowrap text-xl font-normal leading-none text-slate-600 tabular-nums sm:mt-3 sm:text-2xl">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({
  helpKey,
  title,
  description,
  helpItems = [],
  helpPlacement = 'bottom',
  openHelpKey,
  onToggleHelp
}: {
  helpKey: string;
  title: string;
  description?: string;
  helpItems?: HelpItem[];
  helpPlacement?: HelpPlacement;
  openHelpKey: string | null;
  onToggleHelp: (key: string) => void;
}) {
  const open = openHelpKey === helpKey;

  return (
    <div className="relative flex min-h-8 items-center justify-center">
      <h2 className="text-center text-base font-semibold text-slate-800">{title}</h2>
      {description ? (
        <div className="relative ml-2 inline-flex">
          <button
            aria-expanded={open}
            aria-label={`${title}说明`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-slate-50 hover:text-ink focus:outline-none focus:ring-4 focus:ring-slate-200"
            onClick={() => onToggleHelp(helpKey)}
            title={`${title}说明`}
            type="button"
          >
            <CircleQuestionMark className="h-4 w-4" />
          </button>
          {open ? (
            <div className={helpPanelClass(helpPlacement)}>
              <div className={helpArrowClass(helpPlacement)} />
              <button
                aria-label={`关闭${title}说明`}
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-slate-50 hover:text-ink focus:outline-none focus:ring-4 focus:ring-slate-200"
                onClick={() => onToggleHelp(helpKey)}
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-start gap-2.5 pr-8 text-left">
                <div className="mt-0.5 h-10 w-1 shrink-0 rounded-full bg-line" aria-hidden="true" />
                <div className="min-w-0">
                  <div className="font-semibold text-slate-800">{title}</div>
                  <p className="mt-0.5 text-muted">{description}</p>
                </div>
              </div>
              {helpItems.length > 0 ? (
                <div className="mt-3 space-y-2 pr-1">
                  {helpItems.map((item) => (
                    <div key={item.label}>
                      <div className="font-semibold text-ink">{item.label}</div>
                      <div className="mt-0.5">{item.description}</div>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function buildStageBuckets(data: AppData): StageBucket[] {
  const counts = {
    unlearned: 0,
    learning: 0,
    review: 0,
    weak: 0,
    mastered: 0
  };

  for (const card of data.cards) {
    const stage = data.memory_states[card.card_id]?.stage;

    if (!stage || stage === 'new') {
      counts.unlearned += 1;
    } else if (stage === 'learning' || weakStages.includes(stage)) {
      counts.learning += 1;
    } else if (reviewStages.includes(stage)) {
      counts.review += 1;
    } else if (masteredStages.includes(stage)) {
      counts.mastered += 1;
    }
  }

  return [
    { key: 'unlearned', label: '未学习', count: counts.unlearned },
    { key: 'learning', label: '学习中', count: counts.learning },
    { key: 'review', label: '待复习', count: counts.review },
    { key: 'mastered', label: '已掌握', count: counts.mastered }
  ];
}

function buildSceneRisks(data: AppData, recentEvents: ReviewEvent[], now: number): SceneRisk[] {
  const cardsById = new Map(data.cards.map((card) => [card.card_id, card]));
  const sceneMap = new Map<string, SceneRisk & { recentAgain: number }>();

  function ensure(scene: string) {
    const existing = sceneMap.get(scene);
    if (existing) {
      return existing;
    }

    const created = {
      scene,
      label: formatSceneLabel(scene),
      review: 0,
      weak: 0,
      overdue: 0,
      againRate: 0,
      recentReviews: 0,
      recentAgain: 0
    };
    sceneMap.set(scene, created);
    return created;
  }

  for (const card of data.cards) {
    const state = data.memory_states[card.card_id];
    for (const scene of getCardScenes(card)) {
      const summary = ensure(scene);
      if (isReviewStageDue(state, new Date(now))) {
        summary.review += 1;
      }
      if (isWeakStage(state?.stage)) {
        summary.weak += 1;
      }
      if (isOverdue(state, now)) {
        summary.overdue += 1;
      }
    }
  }

  for (const event of recentEvents) {
    const card = cardsById.get(event.card_id);
    if (!card) {
      continue;
    }

    for (const scene of getCardScenes(card)) {
      const summary = ensure(scene);
      summary.recentReviews += 1;
      if (event.rating === 'again') {
        summary.recentAgain += 1;
      }
    }
  }

  return Array.from(sceneMap.values())
    .map((summary) => ({
      ...summary,
      againRate: summary.recentReviews === 0 ? 0 : Math.round((summary.recentAgain / summary.recentReviews) * 100)
    }))
    .filter((summary) => summary.review > 0 || summary.weak > 0 || summary.overdue > 0 || summary.recentReviews > 0)
    .sort((left, right) => {
      if (right.weak !== left.weak) {
        return right.weak - left.weak;
      }
      if (right.overdue !== left.overdue) {
        return right.overdue - left.overdue;
      }
      if (right.review !== left.review) {
        return right.review - left.review;
      }
      return right.againRate - left.againRate;
    })
    .slice(0, 3);
}

export default function StatsView({ data }: { data: AppData }) {
  const [openHelpKey, setOpenHelpKey] = useState<string | null>(null);
  const nowDate = new Date();
  const now = nowDate.getTime();
  const learningEvents = data.review_events.filter((event) => event.review_mode === 'daily_task');
  const todaysEvents = learningEvents.filter((event) => isSameLocalDay(new Date(event.reviewed_at), nowDate));
  const recentEvents = learningEvents.filter((event) => now - new Date(event.reviewed_at).getTime() <= recentWindowMs);
  const reviewedReviewTodayIds = getTodayReviewedDueReviewCardIds(data, nowDate);
  const remainingReviewCards = getReviewStageQueue(data, nowDate);
  const todayReviewTotal = reviewedReviewTodayIds.size + remainingReviewCards.length;
  const todayNewLearned = todaysEvents.filter((event) => !event.state_before || event.state_before.stage === 'new').length;
  const overdueCount = data.cards.filter((card) => isOverdue(data.memory_states[card.card_id], now)).length;
  const weakCount = data.cards.filter((card) => isWeakStage(data.memory_states[card.card_id]?.stage)).length;
  const recentAgain = recentEvents.filter((event) => event.rating === 'again').length;
  const againRate = recentEvents.length === 0 ? 0 : Math.round((recentAgain / recentEvents.length) * 100);
  const recentRetention = recentEvents.length === 0 ? 0 : 100 - againRate;
  const stageBuckets = buildStageBuckets(data);
  const sceneRisks = buildSceneRisks(data, recentEvents, now);

  return (
    <div className="space-y-3 sm:space-y-4">
      <DashboardPanel
        helpKey="today"
        title="今日执行"
        description="判断今天该先复习，还是能加新词。"
        helpPlacement="bottom"
        openHelpKey={openHelpKey}
        onToggleHelp={(key) => setOpenHelpKey((current) => (current === key ? null : key))}
        metrics={[
          {
            label: '今日待复习',
            value: todayReviewTotal,
            help: '常规到期词卡受每天复习上限限制；手动标记不会的词卡优先进入今日。'
          },
          {
            label: '今日已复习',
            value: reviewedReviewTodayIds.size,
            help: '今天完成的正式复习词卡，不含浏览写入。',
            tone: 'good'
          },
          {
            label: '今日剩余',
            value: remainingReviewCards.length,
            help: '今日任务里现在还没处理的到期词卡，包含手动标记不会的词卡。',
            tone: remainingReviewCards.length > 0 ? 'watch' : 'good'
          },
          {
            label: '今日新学',
            value: todayNewLearned,
            help: '今天新增进入记忆循环的新词。'
          }
        ]}
      />

      <DashboardPanel
        helpKey="health"
        title="记忆健康"
        description="判断遗忘压力和学习量是否过载。"
        helpPlacement="bottom"
        openHelpKey={openHelpKey}
        onToggleHelp={(key) => setOpenHelpKey((current) => (current === key ? null : key))}
        metrics={[
          {
            label: '逾期词卡',
            value: overdueCount,
            help: '已过 due_at，优先清复习债务。',
            tone: overdueCount > 0 ? 'danger' : 'good'
          },
          {
            label: '困难词卡',
            value: weakCount,
            help: 'reinforce/downgrade，需要加强或重学。',
            tone: weakCount > 0 ? 'watch' : 'good'
          },
          {
            label: 'Again率',
            value: `${againRate}%`,
            help: '近 30 天忘记占比，越高说明压力越大。',
            tone: againRate >= 25 ? 'danger' : againRate >= 15 ? 'watch' : 'good'
          },
          {
            label: '近期保持率',
            value: `${recentRetention}%`,
            help: '近 30 天非 Again 占比，越高越稳定。',
            tone: recentRetention >= 85 || recentEvents.length === 0 ? 'good' : 'watch'
          }
        ]}
      />

      <DashboardPanel
        helpKey="stages"
        title="阶段分布"
        description="看词库处在哪些记忆阶段。"
        helpPlacement="top"
        openHelpKey={openHelpKey}
        onToggleHelp={(key) => setOpenHelpKey((current) => (current === key ? null : key))}
        metrics={stageBuckets.map((bucket) => ({
          label: bucket.label,
          value: bucket.count,
          tone: bucket.key === 'learning' ? 'watch' : bucket.key === 'mastered' ? 'good' : bucket.key === 'review' ? 'neutral' : undefined,
          help:
            bucket.key === 'unlearned'
              ? 'new 或无状态，尚未进入记忆循环。'
              : bucket.key === 'learning'
                ? 'learning/reinforce/downgrade，正在建立或修复记忆。'
                : bucket.key === 'review'
                  ? 'reviewing/due/overdue，进入间隔复习。'
                  : 'release，当前稳定掌握。'
        }))}
      />

      <section className="rounded-2xl border border-line bg-white px-4 py-3 shadow-sm sm:p-4">
        <SectionHeader
          helpKey="scenes"
          title="薄弱场景 Top 3"
          description="找最需要优先处理的二级场景。"
          helpPlacement="top"
          openHelpKey={openHelpKey}
          onToggleHelp={(key) => setOpenHelpKey((current) => (current === key ? null : key))}
          helpItems={[
            { label: '排序方式', description: '按困难、逾期、待复习、Again率依次排序。' },
            { label: '待复习', description: '该场景正在复习队列中的词卡。' },
            { label: '困难', description: '该场景需要加强或重学的词卡。' },
            { label: '逾期 / Again', description: '逾期看复习债务，Again看遗忘压力。' }
          ]}
        />
        {sceneRisks.length === 0 ? (
          <div className="mt-3 rounded-xl bg-panel p-3 text-sm text-muted">暂无薄弱场景。导入并完成复习后，这里会显示最需要处理的场景。</div>
        ) : (
          <div className="mt-3 overflow-hidden rounded-xl bg-panel/70">
            {sceneRisks.map((scene, index) => (
              <div className={`px-3 py-2.5 ${index > 0 ? 'border-t border-white' : ''}`} key={scene.scene}>
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-ink">
                      {index + 1}. {scene.label}
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      待复习 {scene.review} · 困难 {scene.weak} · 逾期 {scene.overdue}
                    </div>
                  </div>
                  <div className="shrink-0 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-brand">Again {scene.againRate}%</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
