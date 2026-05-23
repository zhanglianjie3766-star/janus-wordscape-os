import { getPackName } from './domainPacks';
import { formatDomainPackLabel, formatSceneLabel } from './displayLabels';
import { formatFrequencyTier } from './frequencyTiers';
import type { AppData, MemoryStage, UserMemoryState, WordCard } from './types';

export type GalaxyNodeType = 'card' | 'domain_pack' | 'scene' | 'source' | 'synonym' | 'confusing' | 'word_family' | 'tag' | 'wikilink';

export type GalaxyEdgeType = 'belongs_to_pack' | 'has_scene' | 'from_source' | 'has_synonym' | 'confused_with' | 'in_word_family' | 'has_tag' | 'links_to';

export interface GalaxyFilters {
  domain_pack_id: string;
  query: string;
  mastery_stage: string;
  edge_types: GalaxyEdgeType[];
  scene_tag?: string;
  frequency_tier?: string;
  max_cards?: number;
  focus_node_id?: string | null;
  local_depth?: 0 | 1 | 2;
}

export interface GalaxyNode {
  id: string;
  type: GalaxyNodeType;
  label: string;
  subtitle?: string;
  count: number;
  degree?: number;
  card_ids: string[];
  mastery_stage?: MemoryStage;
  source_url?: string;
  obsidian_ref: string;
  x: number;
  y: number;
}

export interface GalaxyEdge {
  id: string;
  type: GalaxyEdgeType;
  source: string;
  target: string;
  label: string;
  card_id: string;
}

export interface WordGalaxy {
  nodes: GalaxyNode[];
  edges: GalaxyEdge[];
  cards: WordCard[];
  total_matching_cards: number;
  rendered_cards: number;
  truncated: boolean;
  full_node_count: number;
  full_edge_count: number;
}

export interface ObsidianLinkIndex {
  explicit_links: string[];
  outgoing_edges: GalaxyEdge[];
  backlink_edges: GalaxyEdge[];
  backlinks: WordCard[];
  tags: string[];
  hub_path: string;
}

const relationLabels: Record<GalaxyEdgeType, string> = {
  belongs_to_pack: '领域包',
  has_scene: '场景',
  from_source: '来源',
  has_synonym: '同义词',
  confused_with: '易混词',
  in_word_family: '词族',
  has_tag: '标签',
  links_to: '双向链接'
};

const relationToNodeType: Record<GalaxyEdgeType, GalaxyNodeType> = {
  belongs_to_pack: 'domain_pack',
  has_scene: 'scene',
  from_source: 'source',
  has_synonym: 'synonym',
  confused_with: 'confusing',
  in_word_family: 'word_family',
  has_tag: 'tag',
  links_to: 'wikilink'
};

export const defaultGalaxyEdgeTypes: GalaxyEdgeType[] = ['belongs_to_pack', 'has_scene', 'from_source', 'has_synonym', 'confused_with', 'in_word_family', 'has_tag', 'links_to'];

