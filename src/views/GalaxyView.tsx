import { ChevronDown, ChevronRight, GitBranch, PencilLine, RotateCcw, Search, Settings, SlidersHorizontal, Wand2, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import InteractiveGalaxyGraph from '../components/InteractiveGalaxyGraph';
import { formatDomainPackLabel, formatSceneLabel } from '../displayLabels';
import { formatFrequencyTier, frequencyTierOptions } from '../frequencyTiers';
import type { AppData } from '../types';
import type { ImportResult } from '../types';
import type { GalaxyEdgeType, WordGalaxy } from '../wordGalaxy';

const allGalaxyEdgeTypes: GalaxyEdgeType[] = ['belongs_to_pack', 'has_scene', 'from_source', 'has_synonym', 'confused_with', 'in_word_family', 'has_tag', 'links_to'];
const diagnosisGalaxyEdgeTypes: GalaxyEdgeType[] = ['has_scene', 'confused_with', 'in_word_family', 'from_source'];
const galaxyRenderCapOptions = [100, 250, 500];
type GalaxyTools = typeof import('../wordGalaxy');
type SettingsSection = 'diagnosis' | 'display';
type DiagnosisGroup = 'relation' | 'memory' | 'scene' | 'frequency';
type GalaxyMemoryScope = 'all' | 'new' | 'learning' | 'review' | 'release';
type GalaxyRelationFocus = 'all' | 'diagnosis' | 'scene' | 'confusion' | 'source' | 'extension';

const defaultGalaxyDisplaySettings = {
  labelOpacity: 0.72,
  nodeScale: 1.25,
  edgeWidthScale: 1.12,
  centerStrength: 0.9,
  chargeStrength: 1.12,
  linkStrengthScale: 0.95,
  linkDistanceScale: 1.12
};

const memoryScopeOptions: Array<{ key: GalaxyMemoryScope; label: string }> = [
  { key: 'all', label: '全部' },
  { key: 'new', label: '未学习' },
  { key: 'learning', label: '学习中' },
  { key: 'review', label: '待复习' },
  { key: 'release', label: '已掌握' }
];

const relationFocusOptions: Array<{ key: GalaxyRelationFocus; label: string; description: string; edgeTypes: GalaxyEdgeType[] }> = [
  {
    key: 'all',
    label: '全景',
    description: '显示全部关系，用于先看整体结构，再决定诊断方向。',
    edgeTypes: allGalaxyEdgeTypes
  },
  {
    key: 'diagnosis',
    label: '记忆诊断',
    description: '看场景、易混、词族和来源，判断为什么记不住。',
    edgeTypes: diagnosisGalaxyEdgeTypes
  },
  {
    key: 'scene',
    label: '场景提取',
    description: '看词属于什么真实任务场景，强化场景触发。',
    edgeTypes: ['belongs_to_pack', 'has_scene', 'from_source']
  },
  {
    key: 'confusion',
    label: '混淆修复',
    description: '看易混词、同义词和词族，修正错误边界。',
    edgeTypes: ['confused_with', 'has_synonym', 'in_word_family', 'has_scene']
  },
  {
    key: 'source',
    label: '来源验证',
    description: '回到来源和标签，确认这个词从哪里来、怎么用。',
    edgeTypes: ['from_source', 'has_scene', 'has_tag']
  },
  {
    key: 'extension',
    label: '语义扩展',
    description: '看同义词、词族、标签和双向链接，建立小网络。',
    edgeTypes: ['has_synonym', 'in_word_family', 'has_tag', 'links_to']
  }
];

interface GalaxyViewProps {
  data: AppData;
  onImportSceneDemo?: () => Promise<ImportResult>;
}

function DiagnosisGroupPanel({
  id,
  title,
  summary,
  openGroup,
  onOpen,
  children
}: {
  id: DiagnosisGroup;
  title: string;
  summary: string;
  openGroup: DiagnosisGroup | null;
  onOpen: (group: DiagnosisGroup | null) => void;
  children: ReactNode;
}) {
  const open = openGroup === id;
  const Icon = open ? ChevronDown : ChevronRight;

  return (
    <div className={`overflow-hidden rounded-xl border transition ${open ? 'border-brand/70 bg-white' : 'border-line bg-white'}`}>
      <button className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left" onClick={() => onOpen(open ? null : id)} type="button">
        <div className="min-w-0 text-sm font-semibold text-ink">{title}</div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`max-w-[9rem] truncate rounded-full px-2 py-1 text-xs font-semibold ${open ? 'bg-brand/10 text-brand' : 'bg-panel text-muted'}`}>{summary}</span>
          <Icon className="h-4 w-4 text-muted" />
        </div>
      </button>
      {open ? <div className="border-t border-line px-3 py-3">{children}</div> : null}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm font-medium text-ink">
      <span>{label}</span>
      <button
        aria-pressed={checked}
        className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-brand' : 'bg-slate-200'}`}
        onClick={() => onChange(!checked)}
        type="button"
      >
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </label>
  );
}

