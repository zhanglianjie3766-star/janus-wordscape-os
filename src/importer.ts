import { createInitialMemoryState } from './fsrsEngine';
import { mergeDomainPacks } from './domainPacks';
import type { AppData, AudioAccent, CardStatus, FrequencyTier, ImportFormat, ImportIssue, ImportResult, StandardWordCardPackage, WordCard } from './types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => asString(item)).filter(Boolean);
  }

  const text = asString(value);
  if (!text) {
    return [];
  }

  return text
    .split(/[|;；]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function asOptionalBoolean(value: unknown): boolean | undefined {
  const text = asString(value).toLowerCase();
  if (!text) {
    return undefined;
  }

  if (['true', '1', 'yes', 'y'].includes(text)) {
    return true;
  }

  if (['false', '0', 'no', 'n'].includes(text)) {
    return false;
  }

  return undefined;
}

function isFrequencyTier(value: unknown): value is FrequencyTier {
  return value === 'F1' || value === 'F2' || value === 'F3' || value === 'F4';
}

function isAudioAccent(value: unknown): value is AudioAccent {
  return value === 'US' || value === 'UK' || value === 'tool-native' || value === 'other';
}

function isCardStatus(value: unknown): value is CardStatus {
  return value === 'candidate' || value === 'draft' || value === 'approved' || value === 'hold';
}

function issue(message: string, field?: string, row?: number, cardId?: string): ImportIssue {
  return {
    row,
    card_id: cardId,
    field,
    message
  };
}

function validateCard(card: unknown, index: number): ImportIssue[] {
  const row = index + 1;
  const errors: ImportIssue[] = [];

  if (!isRecord(card)) {
    return [issue('Card must be an object.', undefined, row)];
  }

  const cardId = asString(card.card_id);
  const required = [
    'card_id',
    'headword',
    'definition_zh',
    'definition_en',
    'part_of_speech',
    'examples',
    'source',
    'domain_pack_id',
    'scene_tags',
    'frequency_tier',
    'usage_tasks'
  ];

  for (const field of required) {
    if (!(field in card)) {
      errors.push(issue('Required field is missing.', field, row, cardId));
    }
  }

  for (const field of ['card_id', 'headword', 'definition_zh', 'definition_en', 'part_of_speech', 'domain_pack_id']) {
    if (!asString(card[field])) {
      errors.push(issue('Field must be a non-empty string.', field, row, cardId));
    }
  }

  if (!Array.isArray(card.examples) || card.examples.length < 2) {
    errors.push(issue('At least two examples are required.', 'examples', row, cardId));
  } else {
    card.examples.forEach((example, exampleIndex) => {
      if (!isRecord(example) || !asString(example.example_en) || !asString(example.example_zh)) {
        errors.push(issue(`Example ${exampleIndex + 1} must include example_en and example_zh.`, 'examples', row, cardId));
      }
    });
  }

  if (!isRecord(card.source)) {
    errors.push(issue('Source must be an object.', 'source', row, cardId));
  } else {
    for (const field of ['source_id', 'source_name', 'source_url', 'source_type', 'source_priority']) {
      if (!asString(card.source[field])) {
        errors.push(issue(`source.${field} is required.`, `source.${field}`, row, cardId));
      }
    }
  }

  if (!Array.isArray(card.scene_tags) || card.scene_tags.length === 0) {
    errors.push(issue('scene_tags must be a non-empty array.', 'scene_tags', row, cardId));
  }

  if (!Array.isArray(card.usage_tasks) || card.usage_tasks.length === 0) {
    errors.push(issue('usage_tasks must be a non-empty array.', 'usage_tasks', row, cardId));
  }

  if (!isFrequencyTier(card.frequency_tier)) {
    errors.push(issue('frequency_tier must be F1, F2, F3, or F4.', 'frequency_tier', row, cardId));
  }

  for (const field of ['phonetic', 'audio_url', 'audio_asset_id', 'audio_accent', 'frequency_reason', 'source_context', 'card_status', 'notes']) {
    const value = card[field];
    if (field in card && value !== undefined && value !== null && typeof value !== 'string') {
      errors.push(issue(`${field} must be a string when provided.`, field, row, cardId));
    }
  }

  if ('audio_accent' in card && asString(card.audio_accent) && !isAudioAccent(card.audio_accent)) {
    errors.push(issue('audio_accent must be US, UK, tool-native, or other.', 'audio_accent', row, cardId));
  }

  if ('card_status' in card && asString(card.card_status) && !isCardStatus(card.card_status)) {
    errors.push(issue('card_status must be candidate, draft, approved, or hold.', 'card_status', row, cardId));
  }

  if ('quality' in card && card.quality !== undefined) {
    if (!isRecord(card.quality)) {
      errors.push(issue('quality must be an object when provided.', 'quality', row, cardId));
    } else {
      for (const field of ['source_verified', 'examples_translated', 'ready_for_learning']) {
        const value = card.quality[field];
        if (field in card.quality && value !== undefined && typeof value !== 'boolean') {
          errors.push(issue(`quality.${field} must be a boolean when provided.`, `quality.${field}`, row, cardId));
        }
      }
    }
  }

  return errors;
}

function normalizeJsonPackage(input: unknown): { pkg?: StandardWordCardPackage; errors: ImportIssue[]; warnings: ImportIssue[] } {
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  if (!isRecord(input)) {
    return { errors: [issue('Package root must be an object.')], warnings };
  }

  for (const field of ['package_id', 'package_version', 'generated_by', 'generated_at', 'default_language', 'domain_packs', 'cards']) {
    if (!(field in input)) {
      errors.push(issue('Required package field is missing.', field));
    }
  }

  if (!Array.isArray(input.cards)) {
    errors.push(issue('cards must be an array.', 'cards'));
  }

  if (!Array.isArray(input.domain_packs)) {
    errors.push(issue('domain_packs must be an array.', 'domain_packs'));
  }

  if (errors.length > 0) {
    return { errors, warnings };
  }

  const validCards: WordCard[] = [];
  const seenCardIds = new Set<string>();

  (input.cards as unknown[]).forEach((card, index) => {
    const cardErrors = validateCard(card, index);
    if (cardErrors.length > 0) {
      errors.push(...cardErrors);
      return;
    }

    const rawCard = card as Record<string, unknown>;
    const typedCard: WordCard = {
      ...(rawCard as unknown as WordCard),
      tags: asStringArray(rawCard.tags),
      links: asStringArray(rawCard.links),
      aliases: asStringArray(rawCard.aliases)
    };
    if (seenCardIds.has(typedCard.card_id)) {
      warnings.push(issue('Duplicate card_id inside this package was skipped.', 'card_id', index + 1, typedCard.card_id));
      return;
    }

    seenCardIds.add(typedCard.card_id);
    validCards.push(typedCard);
  });

  return {
    pkg: {
      ...(input as unknown as StandardWordCardPackage),
      cards: validCards
    },
    errors,
    warnings
  };
}

function parseDelimitedRows(text: string, delimiter: ',' | '\t'): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') {
        index += 1;
      }
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) {
        rows.push(row);
      }
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) {
    rows.push(row);
  }

  return rows;
}

