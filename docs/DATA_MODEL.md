# Data Model

TechLex OS separates card content, user review events, and memory state. This is required for a real learning runtime.

## Entity Map

```text
DomainPack
  -> WordCard
  -> WordRelation

User
  -> LearningPlan
  -> DailyTask
  -> ReviewEvent
  -> UserMemoryState
  -> VersionedBackup

ImportJob
  -> WordCard
  -> ImportError

ExportJob
  -> card data / review data / memory state / graph data
```

## DomainPack

Defines a technical-English learning domain.

Core fields:

```text
domain_pack_id
name
description
target_user
scene_taxonomy
frequency_rules
source_rules
created_at
updated_at
```

Initial packs:

```text
ai-programming-english
web3-developer-english
programming-language-runtime-english
ai-platform-model-tools-english
developer-cloud-collaboration-english
product-design-creative-tools-english
```

## WordCard

Stores reusable card content. It does not store a user's memory state.

Core fields:

```text
card_id
domain_pack_id
headword
phonetic
audio_url
audio_asset_id
audio_accent
definition_zh
definition_en
part_of_speech
examples
source
scene_tags
frequency_tier
synonyms
confusing_words
word_family
tags
links
aliases
usage_tasks
notes
frequency_reason
source_context
card_status
quality
created_at
updated_at
```

Boundary:

```text
phonetic and audio_* are optional front-side recognition fields.
frequency_reason, source_context, card_status, and quality are production quality fields.
These fields belong to WordCard content and must not be mixed into UserMemoryState or FSRS scheduling state.
```

## ReviewEvent

Stores one real review action by one user.

Core fields:

```text
review_event_id
user_id
card_id
reviewed_at
rating
response_time_ms
review_mode
scheduler
fsrs_state_before
fsrs_state_after
device_context
created_at
```

Rule:

```text
Mock events cannot participate in formal memory-state decisions.
```

## UserMemoryState

Stores one user's current memory state for one card.

Core fields:

```text
user_memory_state_id
user_id
card_id
stage
difficulty
stability
retrievability
due_at
last_reviewed_at
review_count
lapse_count
recommended_action
updated_at
```

Recommended actions:

```text
new
learning
reviewing
reinforce
downgrade
release
due
overdue
```

## LearningPlan

Stores the user's learning rules.

Core fields:

```text
learning_plan_id
user_id
name
daily_new_limit
daily_review_limit
daily_weak_limit
target_retention
preferred_domain_packs
preferred_scenes
preferred_frequency_tiers
prioritize_overdue
review_weak_items
pause_new_cards
study_days
reminder_time
created_at
updated_at
```

## DailyTask

Stores generated daily work.

Core fields:

```text
daily_task_id
user_id
learning_plan_id
task_date
new_card_ids
review_card_ids
reinforce_card_ids
overdue_card_ids
completed_card_ids
status
created_at
updated_at
```

## WordRelation

Supports the word galaxy.

Core fields:

```text
word_relation_id
from_card_id
to_node_id
to_node_type
relation_type
weight
source
created_at
updated_at
```

Relation types:

```text
scene
source
frequency
part_of_speech
synonym
confusing_word
word_family
domain_pack
usage_task
mastery_state
review_state
```

## ImportJob

Tracks card package imports.

Core fields:

```text
import_job_id
user_id
package_id
package_version
source_file_name
status
total_cards
imported_cards
skipped_cards
error_count
error_report
created_at
completed_at
```

## ExportJob

Tracks user data exports.

Core fields:

```text
export_job_id
user_id
export_type
status
storage_path
format
created_at
completed_at
```

## Separation Rules

```text
WordCard is content.
ReviewEvent is history.
UserMemoryState is current state.
LearningPlan is rule configuration.
DailyTask is generated work.
WordRelation is graph structure.
```

These responsibilities must not be collapsed into a single table.

## VersionedBackup

Stores a portable snapshot of the local learning runtime.

Core fields:

```text
backup_format
backup_schema_version
app_version
exported_at
updated_at
packages
domain_packs
cards
review_events
memory_states
learning_plan
import_reports
```

Rules:

```text
backup_format identifies TechLex OS backup files.
backup_schema_version controls restore migration.
app_version records which runtime created the backup.
older backups without backup metadata are treated as legacy AppData and normalized on restore.
```