function RangeRow({ label, min, max, step = 0.05, value, onChange }: { label: string; min: number; max: number; step?: number; value: number; onChange: (value: number) => void }) {
  const clampValue = (nextValue: number) => Math.max(min, Math.min(max, Number(nextValue.toFixed(2))));

  const handleNumberChange = (rawValue: string) => {
    if (rawValue.trim() === '') {
      return;
    }
    const nextValue = Number(rawValue);
    if (Number.isFinite(nextValue)) {
      onChange(clampValue(nextValue));
    }
  };

  return (
    <div className="block text-sm font-semibold text-ink">
      <div className="flex items-center justify-between gap-3">
        <span>{label}</span>
        <input
          aria-label={`${label}数值`}
          className="h-8 w-20 rounded-lg border border-line bg-white px-2 text-right text-sm font-semibold text-ink tabular-nums outline-none focus:border-brand"
          inputMode="decimal"
          max={max}
          min={min}
          onChange={(event) => handleNumberChange(event.target.value)}
          step={step}
          type="number"
          value={Number(value.toFixed(2))}
        />
      </div>
      <input className="mt-2 h-8 w-full accent-brand" max={max} min={min} onChange={(event) => onChange(clampValue(Number(event.target.value)))} step={step} type="range" value={value} />
    </div>
  );
}