function summarizePackage(pkg: StandardWordCardPackage): StandardWordCardPackage {
  return {
    ...pkg,
    cards: []
  };
}

function parseCsvPackage(text: string, fileName: string, format: ImportFormat): { pkg?: StandardWordCardPackage; errors: ImportIssue[]; warnings: ImportIssue[] } {
  const delimiter = format === 'tsv' ? '\t' : ',';
  const rows = parseDelimitedRows(text, delimiter);
  const errors: ImportIssue[] = [];
  const warnings: ImportIssue[] = [];

  if (rows.length < 2) {
    return { errors: [issue('CSV/TSV must include a header row and at least one card row.')], warnings };
  }

  const headers = rows[0].map((header) => header.trim());
  const indexOf = (field: string) => headers.indexOf(field);
  const required = [
    'card_id',
    'headword',
    'definition_zh',
    'definition_en',
    'part_of_speech',
    'example_en_1',
    'example_zh_1',
    'example_en_2',
    'example_zh_2',
    'source_id',
    'source_name',
    'source_url',
    'source_type',
    'source_priority',
    'domain_pack_id',
    'scene_tags',
    'frequency_tier',
    'usage_tasks'
  ];

  for (const field of required) {
    if (indexOf(field) === -1) {
      errors.push(issue('Required CSV column is missing.', field));
    }
  }

  if (errors.length > 0) {
    return { errors, warnings };
  }

  const value = (row: string[], field: string) => row[indexOf(field)] ?? '';
  const cards: WordCard[] = rows.slice(1).map((row, rowIndex) => {
    const cardId = value(row, 'card_id');
    const quality = {
      source_verified: asOptionalBoolean(value(row, 'source_verified')),
      examples_translated: asOptionalBoolean(value(row, 'examples_translated')),
      ready_for_learning: asOptionalBoolean(value(row, 'ready_for_learning'))
    };
    const hasQuality = Object.values(quality).some((item) => item !== undefined);

    return {
      card_id: cardId,
      headword: value(row, 'headword'),
      definition_zh: value(row, 'definition_zh'),
      definition_en: value(row, 'definition_en'),
      part_of_speech: value(row, 'part_of_speech'),
      examples: [
        {
          example_en: value(row, 'example_en_1'),
          example_zh: value(row, 'example_zh_1'),
          context: value(row, 'example_context_1') || undefined
        },
        {
          example_en: value(row, 'example_en_2'),
          example_zh: value(row, 'example_zh_2'),
          context: value(row, 'example_context_2') || undefined
        }
      ],
      source: {
        source_id: value(row, 'source_id'),
        source_name: value(row, 'source_name'),
        source_url: value(row, 'source_url'),
        source_type: value(row, 'source_type'),
        source_priority: value(row, 'source_priority') as WordCard['source']['source_priority']
      },
      domain_pack_id: value(row, 'domain_pack_id'),
      scene_tags: asStringArray(value(row, 'scene_tags')),
      frequency_tier: value(row, 'frequency_tier') as FrequencyTier,
      usage_tasks: asStringArray(value(row, 'usage_tasks')),
      phonetic: value(row, 'phonetic') || undefined,
      audio_url: value(row, 'audio_url') || undefined,
      audio_asset_id: value(row, 'audio_asset_id') || undefined,
      audio_accent: (value(row, 'audio_accent') || undefined) as WordCard['audio_accent'],
      frequency_reason: value(row, 'frequency_reason') || undefined,
      source_context: value(row, 'source_context') || undefined,
      card_status: (value(row, 'card_status') || undefined) as WordCard['card_status'],
      quality: hasQuality ? quality : undefined,
      synonyms: asStringArray(value(row, 'synonyms')),
      confusing_words: asStringArray(value(row, 'confusing_words')),
      word_family: asStringArray(value(row, 'word_family')),
      tags: asStringArray(value(row, 'tags')),
      links: asStringArray(value(row, 'links')),
      aliases: asStringArray(value(row, 'aliases')),
      notes: value(row, 'notes') || `Imported from ${fileName}. Row ${rowIndex + 2}.`
    };
  });

  return normalizeJsonPackage({
    package_id: fileName.replace(/\.[^.]+$/, '') || `csv-import-${Date.now()}`,
    package_version: 'csv-import',
    generated_by: 'csv-import',
    generated_at: new Date().toISOString(),
    default_language: 'zh-CN',
    domain_packs: [],
    cards
  });
}

