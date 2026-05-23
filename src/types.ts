export type Rating = 'again' | 'hard' | 'good' | 'easy';

export type MemoryStage = 'new' | 'learning' | 'reviewing' | 'reinforce' | 'downgrade' | 'release' | 'due' | 'overdue';

export type FrequencyTier = 'F1' | 'F2' | 'F3' | 'F4';

export type AudioAccent = 'US' | 'UK' | 'tool-native' | 'other';

export type CardStatus = 'candidate' | 'draft' | 'approved' | 'hold';

export type SchedulerKind = 'phase1_simple' | 'ts-fsrs';

export type ImportFormat = 'json' | 'csv' | 'tsv';

export type DuplicatePolicy = 'skip';

export type ReviewSortOrder = 'due_date' | 'low_retrievability';

export type ReviewMode = 'daily_task' | 'browser_detail';

export interface DomainPack {
  domain_pack_id: string;
  name: string;
  description?: string;
  scenes?: string[];
}

export interface CardExample {
  example_en: string;
  example_zh: string;
  context?: string;
}

export interface CardSource {
  source_id: string;
  source_name: string;
  source_url: string;
  source_type: string;
  source_priority: 'P0' | 'P1' | 'P2' | 'P3' | 'P4';
}

export interface CardQuality {
  source_verified?: boolean;
  examples_translated?: boolean;
  ready_for_learning?: boolean;
}

export interface WordCard {
  card_id: string;
  headword: string;
  phonetic?: string;
  audio_url?: string;
  audio_asset_id?: string;
  audio_accent?: AudioAccent;
  definition_zh: string;
  definition_en: string;
  part_of_speech: string;
  examples: CardExample[];
  source: CardSource;
  domain_pack_id: string;
  scene_tags: string[];
  frequency_tier: FrequencyTier;
  usage_tasks: string[];
  synonyms?: string[];
  confusing_words?: string[];
  word_family?: string[];
  tags?: string[];
  links?: string[];
  aliases?: string[];
  notes?: string;
  frequency_reason?: string;
  source_context?: string;
  card_status?: CardStatus;
  quality?: CardQuality;
}

export interface StandardWordCardPackage {
  package_id: string;
  package_version: string;
  generated_by: string;
  generated_at: string;
  default_language: string;
  domain_packs: DomainPack[];
  cards: WordCard[];
}

export interface LearningPlan {
  daily_new_limit: number;
  daily_review_limit: number;
  daily_weak_limit: number;
  target_retention: number;
  maximum_interval_days: number;
  relearning_interval_minutes: number;
  leech_lapse_threshold: number;
  review_sort_order: ReviewSortOrder;
  prioritize_overdue: boolean;
  review_weak_items: boolean;
  pause_new_cards: boolean;
}

export interface ReviewEvent {
  review_event_id: string;
  card_id: string;
  reviewed_at: string;
  rating: Rating;
  response_time_ms: number;
  review_mode: ReviewMode;
  scheduler: SchedulerKind;
  scheduler_version: string;
  state_before: UserMemoryState | null;
  fsrs_raw_state_after: UserMemoryState;
  state_after: UserMemoryState;
}

export interface SerializedFSRSCard {
  due: string;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: string;
}

export interface UserMemoryState {
  card_id: string;
  stage: MemoryStage;
  scheduler?: SchedulerKind;
  scheduler_version?: string;
  fsrs_card?: SerializedFSRSCard;
  difficulty: number;
  stability: number;
  retrievability: number;
  due_at: string;
  last_reviewed_at?: string;
  review_count: number;
  lapse_count: number;
  recommended_action: MemoryStage;
}

export interface AppData {
  backup_format: string;
  backup_schema_version: number;
  app_version: string;
  packages: StandardWordCardPackage[];
  domain_packs: DomainPack[];
  cards: WordCard[];
  review_events: ReviewEvent[];
  memory_states: Record<string, UserMemoryState>;
  learning_plan: LearningPlan;
  import_reports: ImportReport[];
  updated_at: string;
}

export interface AppBackup extends AppData {
  exported_at: string;
}

export interface ImportIssue {
  row?: number;
  card_id?: string;
  field?: string;
  message: string;
}

export interface ImportReport {
  import_report_id: string;
  imported_at: string;
  package_id: string;
  format: ImportFormat;
  imported_cards: number;
  skipped_duplicates: number;
  imported_domain_packs: number;
  error_count: number;
  warning_count: number;
}

export interface ImportResult {
  package_id: string;
  format: ImportFormat;
  imported_cards: number;
  skipped_duplicates: number;
  imported_domain_packs: number;
  errors: ImportIssue[];
  warnings: ImportIssue[];
}