export function getGalaxyRelationLabel(type: GalaxyEdgeType): string {
  return relationLabels[type];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[[\]#|]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff/_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeLinkLabel(value: string): string {
  return value.replace(/^#/, '').trim();
}

function cardObsidianRef(card: WordCard): string {
  return `[[${card.headword}]]`;
}

function nodeObsidianRef(node: Pick<GalaxyNode, 'type' | 'label'>): string {
  if (node.type === 'tag') {
    return `#${node.label}`;
  }
  return `[[${node.label}]]`;
}

function getCardTextBlocks(card: WordCard): string[] {
  return [
    card.headword,
    card.definition_zh,
    card.definition_en,
    card.notes ?? '',
    ...card.usage_tasks,
    ...card.examples.flatMap((example) => [example.example_en, example.example_zh, example.context ?? ''])
  ];
}

export function extractWikilinks(text: string): string[] {
  const links: string[] = [];
  const pattern = /\[\[([^\]\|#]+)(?:#[^\]\|]*)?(?:\|[^\]]+)?\]\]/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    links.push(normalizeLinkLabel(match[1]));
  }

  return unique(links);
}

export function extractInlineTags(text: string): string[] {
  const tags: string[] = [];
  const pattern = /(?:^|\s)#([A-Za-z0-9_\-/\u4e00-\u9fff]+)/g;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    tags.push(match[1]);
  }

  return unique(tags);
}

export function getExplicitLinks(card: WordCard): string[] {
  return unique([...(card.links ?? []), ...getCardTextBlocks(card).flatMap(extractWikilinks)]);
}

export function getExplicitTags(card: WordCard): string[] {
  return unique([...(card.tags ?? []), ...getCardTextBlocks(card).flatMap(extractInlineTags)]);
}

export function getSystemTags(card: WordCard, data: AppData, state?: UserMemoryState): string[] {
  return unique([
    `pack/${card.domain_pack_id}`,
    `frequency/${card.frequency_tier.toLowerCase()}`,
    `part-of-speech/${normalize(card.part_of_speech)}`,
    `source/${card.source.source_id || normalize(card.source.source_name)}`,
    `source-priority/${card.source.source_priority.toLowerCase()}`,
    ...(card.scene_tags ?? []).map((scene) => `scene/${normalize(scene)}`),
    `stage/${state?.stage ?? 'new'}`,
    `domain/${normalize(getPackName(data.domain_packs, card.domain_pack_id))}`
  ]);
}

export function getObsidianTags(card: WordCard, data: AppData, state?: UserMemoryState): string[] {
  return unique([...getExplicitTags(card), ...getSystemTags(card, data, state)]);
}

function buildCardAliasMap(cards: WordCard[]): Map<string, WordCard> {
  const map = new Map<string, WordCard>();

  for (const card of cards) {
    for (const alias of unique([card.card_id, card.headword, ...(card.aliases ?? [])])) {
      map.set(alias.toLowerCase(), card);
      map.set(normalize(alias), card);
    }
  }

  return map;
}

function resolveLinkNodeId(link: string, aliasMap: Map<string, WordCard>): string {
  const target = aliasMap.get(link.toLowerCase()) ?? aliasMap.get(normalize(link));
  return target ? `card:${target.card_id}` : `link:${normalize(link)}`;
}

function addNode(nodes: Map<string, GalaxyNode>, node: Omit<GalaxyNode, 'count' | 'card_ids' | 'obsidian_ref' | 'x' | 'y'> & { obsidian_ref?: string }, cardId: string): void {
  const existing = nodes.get(node.id);

  if (existing) {
    existing.count += 1;
    if (!existing.card_ids.includes(cardId)) {
      existing.card_ids.push(cardId);
    }
    return;
  }

  nodes.set(node.id, {
    ...node,
    obsidian_ref: node.obsidian_ref ?? nodeObsidianRef(node),
    count: 1,
    card_ids: [cardId],
    x: 0,
    y: 0
  });
}

function addEdge(edges: Map<string, GalaxyEdge>, cardId: string, sourceId: string, targetId: string, type: GalaxyEdgeType): void {
  const id = `${sourceId}-${type}-${targetId}-${cardId}`;
  if (edges.has(id)) {
    return;
  }

  edges.set(id, {
    id,
    type,
    source: sourceId,
    target: targetId,
    label: relationLabels[type],
    card_id: cardId
  });
}

function addRelationNodes(card: WordCard, data: AppData, nodes: Map<string, GalaxyNode>, edges: Map<string, GalaxyEdge>, filters: GalaxyFilters, aliasMap: Map<string, WordCard>): void {
  const cardNodeId = `card:${card.card_id}`;
  const state = data.memory_states[card.card_id];
  const addPack = filters.edge_types.includes('belongs_to_pack');
  const addScene = filters.edge_types.includes('has_scene');
  const addSource = filters.edge_types.includes('from_source');
  const addSynonym = filters.edge_types.includes('has_synonym');
  const addConfusing = filters.edge_types.includes('confused_with');
  const addFamily = filters.edge_types.includes('in_word_family');
  const addTag = filters.edge_types.includes('has_tag');
  const addLink = filters.edge_types.includes('links_to');

  if (addPack) {
    const id = `pack:${card.domain_pack_id}`;
    addNode(
      nodes,
      {
        id,
        type: 'domain_pack',
        label: formatDomainPackLabel(card.domain_pack_id, getPackName(data.domain_packs, card.domain_pack_id)),
        subtitle: card.domain_pack_id
      },
      card.card_id
    );
    addEdge(edges, card.card_id, cardNodeId, id, 'belongs_to_pack');
  }

  if (addScene) {
    for (const scene of card.scene_tags) {
      const id = `scene:${normalize(scene)}`;
      addNode(nodes, { id, type: 'scene', label: formatSceneLabel(scene), subtitle: scene }, card.card_id);
      addEdge(edges, card.card_id, cardNodeId, id, 'has_scene');
    }
  }

  if (addSource) {
    const id = `source:${card.source.source_id || normalize(card.source.source_name)}`;
    addNode(
      nodes,
      {
        id,
        type: 'source',
        label: card.source.source_name,
        subtitle: card.source.source_priority,
        source_url: card.source.source_url
      },
      card.card_id
    );
    addEdge(edges, card.card_id, cardNodeId, id, 'from_source');
  }

  if (addSynonym) {
    for (const synonym of card.synonyms ?? []) {
      const id = `synonym:${normalize(synonym)}`;
      addNode(nodes, { id, type: 'synonym', label: synonym }, card.card_id);
      addEdge(edges, card.card_id, cardNodeId, id, 'has_synonym');
    }
  }

  if (addConfusing) {
    for (const confusing of card.confusing_words ?? []) {
      const id = `confusing:${normalize(confusing)}`;
      addNode(nodes, { id, type: 'confusing', label: confusing }, card.card_id);
      addEdge(edges, card.card_id, cardNodeId, id, 'confused_with');
    }
  }

  if (addFamily) {
    for (const family of card.word_family ?? []) {
      const id = `family:${normalize(family)}`;
      addNode(nodes, { id, type: 'word_family', label: family }, card.card_id);
      addEdge(edges, card.card_id, cardNodeId, id, 'in_word_family');
    }
  }

  if (addTag) {
    for (const tag of getObsidianTags(card, data, state)) {
      const id = `tag:${normalize(tag)}`;
      addNode(nodes, { id, type: 'tag', label: tag, subtitle: 'tag' }, card.card_id);
      addEdge(edges, card.card_id, cardNodeId, id, 'has_tag');
    }
  }

  if (addLink) {
    for (const link of getExplicitLinks(card)) {
      const targetId = resolveLinkNodeId(link, aliasMap);
      if (targetId === cardNodeId) {
        continue;
      }
      if (!nodes.has(targetId)) {
        addNode(nodes, { id: targetId, type: 'wikilink', label: link, subtitle: 'unresolved link' }, card.card_id);
      }
      addEdge(edges, card.card_id, cardNodeId, targetId, 'links_to');
    }
  }
}

function layout(nodes: GalaxyNode[]): GalaxyNode[] {
  const cards = nodes.filter((node) => node.type === 'card');
  const relations = nodes.filter((node) => node.type !== 'card');
  const centerX = 480;
  const centerY = 280;

  return nodes.map((node) => {
    if (node.type === 'card') {
      const index = cards.findIndex((item) => item.id === node.id);
      const angle = (Math.PI * 2 * index) / Math.max(cards.length, 1) - Math.PI / 2;
      const radius = cards.length <= 2 ? 80 : 130;
      return {
        ...node,
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    }

    const index = relations.findIndex((item) => item.id === node.id);
    const angle = (Math.PI * 2 * index) / Math.max(relations.length, 1) - Math.PI / 2;
    const radius = relations.length <= 8 ? 220 : 245;
    return {
      ...node,
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius
    };
  });
}

function withNodeDegrees(nodes: GalaxyNode[], edges: GalaxyEdge[]): GalaxyNode[] {
  const degrees = new Map(nodes.map((node) => [node.id, 0]));

  for (const edge of edges) {
    degrees.set(edge.source, (degrees.get(edge.source) ?? 0) + 1);
    degrees.set(edge.target, (degrees.get(edge.target) ?? 0) + 1);
  }

  return nodes.map((node) => ({
    ...node,
    degree: degrees.get(node.id) ?? 0
  }));
}

function getVisibleLocalNodeIds(nodes: GalaxyNode[], edges: GalaxyEdge[], focusNodeId: string, depth: 0 | 1 | 2): Set<string> {
  const nodeIds = new Set(nodes.map((node) => node.id));
  if (!nodeIds.has(focusNodeId)) {
    return nodeIds;
  }

  const visible = new Set<string>([focusNodeId]);
  let frontier = new Set<string>([focusNodeId]);

  for (let step = 0; step < depth; step += 1) {
    const next = new Set<string>();
    for (const edge of edges) {
      if (frontier.has(edge.source) && nodeIds.has(edge.target)) {
        next.add(edge.target);
      }
      if (frontier.has(edge.target) && nodeIds.has(edge.source)) {
        next.add(edge.source);
      }
    }
    for (const id of next) {
      visible.add(id);
    }
    frontier = next;
  }

  return visible;
}

function tokenizeQuery(query: string): string[] {
  return query.match(/"[^"]+"|\S+/g)?.map((token) => token.replace(/^"|"$/g, '').trim()).filter(Boolean) ?? [];
}

function cardSearchText(card: WordCard, data: AppData, state?: UserMemoryState): string {
  return [
    ...getCardTextBlocks(card),
    card.source.source_id,
    card.source.source_name,
    card.domain_pack_id,
    getPackName(data.domain_packs, card.domain_pack_id),
    formatDomainPackLabel(card.domain_pack_id, getPackName(data.domain_packs, card.domain_pack_id)),
    card.frequency_tier,
    formatFrequencyTier(card.frequency_tier),
    card.part_of_speech,
    card.phonetic ?? '',
    card.frequency_reason ?? '',
    card.source_context ?? '',
    card.card_status ?? '',
    ...(card.scene_tags ?? []),
    ...(card.scene_tags ?? []).map(formatSceneLabel),
    ...(card.synonyms ?? []),
    ...(card.confusing_words ?? []),
    ...(card.word_family ?? []),
    ...getObsidianTags(card, data, state),
    ...getExplicitLinks(card)
  ]
    .join(' ')
    .toLowerCase();
}

function matchesQuery(card: WordCard, data: AppData, state: UserMemoryState | undefined, query: string): boolean {
  const tokens = tokenizeQuery(query);
  if (tokens.length === 0) {
    return true;
  }

  const text = cardSearchText(card, data, state);
  const tags = getObsidianTags(card, data, state).map((tag) => tag.toLowerCase());
  const links = getExplicitLinks(card).map((link) => link.toLowerCase());

  return tokens.every((token) => {
    const lower = token.toLowerCase();
    const [prefix, ...rest] = lower.split(':');
    const value = rest.join(':');

    if (value) {
      if (prefix === 'tag') {
        return tags.some((tag) => tag.includes(value));
      }
      if (prefix === 'link') {
        return links.some((link) => link.includes(value));
      }
      if (prefix === 'scene') {
        return card.scene_tags.some((scene) => scene.toLowerCase().includes(value));
      }
      if (prefix === 'source') {
        return `${card.source.source_id} ${card.source.source_name}`.toLowerCase().includes(value);
      }
      if (prefix === 'pack') {
        return `${card.domain_pack_id} ${getPackName(data.domain_packs, card.domain_pack_id)} ${formatDomainPackLabel(card.domain_pack_id, getPackName(data.domain_packs, card.domain_pack_id))}`.toLowerCase().includes(value);
      }
      if (prefix === 'stage') {
        return (state?.stage ?? 'new').toLowerCase().includes(value);
      }
      if (prefix === 'family') {
        return (card.word_family ?? []).some((item) => item.toLowerCase().includes(value));
      }
      if (prefix === 'synonym') {
        return (card.synonyms ?? []).some((item) => item.toLowerCase().includes(value));
      }
      if (prefix === 'confusing') {
        return (card.confusing_words ?? []).some((item) => item.toLowerCase().includes(value));
      }
    }

    return text.includes(lower);
  });
}

function matchesMasteryScope(scope: string, state: UserMemoryState | undefined): boolean {
  const stage = state?.stage ?? 'new';

  if (scope === 'all') {
    return true;
  }

  if (scope === 'new') {
    return stage === 'new';
  }

  if (scope === 'learning') {
    return ['learning', 'reinforce', 'downgrade'].includes(stage);
  }

  if (scope === 'review') {
    return ['reviewing', 'due', 'overdue'].includes(stage);
  }

  if (scope === 'release') {
    return stage === 'release';
  }

  return stage === scope;
}

export function buildWordGalaxy(data: AppData, filters: GalaxyFilters): WordGalaxy {
  const nodes = new Map<string, GalaxyNode>();
  const edges = new Map<string, GalaxyEdge>();
  const aliasMap = buildCardAliasMap(data.cards);
  const matchingCards = data.cards.filter((card) => {
    const state = data.memory_states[card.card_id];
    const matchesPack = filters.domain_pack_id === 'all' || card.domain_pack_id === filters.domain_pack_id;
    const matchesScene = !filters.scene_tag || filters.scene_tag === 'all' || card.scene_tags.includes(filters.scene_tag);
    const matchesFrequency = !filters.frequency_tier || filters.frequency_tier === 'all' || card.frequency_tier === filters.frequency_tier;
    const matchesStage = matchesMasteryScope(filters.mastery_stage, state);
    const matchesText = matchesQuery(card, data, state, filters.query);
    return matchesPack && matchesScene && matchesFrequency && matchesStage && matchesText;
  });
  const maxCards = filters.max_cards ?? 250;
  const filteredCards = matchingCards.slice(0, maxCards);

  for (const card of filteredCards) {
    const state = data.memory_states[card.card_id];
    addNode(
      nodes,
      {
        id: `card:${card.card_id}`,
        type: 'card',
        label: card.headword,
        subtitle: state?.stage ?? 'new',
        mastery_stage: state?.stage ?? 'new',
        obsidian_ref: cardObsidianRef(card)
      },
      card.card_id
    );
  }

  for (const card of filteredCards) {
    addRelationNodes(card, data, nodes, edges, filters, aliasMap);
  }

  const fullNodes = Array.from(nodes.values());
  const fullEdges = Array.from(edges.values());
  const visibleNodeIds = filters.focus_node_id && filters.local_depth && filters.local_depth > 0 ? getVisibleLocalNodeIds(fullNodes, fullEdges, filters.focus_node_id, filters.local_depth) : new Set(fullNodes.map((node) => node.id));
  const visibleEdges = fullEdges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));

  const visibleNodes = fullNodes.filter((node) => visibleNodeIds.has(node.id));

  return {
    nodes: layout(withNodeDegrees(visibleNodes, visibleEdges)),
    edges: visibleEdges,
    cards: filteredCards,
    total_matching_cards: matchingCards.length,
    rendered_cards: filteredCards.length,
    truncated: matchingCards.length > filteredCards.length,
    full_node_count: fullNodes.length,
    full_edge_count: fullEdges.length
  };
}

export function getRelatedCards(data: AppData, node: GalaxyNode | null): WordCard[] {
  if (!node) {
    return [];
  }

  const ids = new Set(node.card_ids);
  return data.cards.filter((card) => ids.has(card.card_id));
}

export function getObsidianLinkIndex(data: AppData, node: GalaxyNode | null, edges: GalaxyEdge[]): ObsidianLinkIndex {
  if (!node) {
    return {
      explicit_links: [],
      outgoing_edges: [],
      backlink_edges: [],
      backlinks: [],
      tags: [],
      hub_path: ''
    };
  }

  const outgoingEdges = edges.filter((edge) => edge.source === node.id && edge.type === 'links_to');
  const backlinkEdges = edges.filter((edge) => edge.target === node.id && edge.type === 'links_to');
  const backlinkIds = new Set(backlinkEdges.map((edge) => edge.card_id));
  const firstCard = data.cards.find((card) => card.card_id === node.card_ids[0]);
  const state = firstCard ? data.memory_states[firstCard.card_id] : undefined;

  return {
    explicit_links: firstCard ? getExplicitLinks(firstCard) : [],
    outgoing_edges: outgoingEdges,
    backlink_edges: backlinkEdges,
    backlinks: data.cards.filter((card) => backlinkIds.has(card.card_id)),
    tags: firstCard ? getObsidianTags(firstCard, data, state) : node.type === 'tag' ? [node.label] : [],
    hub_path: `${node.type}/${normalize(node.label) || node.id}`
  };
}

export function exportNodeMarkdown(data: AppData, node: GalaxyNode | null, relatedCards: WordCard[], edges: GalaxyEdge[]): string {
  if (!node) {
    return '';
  }

  const linkIndex = getObsidianLinkIndex(data, node, edges);
  const tagLine = linkIndex.tags.map((tag) => `#${tag}`).join(' ');
  const cardLines = relatedCards.map((card) => `- [[${card.headword}]] (${formatFrequencyTier(card.frequency_tier)}, ${data.memory_states[card.card_id]?.stage ?? 'new'})`).join('\n') || '- No related cards';
  const backlinkLines = linkIndex.backlinks.map((card) => `- [[${card.headword}]]`).join('\n') || '- No backlinks';
  const outgoingLines = linkIndex.outgoing_edges.map((edge) => `- ${edge.label}: ${edge.target}`).join('\n') || '- No outgoing links';

  return [
    '---',
    `type: ${node.type}`,
    `hub_path: ${linkIndex.hub_path}`,
    `related_cards: ${relatedCards.length}`,
    '---',
    '',
    `# ${node.obsidian_ref}`,
    '',
    tagLine,
    '',
    '## Related Cards',
    cardLines,
    '',
    '## Backlinks',
    backlinkLines,
    '',
    '## Outgoing Links',
    outgoingLines
  ].join('\n');
}

export function getNodeTypeLabel(type: GalaxyNodeType): string {
  const labels: Record<GalaxyNodeType, string> = {
    card: '词卡',
    domain_pack: '领域包',
    scene: '场景',
    source: '来源',
    synonym: '同义词',
    confusing: '易混词',
    word_family: '词族',
    tag: '标签',
    wikilink: '双向链接'
  };

  return labels[type];
}

export function getNodeColor(node: GalaxyNode): string {
  if (node.type === 'card') {
    const colors: Record<MemoryStage, string> = {
      new: '#64748b',
      learning: '#d11b3d',
      reviewing: '#d11b3d',
      reinforce: '#b7791f',
      downgrade: '#c2410c',
      release: '#16a34a',
      due: '#7c3aed',
      overdue: '#ea580c'
    };
    return colors[node.mastery_stage ?? 'new'];
  }

  const colors: Record<GalaxyNodeType, string> = {
    card: '#d11b3d',
    domain_pack: '#4f46e5',
    scene: '#0f9f8f',
    source: '#0284c7',
    synonym: '#16a34a',
    confusing: '#c2410c',
    word_family: '#7c3aed',
    tag: '#0891b2',
    wikilink: '#db2777'
  };

  return colors[node.type];
}

export function getEdgeColor(type: GalaxyEdgeType): string {
  const colors: Record<GalaxyEdgeType, string> = {
    belongs_to_pack: '#818cf8',
    has_scene: '#5eead4',
    from_source: '#7dd3fc',
    has_synonym: '#86efac',
    confused_with: '#fdba74',
    in_word_family: '#c4b5fd',
    has_tag: '#67e8f9',
    links_to: '#f9a8d4'
  };

  return colors[type];
}