export function parsePackage(input: unknown): { pkg?: StandardWordCardPackage; errors: ImportIssue[]; warnings: ImportIssue[] } {
  return normalizeJsonPackage(input);
}

export function parsePackageText(text: string, fileName: string): { pkg?: StandardWordCardPackage; format: ImportFormat; errors: ImportIssue[]; warnings: ImportIssue[] } {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith('.csv')) {
    return { ...parseCsvPackage(text, fileName, 'csv'), format: 'csv' };
  }

  if (lowerName.endsWith('.tsv')) {
    return { ...parseCsvPackage(text, fileName, 'tsv'), format: 'tsv' };
  }

  try {
    return { ...parsePackage(JSON.parse(text)), format: 'json' };
  } catch {
    return { format: 'json', errors: [issue('File is not valid JSON. Use .csv or .tsv for tabular imports.')], warnings: [] };
  }
}

export function importPackage(data: AppData, pkg: StandardWordCardPackage, format: ImportFormat = 'json', previousIssues: { errors?: ImportIssue[]; warnings?: ImportIssue[] } = {}): { data: AppData; result: ImportResult } {
  const mergedPacks = mergeDomainPacks(data.domain_packs, pkg.domain_packs);
  const knownPackIds = new Set(mergedPacks.map((pack) => pack.domain_pack_id));
  const existingCardIds = new Set(data.cards.map((card) => card.card_id));
  const nextCards = [...data.cards];
  const nextMemoryStates = { ...data.memory_states };
  const errors: ImportIssue[] = [...(previousIssues.errors ?? [])];
  const warnings: ImportIssue[] = [...(previousIssues.warnings ?? [])];
  let importedCards = 0;
  let skippedDuplicates = 0;

  for (const [index, card] of pkg.cards.entries()) {
    if (!knownPackIds.has(card.domain_pack_id)) {
      errors.push(issue('domain_pack_id is not registered in the package or default registry.', 'domain_pack_id', index + 1, card.card_id));
      continue;
    }

    if (existingCardIds.has(card.card_id)) {
      skippedDuplicates += 1;
      warnings.push(issue('Card already exists and was skipped.', 'card_id', index + 1, card.card_id));
      continue;
    }

    nextCards.push(card);
    existingCardIds.add(card.card_id);
    nextMemoryStates[card.card_id] = createInitialMemoryState(card.card_id);
    importedCards += 1;
  }

  const report = {
    import_report_id: `${pkg.package_id}-${Date.now()}`,
    imported_at: new Date().toISOString(),
    package_id: pkg.package_id,
    format,
    imported_cards: importedCards,
    skipped_duplicates: skippedDuplicates,
    imported_domain_packs: mergedPacks.length - data.domain_packs.length,
    error_count: errors.length,
    warning_count: warnings.length
  };

  const result: ImportResult = {
    package_id: pkg.package_id,
    format,
    imported_cards: importedCards,
    skipped_duplicates: skippedDuplicates,
    imported_domain_packs: report.imported_domain_packs,
    errors,
    warnings
  };

  return {
    data: {
      ...data,
      packages: [...data.packages, summarizePackage(pkg)],
      domain_packs: mergedPacks,
      cards: nextCards,
      memory_states: nextMemoryStates,
      import_reports: [report, ...data.import_reports],
      updated_at: new Date().toISOString()
    },
    result
  };
}
