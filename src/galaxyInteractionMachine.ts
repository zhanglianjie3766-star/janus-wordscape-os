export interface GraphTouchHighlight {
  nodeId: string;
  time: number;
}

export interface GraphNodeContactDecision {
  wasHighlighted: boolean;
  selectOnTap: boolean;
  highlightedNodeId: string;
  touchHighlight: GraphTouchHighlight | null;
}

export type GraphNodeTapOutcome =
  | {
      type: 'select';
      selectedNodeId: string | null;
      highlightedNodeId: string | null;
    }
  | {
      type: 'highlight';
      selectedNodeId: string | null;
      highlightedNodeId: string;
    };

export const touchHighlightWindowMs = 2400;

export function isRecentlyTouchedNode(nodeId: string, touchHighlight: GraphTouchHighlight | null, now: number, windowMs = touchHighlightWindowMs): boolean {
  return touchHighlight?.nodeId === nodeId && now - touchHighlight.time < windowMs;
}

export function resolveGraphNodeContact(params: {
  nodeId: string;
  selectedNodeId: string | null;
  highlightedNodeId: string | null;
  touchHighlight: GraphTouchHighlight | null;
  now: number;
  pointerType?: string;
}): GraphNodeContactDecision {
  const wasHighlighted =
    params.highlightedNodeId === params.nodeId ||
    params.selectedNodeId === params.nodeId ||
    isRecentlyTouchedNode(params.nodeId, params.touchHighlight, params.now);
  const isTouchLike = params.pointerType === 'touch' || params.pointerType === 'pen';

  return {
    wasHighlighted,
    selectOnTap: wasHighlighted,
    highlightedNodeId: params.nodeId,
    touchHighlight: isTouchLike ? { nodeId: params.nodeId, time: params.now } : params.touchHighlight
  };
}

export function resolveGraphNodeTap(params: {
  nodeId: string;
  selectedNodeId: string | null;
  moved: boolean;
  selectOnTap: boolean;
}): GraphNodeTapOutcome {
  if (!params.moved && params.selectOnTap) {
    const selectedNodeId = params.selectedNodeId === params.nodeId ? null : params.nodeId;
    return {
      type: 'select',
      selectedNodeId,
      highlightedNodeId: selectedNodeId
    };
  }

  return {
    type: 'highlight',
    selectedNodeId: !params.moved && params.selectedNodeId && params.selectedNodeId !== params.nodeId ? null : params.selectedNodeId,
    highlightedNodeId: params.nodeId
  };
}
