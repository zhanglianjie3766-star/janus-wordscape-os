import { forceCenter, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from 'd3-force';
import type { Force, Simulation, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';
import { RefreshCw, Scan, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';
import { formatSceneLabel } from '../displayLabels';
import { formatFrequencyTier } from '../frequencyTiers';
import { resolveGraphNodeContact, resolveGraphNodeTap, type GraphTouchHighlight } from '../galaxyInteractionMachine';
import type { MemoryStage, WordCard } from '../types';
import type { GalaxyEdge, GalaxyEdgeType, GalaxyNode, WordGalaxy } from '../wordGalaxy';

const baseGraphWidth = 960;
const defaultGraphHeight = 560;

interface InteractiveGalaxyGraphProps {
  galaxy: WordGalaxy;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  getNodeColor?: (node: GalaxyNode) => string;
  getEdgeColor?: (type: GalaxyEdgeType) => string;
  showChrome?: boolean;
  showMasteryColors?: boolean;
  showLinkArrows?: boolean;
  labelOpacity?: number;
  nodeScale?: number;
  edgeWidthScale?: number;
  centerStrength?: number;
  chargeStrength?: number;
  linkStrengthScale?: number;
  linkDistanceScale?: number;
  animationSignal?: number;
  fitTopInset?: number;
  height?: number;
  frameless?: boolean;
}

interface GraphTransform {
  x: number;
  y: number;
  k: number;
}

interface CanvasSize {
  width: number;
  height: number;
}

interface GraphNode extends SimulationNodeDatum {
  id: string;
  node: GalaxyNode;
}

interface GraphLink extends SimulationLinkDatum<GraphNode> {
  id: string;
  edge: GalaxyEdge;
  source: string | GraphNode;
  target: string | GraphNode;
}

interface DragState {
  node: GraphNode;
  targetPoint: { x: number; y: number };
  previousPoint: { x: number; y: number };
  previousTime: number;
  startClientX: number;
  startClientY: number;
  moved: boolean;
  selectOnTap: boolean;
  vx: number;
  vy: number;
}

interface PanState {
  startClientX: number;
  startClientY: number;
  startTransform: GraphTransform;
}

interface PointerContact {
  clientX: number;
  clientY: number;
}

interface PinchState {
  pointerIds: [number, number];
  startDistance: number;
  startGraphCenter: { x: number; y: number };
  startTransform: GraphTransform;
}

interface DetailPosition {
  left: number;
  top: number;
  width: number;
  maxHeight: number;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function quantile(sortedValues: number[], ratio: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }
  const index = clamp(Math.round((sortedValues.length - 1) * ratio), 0, sortedValues.length - 1);
  return sortedValues[index];
}

function endpointId(endpoint: string | number | GraphNode | undefined): string {
  if (typeof endpoint === 'object' && endpoint) {
    return endpoint.id;
  }
  return String(endpoint ?? '');
}

function truncateLabel(label: string, maxLength: number): string {
  return label.length > maxLength ? `${label.slice(0, maxLength - 1)}...` : label;
}

function formatMemoryStageLabel(stage?: MemoryStage | string): string {
  if (stage === 'release') {
    return '已掌握';
  }
  if (stage === 'reviewing' || stage === 'due' || stage === 'overdue') {
    return '待复习';
  }
  if (stage === 'learning' || stage === 'reinforce' || stage === 'downgrade') {
    return '学习中';
  }
  return '未学习';
}

function formatNodeKindLabel(type: GalaxyNode['type']): string {
  const labels: Record<GalaxyNode['type'], string> = {
    card: '词卡',
    domain_pack: '一级场景',
    scene: '二级场景',
    source: '来源',
    synonym: '同义关系',
    confusing: '易混关系',
    word_family: '词族',
    tag: '标签',
    wikilink: '双向链接'
  };
  return labels[type];
}

function nodeDiagnosticHint(type: GalaxyNode['type']): string {
  const hints: Record<GalaxyNode['type'], string> = {
    card: '从场景、来源和关系线索判断这个词为什么需要重新想起。',
    domain_pack: '先看大类是否承载了过多待处理词卡。',
    scene: '同一真实任务场景下的词，会形成最直接的回忆触发。',
    source: '同一来源说明这些词来自相近材料，适合回到原文重新理解。',
    synonym: '同义关系帮助确认边界：哪些词可替换，哪些不能。',
    confusing: '易混关系用于定位最容易混淆、最值得优先修复的词。',
    word_family: '词族关系帮助把派生词、词根和词形变化连成小网络。',
    tag: '标签用于聚合同一概念、语法或使用习惯下的词。',
    wikilink: '双向链接表示人工或材料中已经显式建立的关联。'
  };
  return hints[type];
}

function compactValues(values: string[] | undefined, limit: number): { visible: string[]; hiddenCount: number } {
  const normalized = Array.from(new Set((values ?? []).map((value) => value.trim()).filter(Boolean)));
  return {
    visible: normalized.slice(0, limit),
    hiddenCount: Math.max(0, normalized.length - limit)
  };
}

function CardChipList({ values, tone = 'slate', limit = 4 }: { values: string[] | undefined; tone?: 'red' | 'slate'; limit?: number }) {
  const compact = compactValues(values, limit);
  if (compact.visible.length === 0) {
    return <span className="text-xs text-slate-400">暂无</span>;
  }

  const chipClass = tone === 'red' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700';
  return (
    <div className="flex flex-wrap gap-1.5">
      {compact.visible.map((value) => (
        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${chipClass}`} key={value}>
          {value}
        </span>
      ))}
      {compact.hiddenCount > 0 ? <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">+{compact.hiddenCount}</span> : null}
    </div>
  );
}

function RelationLine({ label, values }: { label: string; values: string[] | undefined }) {
  const compact = compactValues(values, 3);
  if (compact.visible.length === 0) {
    return null;
  }

  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700">{label}</span>
      <div className="min-w-0 flex-1 text-xs leading-5 text-slate-600">
        {compact.visible.join(' / ')}
        {compact.hiddenCount > 0 ? ` / +${compact.hiddenCount}` : ''}
      </div>
    </div>
  );
}

function nodeDegree(node: GalaxyNode): number {
  return node.degree ?? node.count;
}

function baseNodeRadius(node: GalaxyNode): number {
  const degree = nodeDegree(node);
  if (node.type === 'card') {
    return Math.min(4.8, 1.35 + Math.sqrt(Math.max(degree, 1)) * 0.58);
  }
  return Math.min(8.8, 2.4 + Math.sqrt(Math.max(degree, node.count, 1)) * 0.86);
}

function pointerRadius(node: GalaxyNode): number {
  return Math.max(18, baseNodeRadius(node) + 10);
}

function linkDistance(edge: GalaxyEdge): number {
  if (edge.type === 'belongs_to_pack' || edge.type === 'has_scene') {
    return 122;
  }
  if (edge.type === 'from_source') {
    return 104;
  }
  if (edge.type === 'links_to') {
    return 92;
  }
  return 76;
}

function linkStrength(edge: GalaxyEdge): number {
  if (edge.type === 'belongs_to_pack' || edge.type === 'has_scene') {
    return 0.12;
  }
  if (edge.type === 'links_to') {
    return 0.1;
  }
  return 0.075;
}

function idleNodeFill(node: GalaxyNode): string {
  const degree = nodeDegree(node);
  if (node.type === 'domain_pack' || degree >= 40) {
    return '#4f4f4f';
  }
  if (node.type === 'scene' || node.type === 'source' || degree >= 18) {
    return '#5f5f5f';
  }
  if (degree >= 7) {
    return '#707070';
  }
  return '#7f7f7f';
}

function idleNodeOpacity(node: GalaxyNode): number {
  const degree = nodeDegree(node);
  if (node.type === 'domain_pack' || degree >= 40) {
    return 0.82;
  }
  if (node.type === 'scene' || node.type === 'source' || degree >= 18) {
    return 0.72;
  }
  if (degree >= 7) {
    return 0.62;
  }
  return 0.52;
}

function graphVisibilityProfile(nodeCount: number): 'compact' | 'medium' | 'large' {
  if (nodeCount > 0 && nodeCount <= 32) {
    return 'compact';
  }
  if (nodeCount <= 120) {
    return 'medium';
  }
  return 'large';
}

export default function InteractiveGalaxyGraph({
  galaxy,
  selectedNodeId,
  onSelectNode,
  getNodeColor,
  getEdgeColor,
  showChrome = true,
  showMasteryColors: controlledShowMasteryColors,
  showLinkArrows = false,
  labelOpacity = 0.96,
  nodeScale = 1,
  edgeWidthScale = 1,
  centerStrength = 1,
  chargeStrength = 1,
  linkStrengthScale = 1,
  linkDistanceScale = 1,
  animationSignal = 0,
  fitTopInset = 0,
  height = defaultGraphHeight,
  frameless = false
}: InteractiveGalaxyGraphProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const simulationRef = useRef<Simulation<GraphNode, GraphLink> | null>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const nodeMapRef = useRef<Map<string, GraphNode>>(new Map());
  const neighborMapRef = useRef<Map<string, Set<string>>>(new Map());
  const selectedNodeIdRef = useRef<string | null>(selectedNodeId);
  const hoveredNodeIdRef = useRef<string | null>(null);
  const activeNodeIdRef = useRef<string | null>(null);
  const highlightedNodeIdRef = useRef<string | null>(null);
  const showMasteryColorsRef = useRef(false);
  const showLinkArrowsRef = useRef(showLinkArrows);
  const labelOpacityRef = useRef(labelOpacity);
  const nodeScaleRef = useRef(nodeScale);
  const edgeWidthScaleRef = useRef(edgeWidthScale);
  const getNodeColorRef = useRef(getNodeColor);
  const getEdgeColorRef = useRef(getEdgeColor);
  const transformRef = useRef<GraphTransform>({ x: 0, y: 0, k: 1 });
  const sizeRef = useRef<CanvasSize>({ width: baseGraphWidth, height });
  const dragRef = useRef<DragState | null>(null);
  const panRef = useRef<PanState | null>(null);
  const activePointersRef = useRef<Map<number, PointerContact>>(new Map());
  const pinchRef = useRef<PinchState | null>(null);
  const userChangedViewportRef = useRef(false);
  const autoFitTimeoutRef = useRef<number | null>(null);
  const introAnimationTimeoutRef = useRef<number | null>(null);
  const nodePulseTimeoutRef = useRef<number | null>(null);
  const animationSignalRef = useRef(animationSignal);
  const lastTouchHighlightRef = useRef<GraphTouchHighlight | null>(null);
  const [internalShowMasteryColors, setInternalShowMasteryColors] = useState(false);
  const [layoutVersion, setLayoutVersion] = useState(0);
  const [detailPosition, setDetailPosition] = useState<DetailPosition | null>(null);
  const activeShowMasteryColors = controlledShowMasteryColors ?? internalShowMasteryColors;

  const dragForce = useMemo<Force<GraphNode, GraphLink>>(() => {
    const force = ((alpha: number) => {
      const drag = dragRef.current;
      if (!drag || drag.node.x === undefined || drag.node.y === undefined) {
        return;
      }

      const node = drag.node;
      const nodeX = node.x;
      const nodeY = node.y;
      if (nodeX === undefined || nodeY === undefined) {
        return;
      }
      const dx = drag.targetPoint.x - nodeX;
      const dy = drag.targetPoint.y - nodeY;
      const pull = clamp(Math.max(alpha, 0.1) * 0.42, 0.06, 0.34);
      node.vx = clamp((node.vx ?? 0) + dx * pull, -30, 30);
      node.vy = clamp((node.vy ?? 0) + dy * pull, -30, 30);
    }) as Force<GraphNode, GraphLink>;
    force.initialize = () => undefined;
    return force;
  }, []);

  const graphSignature = useMemo(
    () =>
      `${galaxy.nodes
        .map((node) => `${node.id}:${node.type}:${node.label}:${node.degree ?? 0}:${node.count}:${node.mastery_stage ?? ''}:${node.x.toFixed(1)}:${node.y.toFixed(1)}`)
        .join('|')}::${galaxy.edges.map((edge) => `${edge.id}:${edge.source}:${edge.target}`).join('|')}`,
    [galaxy.edges, galaxy.nodes]
  );

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) {
      return null;
    }
    return galaxy.nodes.find((node) => node.id === selectedNodeId) ?? null;
  }, [galaxy.nodes, selectedNodeId]);

  const selectedNodeCards = useMemo(() => {
    if (!selectedNode) {
      return [];
    }
    const cardIds = new Set(selectedNode.card_ids);
    return galaxy.cards.filter((card) => cardIds.has(card.card_id));
  }, [galaxy.cards, selectedNode]);

  const primarySelectedCard = useMemo<WordCard | null>(() => {
    if (!selectedNode || selectedNode.type !== 'card') {
      return null;
    }
    const primaryCardId = selectedNode.card_ids[0];
    return selectedNodeCards.find((card) => card.card_id === primaryCardId) ?? selectedNodeCards[0] ?? null;
  }, [selectedNode, selectedNodeCards]);

  const selectedCardScenes = useMemo(() => primarySelectedCard?.scene_tags.map(formatSceneLabel) ?? [], [primarySelectedCard]);

  const neighborMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const node of galaxy.nodes) {
      map.set(node.id, new Set<string>());
    }
    for (const edge of galaxy.edges) {
      map.get(edge.source)?.add(edge.target);
      map.get(edge.target)?.add(edge.source);
    }
    return map;
  }, [galaxy.edges, galaxy.nodes]);

  const renderGraph = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    const { width, height } = sizeRef.current;
    const transform = transformRef.current;
    const selectedId = selectedNodeIdRef.current;
    const persistentNodeId = selectedId ?? highlightedNodeIdRef.current;
    const interactionNodeId = activeNodeIdRef.current ?? (persistentNodeId ? null : hoveredNodeIdRef.current);
    const focusNodeId = interactionNodeId ?? persistentNodeId;
    const visualSelectedId = interactionNodeId ?? persistentNodeId;
    const neighbors = focusNodeId ? neighborMapRef.current.get(focusNodeId) ?? new Set<string>() : new Set<string>();
    const activeLinkIds = new Set<string>();
    const visibilityProfile = graphVisibilityProfile(nodesRef.current.length);
    const compactGraph = visibilityProfile === 'compact';
    const mediumGraph = visibilityProfile === 'medium';
    const effectiveNodeScale = nodeScaleRef.current * (compactGraph ? 1.62 : mediumGraph ? 1.18 : 1);

    context.save();
    context.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0);
    context.clearRect(0, 0, width, height);
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.translate(transform.x, transform.y);
    context.scale(transform.k, transform.k);

    for (const link of linksRef.current) {
      const sourceId = endpointId(link.source);
      const targetId = endpointId(link.target);
      const source = nodeMapRef.current.get(sourceId);
      const target = nodeMapRef.current.get(targetId);
      if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) {
        continue;
      }

      const active = Boolean(focusNodeId && (sourceId === focusNodeId || targetId === focusNodeId));
      if (active) {
        activeLinkIds.add(link.id);
        continue;
      }

      const idleEdgeOpacity = compactGraph ? 0.42 : mediumGraph ? 0.16 : showMasteryColorsRef.current ? 0.052 : 0.034;
      const opacity = focusNodeId ? 0.012 : idleEdgeOpacity;
      context.beginPath();
      context.strokeStyle = focusNodeId ? `rgba(128, 128, 128, ${opacity})` : compactGraph ? '#d11b3d' : showMasteryColorsRef.current || mediumGraph ? getEdgeColorRef.current?.(link.edge.type) ?? '#808080' : `rgba(128, 128, 128, ${opacity})`;
      context.globalAlpha = focusNodeId || (!showMasteryColorsRef.current && !compactGraph && !mediumGraph) ? 1 : opacity;
      context.lineWidth = ((compactGraph ? 1.08 : mediumGraph ? 0.68 : 0.38) * edgeWidthScaleRef.current) / transform.k;
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
      context.stroke();

      if (showLinkArrowsRef.current) {
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = (3.8 * edgeWidthScaleRef.current) / transform.k;
        const targetRadius = baseNodeRadius(target.node) * effectiveNodeScale + 2 / transform.k;
        const tipX = target.x - Math.cos(angle) * targetRadius;
        const tipY = target.y - Math.sin(angle) * targetRadius;
        context.beginPath();
        context.moveTo(tipX, tipY);
        context.lineTo(tipX - Math.cos(angle - Math.PI / 6) * arrowSize, tipY - Math.sin(angle - Math.PI / 6) * arrowSize);
        context.lineTo(tipX - Math.cos(angle + Math.PI / 6) * arrowSize, tipY - Math.sin(angle + Math.PI / 6) * arrowSize);
        context.closePath();
        context.fillStyle = context.strokeStyle;
        context.fill();
      }
    }

    context.globalAlpha = 1;
    for (const link of linksRef.current) {
      if (!activeLinkIds.has(link.id)) {
        continue;
      }
      const sourceId = endpointId(link.source);
      const targetId = endpointId(link.target);
      const source = nodeMapRef.current.get(sourceId);
      const target = nodeMapRef.current.get(targetId);
      if (!source || !target || source.x === undefined || source.y === undefined || target.x === undefined || target.y === undefined) {
        continue;
      }
      context.beginPath();
      context.strokeStyle = '#d11b3d';
      context.globalAlpha = 0.68;
      context.lineWidth = (0.98 * edgeWidthScaleRef.current) / transform.k;
      context.moveTo(source.x, source.y);
      context.lineTo(target.x, target.y);
      context.stroke();

      if (showLinkArrowsRef.current) {
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowSize = (5.4 * edgeWidthScaleRef.current) / transform.k;
        const targetRadius = baseNodeRadius(target.node) * effectiveNodeScale + 2 / transform.k;
        const tipX = target.x - Math.cos(angle) * targetRadius;
        const tipY = target.y - Math.sin(angle) * targetRadius;
        context.beginPath();
        context.moveTo(tipX, tipY);
        context.lineTo(tipX - Math.cos(angle - Math.PI / 6) * arrowSize, tipY - Math.sin(angle - Math.PI / 6) * arrowSize);
        context.lineTo(tipX - Math.cos(angle + Math.PI / 6) * arrowSize, tipY - Math.sin(angle + Math.PI / 6) * arrowSize);
        context.closePath();
        context.fillStyle = '#d11b3d';
        context.fill();
      }
    }

    const orderedNodes = [...nodesRef.current].sort((a, b) => {
      const aSelected = a.id === visualSelectedId ? 2 : focusNodeId && neighbors.has(a.id) ? 1 : 0;
      const bSelected = b.id === visualSelectedId ? 2 : focusNodeId && neighbors.has(b.id) ? 1 : 0;
      return aSelected - bSelected || baseNodeRadius(a.node) * effectiveNodeScale - baseNodeRadius(b.node) * effectiveNodeScale;
    });

    for (const graphNode of orderedNodes) {
      if (graphNode.x === undefined || graphNode.y === undefined) {
        continue;
      }
      const selected = visualSelectedId === graphNode.id;
      const hovered = hoveredNodeIdRef.current === graphNode.id;
      const active = !focusNodeId || selected || neighbors.has(graphNode.id);
      const radius = baseNodeRadius(graphNode.node) * effectiveNodeScale + (selected ? 2.4 : hovered ? 1.6 : 0);

      context.globalAlpha = focusNodeId ? (active ? 0.94 : 0.045) : compactGraph ? (graphNode.node.type === 'card' ? 0.86 : 0.94) : mediumGraph ? Math.max(0.32, idleNodeOpacity(graphNode.node)) : idleNodeOpacity(graphNode.node);
      context.beginPath();
      context.fillStyle = selected ? '#d11b3d' : active && focusNodeId ? '#555050' : compactGraph && graphNode.node.type !== 'card' ? '#d11b3d' : showMasteryColorsRef.current && graphNode.node.type === 'card' ? getNodeColorRef.current?.(graphNode.node) ?? idleNodeFill(graphNode.node) : idleNodeFill(graphNode.node);
      context.arc(graphNode.x, graphNode.y, radius, 0, Math.PI * 2);
      context.fill();

      context.globalAlpha = selected ? 1 : active && focusNodeId ? 0.68 : compactGraph ? 0.62 : 0.28;
      context.lineWidth = ((selected ? 1.7 : compactGraph ? 0.8 : 0.45) * edgeWidthScaleRef.current) / transform.k;
      context.strokeStyle = selected ? '#d11b3d' : '#ffffff';
      context.stroke();
    }

    const labelNodes = focusNodeId ? [nodeMapRef.current.get(focusNodeId)].filter(Boolean) : compactGraph ? orderedNodes : [];
    for (const labelNode of labelNodes) {
      if (!labelNode || labelNode.x === undefined || labelNode.y === undefined) {
        continue;
      }
      const selected = visualSelectedId === labelNode.id;
      const radius = baseNodeRadius(labelNode.node) * effectiveNodeScale + (selected ? 2.4 : 1.6);
      context.globalAlpha = focusNodeId ? labelOpacityRef.current : Math.max(0.7, labelOpacityRef.current);
      context.font = `${selected ? 700 : compactGraph ? 650 : 600} ${selected ? 13 : compactGraph ? 11 : 12}px system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      context.fillStyle = selected ? '#111827' : compactGraph && labelNode.node.type !== 'card' ? '#991b1b' : '#1f2937';
      context.textAlign = 'center';
      context.textBaseline = 'top';
      context.fillText(truncateLabel(labelNode.node.label, compactGraph ? 18 : 26), labelNode.x, labelNode.y + radius + 8);
    }

    context.restore();
  }, []);

  const applyFitView = useCallback(
    (padding = 22) => {
      const nodes = nodesRef.current.filter((node) => node.x !== undefined && node.y !== undefined);
      if (nodes.length === 0) {
        transformRef.current = { x: 0, y: 0, k: 1 };
        renderGraph();
        return;
      }

      const xs = nodes.map((node) => node.x as number);
      const ys = nodes.map((node) => node.y as number);
      const sortedXs = [...xs].sort((a, b) => a - b);
      const sortedYs = [...ys].sort((a, b) => a - b);
      const { width, height } = sizeRef.current;
      const isMobileWidth = width < 640;
      const visibilityProfile = graphVisibilityProfile(nodes.length);
      const compactGraph = visibilityProfile === 'compact';
      const mediumGraph = visibilityProfile === 'medium';
      const useSoftBounds = nodes.length >= (isMobileWidth ? 180 : 650);
      const lowBound = isMobileWidth ? 0.025 : 0.006;
      const highBound = isMobileWidth ? 0.975 : 0.994;
      const minX = useSoftBounds ? quantile(sortedXs, lowBound) : sortedXs[0];
      const maxX = useSoftBounds ? quantile(sortedXs, highBound) : sortedXs[sortedXs.length - 1];
      const minY = useSoftBounds ? quantile(sortedYs, lowBound) : sortedYs[0];
      const maxY = useSoftBounds ? quantile(sortedYs, highBound) : sortedYs[sortedYs.length - 1];
      const topSafeInset = Math.max(0, fitTopInset);
      const availableWidth = Math.max(120, width - padding * 2);
      const availableHeight = Math.max(120, height - topSafeInset - padding * 2);
      const graphWidth = Math.max(1, maxX - minX);
      const graphHeightValue = Math.max(1, maxY - minY);
      const scaleBoost = compactGraph ? (isMobileWidth ? 1.54 : 1.38) : mediumGraph ? (isMobileWidth ? 1.28 : 1.16) : isMobileWidth ? 1.18 : useSoftBounds ? 1.04 : 0.98;
      const maxScale = compactGraph ? (isMobileWidth ? 3.2 : 2.6) : mediumGraph ? (isMobileWidth ? 2.5 : 1.75) : isMobileWidth ? 2.2 : 1.12;
      const minScale = compactGraph ? (isMobileWidth ? 0.18 : 0.12) : isMobileWidth ? 0.08 : 0.028;
      const scale = clamp(Math.min(availableWidth / graphWidth, availableHeight / graphHeightValue) * scaleBoost, minScale, maxScale);
      const viewportCenterY = topSafeInset + (height - topSafeInset) / 2;

      transformRef.current = {
        k: scale,
        x: width / 2 - ((minX + maxX) / 2) * scale,
        y: viewportCenterY - ((minY + maxY) / 2) * scale
      };
      renderGraph();
    },
    [fitTopInset, renderGraph]
  );

  useEffect(() => {
    neighborMapRef.current = neighborMap;
    renderGraph();
  }, [neighborMap, renderGraph]);

  useEffect(() => {
    selectedNodeIdRef.current = selectedNodeId;
    updateDetailPosition(selectedNodeId);
    renderGraph();
  }, [selectedNodeId, renderGraph]);

  useEffect(() => {
    showMasteryColorsRef.current = activeShowMasteryColors;
    renderGraph();
  }, [activeShowMasteryColors, renderGraph]);

  useEffect(() => {
    showLinkArrowsRef.current = showLinkArrows;
    labelOpacityRef.current = labelOpacity;
    nodeScaleRef.current = nodeScale;
    edgeWidthScaleRef.current = edgeWidthScale;
    renderGraph();
  }, [edgeWidthScale, labelOpacity, nodeScale, renderGraph, showLinkArrows]);

  useEffect(() => {
    getNodeColorRef.current = getNodeColor;
    getEdgeColorRef.current = getEdgeColor;
    renderGraph();
  }, [getEdgeColor, getNodeColor, renderGraph]);

  useEffect(() => {
    const resizeCanvas = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        return;
      }
      const rect = container.getBoundingClientRect();
      const width = Math.max(320, Math.round(rect.width));
      const nextHeight = height;
      const pixelRatio = window.devicePixelRatio || 1;
      sizeRef.current = { width, height: nextHeight };
      canvas.width = Math.round(width * pixelRatio);
      canvas.height = Math.round(nextHeight * pixelRatio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${nextHeight}px`;
      if (userChangedViewportRef.current) {
        renderGraph();
      } else {
        applyFitView();
      }
      updateDetailPosition(selectedNodeIdRef.current);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [applyFitView, height, renderGraph]);

  useEffect(() => {
    simulationRef.current?.stop();
    const { width, height } = sizeRef.current;
    const nodes: GraphNode[] = galaxy.nodes.map((node) => ({
      id: node.id,
      node,
      x: (node.x / baseGraphWidth) * width,
      y: (node.y / defaultGraphHeight) * height,
      vx: 0,
      vy: 0
    }));
    const links: GraphLink[] = galaxy.edges.map((edge) => ({
      id: edge.id,
      edge,
      source: edge.source,
      target: edge.target
    }));
    const nodeMap = new Map(nodes.map((node) => [node.id, node]));

    nodesRef.current = nodes;
    linksRef.current = links;
    nodeMapRef.current = nodeMap;
    userChangedViewportRef.current = false;

    const simulation = forceSimulation<GraphNode>(nodes)
      .alpha(0.82)
      .alphaMin(0.006)
      .alphaDecay(galaxy.nodes.length > 800 ? 0.015 : 0.018)
      .velocityDecay(0.14)
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(links)
          .id((node) => node.id)
          .distance((link) => linkDistance(link.edge) * linkDistanceScale)
          .strength((link) => linkStrength(link.edge) * linkStrengthScale)
      )
      .force(
        'charge',
        forceManyBody<GraphNode>().strength((node) => {
          const degree = nodeDegree(node.node);
          if (node.node.type === 'domain_pack' || degree >= 40) {
            return -58 * chargeStrength;
          }
          if (node.node.type === 'scene' || node.node.type === 'source' || degree >= 18) {
            return -38 * chargeStrength;
          }
          return (node.node.type === 'card' ? -15 : -24) * chargeStrength;
        })
      )
      .force('collide', forceCollide<GraphNode>().radius((node) => baseNodeRadius(node.node) * nodeScale + 3.4).strength(0.52))
      .force('drag', dragForce)
      .force('x', forceX<GraphNode>(width / 2).strength(0.018 * centerStrength))
      .force('y', forceY<GraphNode>(height / 2).strength(0.018 * centerStrength))
      .force('center', forceCenter(width / 2, height / 2))
      .on('tick', renderGraph);

    simulation.tick(galaxy.nodes.length > 700 ? 90 : 120);
    applyFitView();
    if (autoFitTimeoutRef.current !== null) {
      window.clearTimeout(autoFitTimeoutRef.current);
    }
    autoFitTimeoutRef.current = window.setTimeout(() => {
      if (!userChangedViewportRef.current) {
        applyFitView();
      }
    }, 650);
    simulationRef.current = simulation;
    startGentleMotion();

    return () => {
      simulation.stop();
      if (autoFitTimeoutRef.current !== null) {
        window.clearTimeout(autoFitTimeoutRef.current);
        autoFitTimeoutRef.current = null;
      }
      if (introAnimationTimeoutRef.current !== null) {
        window.clearTimeout(introAnimationTimeoutRef.current);
        introAnimationTimeoutRef.current = null;
      }
      if (nodePulseTimeoutRef.current !== null) {
        window.clearTimeout(nodePulseTimeoutRef.current);
        nodePulseTimeoutRef.current = null;
      }
      if (simulationRef.current === simulation) {
        simulationRef.current = null;
      }
    };
  }, [applyFitView, centerStrength, chargeStrength, dragForce, graphSignature, layoutVersion, linkDistanceScale, linkStrengthScale, nodeScale, renderGraph]);

  const finishPointerInteraction = useCallback((selectTappedNode = false) => {
    const drag = dragRef.current;
    if (drag) {
      const neighbors = neighborMapRef.current.get(drag.node.id) ?? new Set<string>();
      drag.node.fx = null;
      drag.node.fy = null;
      drag.node.vx = clamp((drag.node.vx ?? 0) + drag.vx * 0.72, -24, 24);
      drag.node.vy = clamp((drag.node.vy ?? 0) + drag.vy * 0.72, -24, 24);
      for (const neighborId of neighbors) {
        const neighbor = nodeMapRef.current.get(neighborId);
        if (!neighbor) {
          continue;
        }
        neighbor.vx = clamp((neighbor.vx ?? 0) + drag.vx * 0.16, -10, 10);
        neighbor.vy = clamp((neighbor.vy ?? 0) + drag.vy * 0.16, -10, 10);
      }
      dragRef.current = null;
      const tapOutcome = resolveGraphNodeTap({
        nodeId: drag.node.id,
        selectedNodeId: selectedNodeIdRef.current,
        moved: drag.moved || !selectTappedNode,
        selectOnTap: drag.selectOnTap
      });
      const previousSelectedNodeId = selectedNodeIdRef.current;
      selectedNodeIdRef.current = tapOutcome.selectedNodeId;
      highlightedNodeIdRef.current = tapOutcome.highlightedNodeId;
      activeNodeIdRef.current = null;
      if (tapOutcome.type === 'select' || previousSelectedNodeId !== tapOutcome.selectedNodeId) {
        updateDetailPosition(tapOutcome.selectedNodeId);
        onSelectNode(tapOutcome.selectedNodeId);
      }
      updateCursor('grab');
      settleSimulation();
      renderGraph();
      return;
    }

    if (panRef.current || activeNodeIdRef.current) {
      panRef.current = null;
      activeNodeIdRef.current = null;
      updateCursor('grab');
      renderGraph();
    }
  }, [onSelectNode, renderGraph]);

  useEffect(() => {
    const finishPointer = (event: PointerEvent) => {
      if (event.target === canvasRef.current) {
        return;
      }
      activePointersRef.current.delete(event.pointerId);
      if (pinchRef.current && activePointersRef.current.size < 2) {
        pinchRef.current = null;
      }
      finishPointerInteraction();
    };
    const finishAll = () => {
      activePointersRef.current.clear();
      pinchRef.current = null;
      finishPointerInteraction();
    };
    window.addEventListener('pointerup', finishPointer, true);
    window.addEventListener('pointercancel', finishPointer, true);
    window.addEventListener('blur', finishAll);
    return () => {
      window.removeEventListener('pointerup', finishPointer, true);
      window.removeEventListener('pointercancel', finishPointer, true);
      window.removeEventListener('blur', finishAll);
    };
  }, [finishPointerInteraction]);

  function graphPointFromClient(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    const transform = transformRef.current;
    if (!rect) {
      return { x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 };
    }
    return {
      x: (clientX - rect.left - transform.x) / transform.k,
      y: (clientY - rect.top - transform.y) / transform.k
    };
  }

  function screenPointFromClient(clientX: number, clientY: number) {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return { x: sizeRef.current.width / 2, y: sizeRef.current.height / 2 };
    }
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function pointerDistance(first: PointerContact, second: PointerContact): number {
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  }

  function pointerMidpoint(first: PointerContact, second: PointerContact): PointerContact {
    return {
      clientX: (first.clientX + second.clientX) / 2,
      clientY: (first.clientY + second.clientY) / 2
    };
  }

  function startPinchFromActivePointers(): boolean {
    const pointers = [...activePointersRef.current.entries()].slice(0, 2);
    if (pointers.length < 2) {
      return false;
    }
    const [[firstId, first], [secondId, second]] = pointers;
    const startDistance = pointerDistance(first, second);
    if (startDistance < 8) {
      return false;
    }
    const center = pointerMidpoint(first, second);
    const screenCenter = screenPointFromClient(center.clientX, center.clientY);
    const transform = transformRef.current;
    dragRef.current = null;
    panRef.current = null;
    activeNodeIdRef.current = null;
    pinchRef.current = {
      pointerIds: [firstId, secondId],
      startDistance,
      startGraphCenter: {
        x: (screenCenter.x - transform.x) / transform.k,
        y: (screenCenter.y - transform.y) / transform.k
      },
      startTransform: { ...transform }
    };
    userChangedViewportRef.current = true;
    updateCursor('grab');
    renderGraph();
    return true;
  }

  function updatePinchViewport(): boolean {
    const pinch = pinchRef.current;
    if (!pinch) {
      return false;
    }
    const first = activePointersRef.current.get(pinch.pointerIds[0]);
    const second = activePointersRef.current.get(pinch.pointerIds[1]);
    if (!first || !second) {
      return false;
    }
    const distance = pointerDistance(first, second);
    if (distance < 8) {
      return true;
    }
    const center = pointerMidpoint(first, second);
    const screenCenter = screenPointFromClient(center.clientX, center.clientY);
    const nextScale = clamp(pinch.startTransform.k * (distance / pinch.startDistance), 0.08, 4.8);
    transformRef.current = {
      k: nextScale,
      x: screenCenter.x - pinch.startGraphCenter.x * nextScale,
      y: screenCenter.y - pinch.startGraphCenter.y * nextScale
    };
    userChangedViewportRef.current = true;
    renderGraph();
    updateDetailPosition(selectedNodeIdRef.current);
    return true;
  }

  function findNodeAt(clientX: number, clientY: number): GraphNode | null {
    const point = graphPointFromClient(clientX, clientY);
    let best: GraphNode | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const node of nodesRef.current) {
      if (node.x === undefined || node.y === undefined) {
        continue;
      }
      const transform = transformRef.current;
      const screenRadius = Math.max(pointerRadius(node.node) * nodeScaleRef.current, transform.k < 0.2 ? 30 : 22);
      const radius = screenRadius / transform.k;
      const distance = Math.hypot(point.x - node.x, point.y - node.y);
      if (distance <= radius && distance < bestDistance) {
        best = node;
        bestDistance = distance;
      }
    }
    return best;
  }

  function heatSimulation(target = 0.34) {
    simulationRef.current?.alphaTarget(target).restart();
  }

  function settleSimulation() {
    const simulation = simulationRef.current;
    if (!simulation) {
      return;
    }
    simulation.alphaTarget(0);
    if (simulation.alpha() < 0.14) {
      simulation.alpha(0.14).restart();
    }
  }

  function pulseNodeNeighborhood(nodeId: string) {
    const simulation = simulationRef.current;
    const focusNode = nodeMapRef.current.get(nodeId);
    if (!simulation || !focusNode || focusNode.x === undefined || focusNode.y === undefined) {
      return;
    }

    const neighbors = [...(neighborMapRef.current.get(nodeId) ?? new Set<string>())]
      .map((neighborId) => nodeMapRef.current.get(neighborId))
      .filter((node): node is GraphNode => Boolean(node && node.x !== undefined && node.y !== undefined))
      .slice(0, 80);

    const focusX = focusNode.x;
    const focusY = focusNode.y;
    const pulseBase = graphVisibilityProfile(nodesRef.current.length) === 'large' ? 1.55 : 2.05;

    focusNode.vx = clamp((focusNode.vx ?? 0) + Math.sin(nodeId.length) * 0.72, -8, 8);
    focusNode.vy = clamp((focusNode.vy ?? 0) + Math.cos(nodeId.length) * 0.72, -8, 8);

    neighbors.forEach((neighbor, index) => {
      const dx = (neighbor.x ?? focusX) - focusX;
      const dy = (neighbor.y ?? focusY) - focusY;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const normalizedX = dx / distance;
      const normalizedY = dy / distance;
      const direction = index % 2 === 0 ? 1 : -1;
      const jitter = 0.72 + (index % 5) * 0.08;
      const radial = pulseBase * jitter;
      const tangent = pulseBase * 0.34 * direction;

      neighbor.vx = clamp((neighbor.vx ?? 0) + normalizedX * radial - normalizedY * tangent, -9, 9);
      neighbor.vy = clamp((neighbor.vy ?? 0) + normalizedY * radial + normalizedX * tangent, -9, 9);
    });

    simulation.alpha(Math.max(simulation.alpha(), 0.24)).alphaTarget(0.055).restart();
    if (nodePulseTimeoutRef.current !== null) {
      window.clearTimeout(nodePulseTimeoutRef.current);
    }
    nodePulseTimeoutRef.current = window.setTimeout(() => {
      if (simulationRef.current === simulation) {
        simulation.alphaTarget(0);
      }
      nodePulseTimeoutRef.current = null;
    }, 620);
  }

  function startGentleMotion(target = 0.028, duration = 1900) {
    const simulation = simulationRef.current;
    if (!simulation || nodesRef.current.length === 0) {
      return;
    }
    if (introAnimationTimeoutRef.current !== null) {
      window.clearTimeout(introAnimationTimeoutRef.current);
      introAnimationTimeoutRef.current = null;
    }
    const { width, height } = sizeRef.current;
    const centerX = width / 2;
    const centerY = height / 2;
    nodesRef.current.forEach((node, index) => {
      if (node.x === undefined || node.y === undefined) {
        return;
      }
      const angle = (index * 2.399963 + node.id.length * 0.37) % (Math.PI * 2);
      const distanceX = node.x - centerX;
      const distanceY = node.y - centerY;
      const distance = Math.max(1, Math.hypot(distanceX, distanceY));
      const radiusBoost = node.node.type === 'card' ? 0.72 : 0.48;
      node.vx = clamp((node.vx ?? 0) + Math.cos(angle) * radiusBoost - (distanceY / distance) * 0.24, -3, 3);
      node.vy = clamp((node.vy ?? 0) + Math.sin(angle) * radiusBoost + (distanceX / distance) * 0.24, -3, 3);
    });
    simulation.alpha(Math.max(simulation.alpha(), 0.34)).alphaTarget(target).restart();
    introAnimationTimeoutRef.current = window.setTimeout(() => {
      if (simulationRef.current === simulation) {
        simulation.alphaTarget(0);
      }
      introAnimationTimeoutRef.current = null;
    }, duration);
  }

  function updateCursor(cursor: string) {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = cursor;
    }
  }

  function computeDetailPosition(nodeId: string): DetailPosition | null {
    const graphNode = nodeMapRef.current.get(nodeId);
    if (!graphNode || graphNode.x === undefined || graphNode.y === undefined) {
      return null;
    }

    const { width, height } = sizeRef.current;
    const transform = transformRef.current;
    const nodeScreenX = graphNode.x * transform.k + transform.x;
    const nodeScreenY = graphNode.y * transform.k + transform.y;
    const safeLeft = 12;
    const safeRight = Math.max(safeLeft + 220, width - 76);
    const detailWidth = clamp(width < 640 ? width - 88 : 320, 220, Math.max(220, safeRight - safeLeft));
    const estimatedHeight = 230;
    const offset = 28;
    const preferredLeft = nodeScreenX < width / 2 ? nodeScreenX + offset : nodeScreenX - detailWidth - offset;
    const preferredTop = nodeScreenY < height / 2 ? nodeScreenY + offset : nodeScreenY - estimatedHeight - offset;
    const left = clamp(preferredLeft, safeLeft, Math.max(safeLeft, safeRight - detailWidth));
    const top = clamp(preferredTop, 72, Math.max(72, height - estimatedHeight - 16));

    return {
      left,
      top,
      width: detailWidth,
      maxHeight: Math.max(160, height - top - 16)
    };
  }

  function updateDetailPosition(nodeId: string | null) {
    setDetailPosition(nodeId ? computeDetailPosition(nodeId) : null);
  }

  function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    activePointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    try {
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic smoke tests can dispatch pointer events without browser capture state.
    }
    if (activePointersRef.current.size >= 2 && startPinchFromActivePointers()) {
      return;
    }

    const node = findNodeAt(event.clientX, event.clientY);
    const point = graphPointFromClient(event.clientX, event.clientY);

    if (node) {
      const now = performance.now();
      const contact = resolveGraphNodeContact({
        nodeId: node.id,
        selectedNodeId: selectedNodeIdRef.current,
        highlightedNodeId: highlightedNodeIdRef.current,
        touchHighlight: lastTouchHighlightRef.current,
        now,
        pointerType: event.pointerType
      });
      node.vx = (node.vx ?? 0) * 0.5;
      node.vy = (node.vy ?? 0) * 0.5;
      dragRef.current = {
        node,
        targetPoint: point,
        previousPoint: point,
        previousTime: performance.now(),
        startClientX: event.clientX,
        startClientY: event.clientY,
        moved: false,
        selectOnTap: contact.selectOnTap,
        vx: 0,
        vy: 0
      };
      hoveredNodeIdRef.current = node.id;
      activeNodeIdRef.current = node.id;
      highlightedNodeIdRef.current = contact.highlightedNodeId;
      lastTouchHighlightRef.current = contact.touchHighlight;
      if (!contact.wasHighlighted) {
        pulseNodeNeighborhood(node.id);
      }
      updateCursor('grabbing');
      heatSimulation(0.42);
      renderGraph();
      return;
    }

    panRef.current = {
      startClientX: event.clientX,
      startClientY: event.clientY,
      startTransform: { ...transformRef.current }
    };
    updateCursor('grabbing');
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
    if (activePointersRef.current.has(event.pointerId)) {
      activePointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY });
    }
    if (pinchRef.current) {
      event.preventDefault();
      updatePinchViewport();
      return;
    }

    const drag = dragRef.current;
    if (drag) {
      event.preventDefault();
      if (Math.hypot(event.clientX - drag.startClientX, event.clientY - drag.startClientY) > 6) {
        drag.moved = true;
      }
      const nextPoint = graphPointFromClient(event.clientX, event.clientY);
      const now = performance.now();
      const elapsedFrames = Math.max(1, (now - drag.previousTime) / 16.67);
      drag.vx = (nextPoint.x - drag.previousPoint.x) / elapsedFrames;
      drag.vy = (nextPoint.y - drag.previousPoint.y) / elapsedFrames;
      drag.targetPoint = nextPoint;
      if (drag.node.x !== undefined && drag.node.y !== undefined) {
        const dx = nextPoint.x - drag.node.x;
        const dy = nextPoint.y - drag.node.y;
        drag.node.vx = clamp((drag.node.vx ?? 0) + dx * 0.06, -24, 24);
        drag.node.vy = clamp((drag.node.vy ?? 0) + dy * 0.06, -24, 24);
      }
      drag.previousPoint = nextPoint;
      drag.previousTime = now;
      heatSimulation(0.42);
      return;
    }

    const pan = panRef.current;
    if (pan) {
      event.preventDefault();
      userChangedViewportRef.current = true;
      transformRef.current = {
        ...pan.startTransform,
        x: pan.startTransform.x + event.clientX - pan.startClientX,
        y: pan.startTransform.y + event.clientY - pan.startClientY
      };
      if ((event.pointerType === 'touch' || event.pointerType === 'pen') && !selectedNodeIdRef.current && !highlightedNodeIdRef.current) {
        const touchedNode = findNodeAt(event.clientX, event.clientY);
        const nextHoveredId = touchedNode?.id ?? null;
        if (hoveredNodeIdRef.current !== nextHoveredId) {
          hoveredNodeIdRef.current = nextHoveredId;
          if (nextHoveredId) {
            highlightedNodeIdRef.current = nextHoveredId;
            lastTouchHighlightRef.current = { nodeId: nextHoveredId, time: performance.now() };
          }
        }
      }
      renderGraph();
      updateDetailPosition(selectedNodeIdRef.current);
      return;
    }

    const hovered = findNodeAt(event.clientX, event.clientY);
    const nextHoveredId = hovered?.id ?? null;
    if (hoveredNodeIdRef.current !== nextHoveredId) {
      hoveredNodeIdRef.current = nextHoveredId;
      updateCursor(hovered ? 'pointer' : 'grab');
      renderGraph();
    }
  }

  function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
    try {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Ignore synthetic pointer events that were never captured by the browser.
    }
    activePointersRef.current.delete(event.pointerId);
    if (pinchRef.current) {
      if (activePointersRef.current.size < 2) {
        pinchRef.current = null;
        updateCursor('grab');
        renderGraph();
      }
      return;
    }

    finishPointerInteraction(true);
  }

  function handlePointerLeave() {
    if (!dragRef.current && !panRef.current) {
      hoveredNodeIdRef.current = null;
      activeNodeIdRef.current = null;
      updateCursor('grab');
      renderGraph();
    }
  }

  function handleWheel(event: WheelEvent) {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    const transform = transformRef.current;
    const screenX = event.clientX - rect.left;
    const screenY = event.clientY - rect.top;
    const graphX = (screenX - transform.x) / transform.k;
    const graphY = (screenY - transform.y) / transform.k;
    const nextScale = clamp(transform.k * (event.deltaY < 0 ? 1.12 : 0.9), sizeRef.current.width < 640 ? 0.08 : 0.035, 4.8);
    userChangedViewportRef.current = true;
    transformRef.current = {
      k: nextScale,
      x: screenX - graphX * nextScale,
      y: screenY - graphY * nextScale
    };
    renderGraph();
    updateDetailPosition(selectedNodeIdRef.current);
  }

  function fitView() {
    userChangedViewportRef.current = false;
    applyFitView();
  }

  function resetLayout() {
    dragRef.current = null;
    panRef.current = null;
    hoveredNodeIdRef.current = null;
    activeNodeIdRef.current = null;
    highlightedNodeIdRef.current = null;
    userChangedViewportRef.current = false;
    transformRef.current = { x: 0, y: 0, k: 1 };
    setLayoutVersion((version) => version + 1);
  }

  function closeSelectedNode() {
    selectedNodeIdRef.current = null;
    hoveredNodeIdRef.current = null;
    activeNodeIdRef.current = null;
    highlightedNodeIdRef.current = null;
    setDetailPosition(null);
    onSelectNode(null);
    renderGraph();
  }

  useEffect(() => {
    if (animationSignal === animationSignalRef.current) {
      return;
    }
    animationSignalRef.current = animationSignal;
    resetLayout();
  }, [animationSignal]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const handleNativeWheel = (event: WheelEvent) => handleWheel(event);
    canvas.addEventListener('wheel', handleNativeWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', handleNativeWheel);
    };
  }, []);

  return (
    <div className={frameless ? 'relative overflow-hidden bg-white' : 'relative overflow-hidden rounded-md border border-slate-200 bg-white'} ref={containerRef}>
      {showChrome ? (
        <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-2 rounded-full border border-white/80 bg-white/90 p-1 text-xs shadow-sm backdrop-blur">
          <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100" onClick={resetLayout} type="button">
            <RefreshCw className="h-3.5 w-3.5" />
            重新布局
          </button>
          <button className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-slate-700 hover:bg-slate-100" onClick={fitView} type="button">
            <Scan className="h-3.5 w-3.5" />
            适合视图
          </button>
          <button className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${activeShowMasteryColors ? 'bg-slate-800 text-white' : 'text-slate-700 hover:bg-slate-100'}`} onClick={() => setInternalShowMasteryColors((value) => !value)} type="button">
            掌握颜色
          </button>
        </div>
      ) : null}

      {selectedNode ? (
        <div
          aria-live="polite"
          className="pointer-events-none absolute z-10 overflow-hidden rounded-xl border border-slate-200 bg-white/95 p-3 pr-9 text-sm shadow-md backdrop-blur"
          style={{
            left: detailPosition?.left ?? 12,
            top: detailPosition?.top ?? 72,
            width: detailPosition?.width ?? 320,
            maxHeight: detailPosition?.maxHeight ?? 260
          }}
        >
          <button
            aria-label="关闭节点详情"
            className="pointer-events-auto absolute right-2 top-2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            onClick={(event) => {
              event.stopPropagation();
              closeSelectedNode();
            }}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
          {primarySelectedCard ? (
            <>
              <div className="text-xs font-medium text-slate-500">
                词卡 · {formatMemoryStageLabel(selectedNode.mastery_stage ?? selectedNode.subtitle)} · {formatFrequencyTier(primarySelectedCard.frequency_tier)}
              </div>
              <div className="mt-1 flex min-w-0 items-center gap-2">
                <div className="truncate text-lg font-semibold text-slate-950">{primarySelectedCard.headword}</div>
                {primarySelectedCard.part_of_speech ? <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">{primarySelectedCard.part_of_speech}</span> : null}
              </div>
              {primarySelectedCard.phonetic ? <div className="mt-1 text-xs text-slate-500">{primarySelectedCard.phonetic}</div> : null}
              <div className="mt-2 line-clamp-3 rounded-lg bg-slate-50 px-2.5 py-2 text-xs leading-5 text-slate-600">{primarySelectedCard.definition_zh || primarySelectedCard.definition_en}</div>

              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-xs font-semibold text-slate-500">场景</span>
                  <CardChipList values={selectedCardScenes.length > 0 ? selectedCardScenes : ['未分组']} tone="red" limit={3} />
                </div>
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 shrink-0 text-xs font-semibold text-slate-500">来源</span>
                  {primarySelectedCard.source.source_url ? (
                    <a className="pointer-events-auto min-w-0 truncate text-xs font-medium text-rose-700 underline-offset-2 hover:underline" href={primarySelectedCard.source.source_url} rel="noreferrer" target="_blank">
                      {primarySelectedCard.source.source_name || primarySelectedCard.source.source_url}
                    </a>
                  ) : (
                    <span className="min-w-0 truncate text-xs text-slate-600">{primarySelectedCard.source.source_name || '未记录'}</span>
                  )}
                </div>
              </div>

              <div className="mt-3 border-t border-slate-100 pt-2">
                <div className="mb-1 text-xs font-semibold text-slate-500">关系线索</div>
                <div className="space-y-1.5">
                  <RelationLine label="易混" values={primarySelectedCard.confusing_words} />
                  <RelationLine label="同义" values={primarySelectedCard.synonyms} />
                  <RelationLine label="词族" values={primarySelectedCard.word_family} />
                  <RelationLine label="标签" values={primarySelectedCard.tags} />
                  <RelationLine label="链接" values={primarySelectedCard.links} />
                  {!primarySelectedCard.confusing_words?.length && !primarySelectedCard.synonyms?.length && !primarySelectedCard.word_family?.length && !primarySelectedCard.tags?.length && !primarySelectedCard.links?.length ? (
                    <div className="text-xs text-slate-400">暂无显式关系线索</div>
                  ) : null}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="text-xs font-medium text-slate-500">
                {formatNodeKindLabel(selectedNode.type)} · 关联 {selectedNode.card_ids.length} 个单词
              </div>
              <div className="mt-1 truncate text-lg font-semibold text-slate-950">{selectedNode.label}</div>
              <div className="mt-2 line-clamp-2 rounded-lg bg-rose-50 px-2.5 py-2 text-xs leading-5 text-slate-600">{nodeDiagnosticHint(selectedNode.type)}</div>
              {selectedNode.subtitle ? <div className="mt-2 truncate rounded bg-slate-50 px-2 py-1 text-xs text-slate-600">{selectedNode.subtitle}</div> : null}
              {selectedNodeCards.length > 0 ? (
                <div className="mt-3 border-t border-slate-100 pt-2">
                  <div className="mb-1 text-xs font-semibold text-slate-500">相关单词</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedNodeCards.slice(0, 6).map((card) => (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700" key={card.card_id}>
                        {card.headword}
                      </span>
                    ))}
                    {selectedNodeCards.length > 6 ? <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">+{selectedNodeCards.length - 6}</span> : null}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <canvas
        aria-label="TechLex OS word galaxy"
        className="block h-[560px] w-full touch-none select-none"
        onPointerCancel={handlePointerUp}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerLeave}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        ref={canvasRef}
        role="img"
      />

      {showChrome ? (
        <div className="absolute bottom-3 left-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-xs text-slate-600 shadow-sm backdrop-blur">
          点亮后再点查看详情 · 拖动画布平移 · 拖动节点牵动邻居 · 滚轮或双指缩放
        </div>
      ) : null}
    </div>
  );
}