export default function GalaxyView({ data, onImportSceneDemo }: GalaxyViewProps) {
  const [domainPackId, setDomainPackId] = useState('all');
  const [sceneTag, setSceneTag] = useState('all');
  const [frequencyTier, setFrequencyTier] = useState('all');
  const [query, setQuery] = useState('');
  const [memoryScope, setMemoryScope] = useState<GalaxyMemoryScope>('all');
  const [relationFocus, setRelationFocus] = useState<GalaxyRelationFocus>('all');
  const [maxRenderedCards, setMaxRenderedCards] = useState(250);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [localDepth] = useState<0 | 1 | 2>(0);
  const [galaxyTools, setGalaxyTools] = useState<GalaxyTools | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [openSection, setOpenSection] = useState<SettingsSection>('diagnosis');
  const [openDiagnosisGroup, setOpenDiagnosisGroup] = useState<DiagnosisGroup | null>(null);
  const [showMasteryColors, setShowMasteryColors] = useState(false);
  const [showLinkArrows, setShowLinkArrows] = useState(false);
  const [labelOpacity, setLabelOpacity] = useState(defaultGalaxyDisplaySettings.labelOpacity);
  const [nodeScale, setNodeScale] = useState(defaultGalaxyDisplaySettings.nodeScale);
  const [edgeWidthScale, setEdgeWidthScale] = useState(defaultGalaxyDisplaySettings.edgeWidthScale);
  const [centerStrength, setCenterStrength] = useState(defaultGalaxyDisplaySettings.centerStrength);
  const [chargeStrength, setChargeStrength] = useState(defaultGalaxyDisplaySettings.chargeStrength);
  const [linkStrengthScale, setLinkStrengthScale] = useState(defaultGalaxyDisplaySettings.linkStrengthScale);
  const [linkDistanceScale, setLinkDistanceScale] = useState(defaultGalaxyDisplaySettings.linkDistanceScale);
  const [animationSignal, setAnimationSignal] = useState(0);
  const [demoImportMessage, setDemoImportMessage] = useState('');
  const [isImportingDemo, setIsImportingDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    void import('../wordGalaxy').then((tools) => {
      if (mounted) {
        setGalaxyTools(tools);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const allSceneTags = useMemo(() => {
    const packScenes = data.domain_packs.flatMap((pack) => pack.scenes ?? []);
    const cardScenes = data.cards.flatMap((card) => card.scene_tags);
    return Array.from(new Set([...packScenes, ...cardScenes].filter(Boolean))).sort((left, right) => formatSceneLabel(left).localeCompare(formatSceneLabel(right), 'zh-Hans-CN'));
  }, [data.cards, data.domain_packs]);

  const graphHeight = typeof window === 'undefined' ? 640 : Math.max(560, Math.min(860, window.innerHeight - (window.innerWidth < 1024 ? 104 : 80)));
  const graphFitTopInset = typeof window === 'undefined' ? 88 : window.innerWidth >= 1024 ? 112 : 76;
  const activeRelationFocus = relationFocusOptions.find((option) => option.key === relationFocus) ?? relationFocusOptions[0];
  const activeMemoryScope = memoryScopeOptions.find((option) => option.key === memoryScope) ?? memoryScopeOptions[0];
  const activeDomainPack = data.domain_packs.find((pack) => pack.domain_pack_id === domainPackId);
  const activeDomainPackName = domainPackId === 'all' ? '全部一级' : formatDomainPackLabel(domainPackId, activeDomainPack?.name);
  const activeSceneName = sceneTag === 'all' ? '全部二级' : formatSceneLabel(sceneTag);
  const activeSceneSummary = domainPackId === 'all' && sceneTag === 'all' ? '全部场景' : `${activeDomainPackName} / ${activeSceneName}`;
  const activeFrequencyLabel = frequencyTier === 'all' ? '全部' : formatFrequencyTier(frequencyTier);
  const edgeTypes = activeRelationFocus.edgeTypes;

  const galaxy = useMemo(
    () =>
      galaxyTools?.buildWordGalaxy(data, {
        domain_pack_id: domainPackId,
        query,
        mastery_stage: memoryScope,
        edge_types: edgeTypes,
        scene_tag: sceneTag,
        frequency_tier: frequencyTier,
        max_cards: maxRenderedCards,
        focus_node_id: selectedNodeId,
        local_depth: localDepth
      }) ?? ({ nodes: [], edges: [], cards: [], total_matching_cards: 0, rendered_cards: 0, truncated: false, full_node_count: 0, full_edge_count: 0 } satisfies WordGalaxy),
    [data, domainPackId, edgeTypes, frequencyTier, galaxyTools, localDepth, maxRenderedCards, memoryScope, query, sceneTag, selectedNodeId]
  );

  function resetGraphSettings() {
    setDomainPackId('all');
    setSceneTag('all');
    setFrequencyTier('all');
    setQuery('');
    setMemoryScope('all');
    setRelationFocus('all');
    setOpenDiagnosisGroup(null);
    setMaxRenderedCards(250);
    setShowMasteryColors(false);
    setShowLinkArrows(false);
    setLabelOpacity(defaultGalaxyDisplaySettings.labelOpacity);
    setNodeScale(defaultGalaxyDisplaySettings.nodeScale);
    setEdgeWidthScale(defaultGalaxyDisplaySettings.edgeWidthScale);
    setCenterStrength(defaultGalaxyDisplaySettings.centerStrength);
    setChargeStrength(defaultGalaxyDisplaySettings.chargeStrength);
    setLinkStrengthScale(defaultGalaxyDisplaySettings.linkStrengthScale);
    setLinkDistanceScale(defaultGalaxyDisplaySettings.linkDistanceScale);
  }

  async function importSceneDemoForGraph() {
    if (!onImportSceneDemo || isImportingDemo) {
      return;
    }

    setIsImportingDemo(true);
    setDemoImportMessage('');
    try {
      const result = await onImportSceneDemo();
      setDemoImportMessage(`已导入 ${result.imported_cards} 张演示词卡，图谱会自动刷新。`);
    } catch (error) {
      setDemoImportMessage(`演示包导入失败：${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsImportingDemo(false);
    }
  }

  function openGraphSettings(section: SettingsSection) {
    setOpenSection(section);
    setSettingsOpen(true);
  }

  function refreshGraphView() {
    setSelectedNodeId(null);
    setAnimationSignal((signal) => signal + 1);
  }

  return (
    <div className="-mx-3 -my-3 bg-white sm:-mx-4 sm:-my-4 lg:-mx-8 lg:-my-6">
      <div className="relative min-h-[calc(100vh-6rem)] min-h-[calc(100dvh-6rem)] overflow-hidden bg-white lg:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100dvh-3rem)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-5">
          <button
            aria-label="刷新图谱并清除选中节点"
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-brand transition hover:bg-rose-50"
            onClick={refreshGraphView}
            type="button"
          >
            <GitBranch className="h-5 w-5" />
          </button>
          <div className="text-base font-semibold text-slate-500">关系图谱</div>
          <button
            aria-label="打开关系诊断设置"
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-ink"
            onClick={() => openGraphSettings('diagnosis')}
            type="button"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <button
          aria-label="打开图谱显示微调"
          className="pointer-events-auto absolute right-5 top-16 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 hover:text-ink"
          onClick={() => openGraphSettings('display')}
          type="button"
        >
          <PencilLine className="h-5 w-5" />
        </button>

        <InteractiveGalaxyGraph
          edgeWidthScale={edgeWidthScale}
          fitTopInset={graphFitTopInset}
          frameless
          galaxy={galaxy}
          getEdgeColor={galaxyTools?.getEdgeColor}
          getNodeColor={galaxyTools?.getNodeColor}
          height={graphHeight}
          labelOpacity={labelOpacity}
          linkDistanceScale={linkDistanceScale}
          linkStrengthScale={linkStrengthScale}
          nodeScale={nodeScale}
          onSelectNode={setSelectedNodeId}
          selectedNodeId={selectedNodeId}
          showChrome={false}
          showLinkArrows={showLinkArrows}
          showMasteryColors={showMasteryColors}
          centerStrength={centerStrength}
          chargeStrength={chargeStrength}
          animationSignal={animationSignal}
        />

        {data.cards.length === 0 ? (
          <div className="absolute bottom-24 left-4 right-4 z-20 rounded-2xl border border-blue-100 bg-white/95 p-4 text-sm shadow-lg backdrop-blur sm:left-6 sm:right-auto sm:w-96">
            <div className="font-semibold text-ink">当前没有可渲染词卡</div>
            <p className="mt-1 text-muted">导入演示包后，可以预览关系图谱、拖动节点和查看详情。</p>
            {onImportSceneDemo ? (
              <button className="mt-3 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-300" disabled={isImportingDemo} onClick={() => void importSceneDemoForGraph()} type="button">
                {isImportingDemo ? '正在导入...' : '导入图谱演示包'}
              </button>
            ) : null}
            {demoImportMessage ? <div className="mt-2 text-muted">{demoImportMessage}</div> : null}
          </div>
        ) : null}

        {settingsOpen ? (
          <div className="absolute inset-0 z-30">
            <button aria-label="关闭图谱设置遮罩" className="absolute inset-0 bg-transparent" onClick={() => setSettingsOpen(false)} type="button" />
            <aside className="absolute right-3 top-16 max-h-[calc(100vh-8rem)] w-[min(22rem,calc(100vw-1.5rem))] overflow-auto rounded-2xl border border-line bg-white text-ink shadow-2xl">
              <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
                <div className="inline-flex items-center gap-2 text-base font-semibold">
                  {openSection === 'display' ? <PencilLine className="h-4 w-4 text-muted" /> : <SlidersHorizontal className="h-4 w-4 text-muted" />}
                  {openSection === 'display' ? '显示微调' : '关系诊断'}
                </div>
                <div className="flex items-center gap-1">
                  <button aria-label="重置图谱设置" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-ink" onClick={resetGraphSettings} type="button">
                    <RotateCcw className="h-5 w-5" />
                  </button>
                  <button aria-label="关闭图谱设置" className="inline-flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-50 hover:text-ink" onClick={() => setSettingsOpen(false)} type="button">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {openSection === 'diagnosis' ? (
                <div className="space-y-3 px-4 py-4">
                  <div className="rounded-xl bg-brand/5 p-3 text-xs leading-5 text-muted">
                    图谱只回答一个问题：这个词为什么记不住，应从哪个场景、关系或来源重新想起。
                  </div>

                  <label className="relative block">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                    <input className="w-full rounded-xl border border-line bg-panel py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand" onChange={(event) => setQuery(event.target.value)} placeholder="查词 / 来源 / 标签" value={query} />
                  </label>

                  <DiagnosisGroupPanel id="frequency" onOpen={setOpenDiagnosisGroup} openGroup={openDiagnosisGroup} summary={activeFrequencyLabel} title="词频">
                    <div className="grid grid-cols-2 gap-2">
                      {['all', ...frequencyTierOptions].map((tier) => (
                        <button className={`rounded-full border px-3 py-2 text-sm font-semibold ${frequencyTier === tier ? 'border-brand bg-brand text-white' : 'border-line bg-white text-muted hover:text-ink'}`} key={tier} onClick={() => setFrequencyTier(tier)} type="button">
                          {tier === 'all' ? '全部' : formatFrequencyTier(tier)}
                        </button>
                      ))}
                    </div>
                  </DiagnosisGroupPanel>

                  <DiagnosisGroupPanel id="memory" onOpen={setOpenDiagnosisGroup} openGroup={openDiagnosisGroup} summary={activeMemoryScope.label} title="记忆状态">
                    <div className="grid grid-cols-2 gap-2">
                      {memoryScopeOptions.map((option) => (
                        <button
                          className={`rounded-full border px-3 py-2 text-sm font-semibold ${memoryScope === option.key ? 'border-brand bg-brand text-white' : 'border-line bg-white text-muted hover:text-ink'}`}
                          key={option.key}
                          onClick={() => setMemoryScope(option.key)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </DiagnosisGroupPanel>

                  <DiagnosisGroupPanel id="scene" onOpen={setOpenDiagnosisGroup} openGroup={openDiagnosisGroup} summary={activeSceneSummary} title="场景范围">
                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-ink">
                        一级场景
                        <select className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" onChange={(event) => setDomainPackId(event.target.value)} value={domainPackId}>
                          <option value="all">全部一级场景</option>
                          {data.domain_packs.map((pack) => (
                            <option key={pack.domain_pack_id} value={pack.domain_pack_id}>
                              {formatDomainPackLabel(pack.domain_pack_id, pack.name)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="block text-sm font-semibold text-ink">
                        二级场景
                        <select className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" onChange={(event) => setSceneTag(event.target.value)} value={sceneTag}>
                          <option value="all">全部二级场景</option>
                          {allSceneTags.map((scene) => (
                            <option key={scene} value={scene}>
                              {formatSceneLabel(scene)}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </DiagnosisGroupPanel>

                  <DiagnosisGroupPanel id="relation" onOpen={setOpenDiagnosisGroup} openGroup={openDiagnosisGroup} summary={activeRelationFocus.label} title="关系焦点">
                    <div className="space-y-2">
                      {relationFocusOptions.map((option) => (
                        <button
                          className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${relationFocus === option.key ? 'border-brand bg-brand/10 text-ink' : 'border-line bg-white text-muted hover:text-ink'}`}
                          key={option.key}
                          onClick={() => setRelationFocus(option.key)}
                          type="button"
                        >
                          <span className={`block text-sm font-semibold ${relationFocus === option.key ? 'text-brand' : 'text-ink'}`}>{option.label}</span>
                          <span className="mt-1 block text-xs leading-5">{option.description}</span>
                        </button>
                      ))}
                    </div>
                  </DiagnosisGroupPanel>

                  <div className="rounded-xl bg-panel p-3 text-xs leading-5 text-muted">
                    当前焦点：{activeRelationFocus.label}。显示 {galaxy.rendered_cards}/{galaxy.total_matching_cards} 张词卡，{galaxy.nodes.length} 个节点，{galaxy.edges.length} 条关系。
                  </div>
                </div>
              ) : null}

              {openSection === 'display' ? (
                <div className="space-y-3 px-4 py-4">
                  <label className="block text-sm font-semibold text-ink">
                    图谱清晰度
                    <select className="mt-2 w-full rounded-xl border border-line bg-white px-3 py-2 text-sm" onChange={(event) => setMaxRenderedCards(Number(event.target.value))} value={maxRenderedCards}>
                      {galaxyRenderCapOptions.map((limit) => (
                        <option key={limit} value={limit}>
                          {limit} 张词卡
                        </option>
                      ))}
                    </select>
                  </label>
                  <ToggleRow checked={showMasteryColors} label="显示记忆颜色" onChange={setShowMasteryColors} />
                  <ToggleRow checked={showLinkArrows} label="显示方向箭头" onChange={setShowLinkArrows} />
                  <RangeRow label="节点大小" max={1.8} min={0.6} onChange={setNodeScale} step={0.05} value={nodeScale} />
                  <RangeRow label="连线粗细" max={2} min={0.5} onChange={setEdgeWidthScale} step={0.05} value={edgeWidthScale} />
                  <button className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-white" onClick={() => setAnimationSignal((value) => value + 1)} type="button">
                    <Wand2 className="h-4 w-4" />
                    重新整理图谱
                  </button>
                </div>
              ) : null}
            </aside>
          </div>
        ) : null}
      </div>
    </div>
  );
}
