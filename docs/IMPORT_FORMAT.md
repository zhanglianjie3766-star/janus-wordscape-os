# Standard Card Package Format

TechLex OS imports prepared card packages. Card authoring can happen outside the client through Codex or another production workflow.

For production-quality card writing rules, see:

```text
docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md
```

## Package Format

Preferred format:

```text
JSON
```

Supported now:

```text
CSV
TSV
```

Supported later:

```text
Markdown bundle
ZIP package
```

## JSON Package Shape

```json
{
  "package_id": "ai-programming-english-v0.2",
  "package_version": "0.2.0",
  "generated_by": "codex-card-factory",
  "generated_at": "2026-05-20T00:00:00+08:00",
  "default_language": "zh-CN",
  "domain_packs": [],
  "cards": []
}
```

## Required Card Fields

Each card must include:

```text
card_id
headword
definition_zh
definition_en
part_of_speech
examples
source
domain_pack_id
scene_tags
frequency_tier
usage_tasks
```

Recommended fields:

```text
phonetic
audio_url
audio_asset_id
audio_accent
synonyms
confusing_words
word_family
tags
links
aliases
notes
frequency_reason
source_context
card_status
quality
```

`phonetic` and `audio_*` belong to the front-side recognition layer. `frequency_reason`,
`source_context`, and `card_status` belong to production quality control. They are imported
with the card content and must not be mixed into `UserMemoryState` or FSRS state.

Obsidian-grade graph fields:

```text
tags = explicit user/content tags, for example ["ai-programming", "ide/editor"]
links = explicit [[wikilink]] targets, for example ["plugin", "integration"]
aliases = alternative labels that can resolve incoming [[wikilinks]] to this card
```

The runtime also parses:

```text
[[wikilinks]] from notes, examples, and usage_tasks
#inline-tags from notes, examples, and usage_tasks
system tags from Domain Pack, scene, source, source priority, frequency, part of speech, and memory stage
```

## Example Object

```json
{
  "card_id": "ai-programming-english-extension-001",
  "headword": "extension",
  "phonetic": "/ɪkˈstenʃən/",
  "audio_url": "https://example.com/audio/extension-us.mp3",
  "audio_accent": "US",
  "definition_zh": "扩展；插件式功能模块。",
  "definition_en": "A software add-on that extends an application's capabilities.",
  "part_of_speech": "noun",
  "examples": [
    {
      "example_en": "Install the Cursor extension to add AI coding features to the editor.",
      "example_zh": "安装 Cursor 扩展，为编辑器添加 AI 编程功能。"
    },
    {
      "example_en": "Disable the extension if it conflicts with your workspace settings.",
      "example_zh": "如果该扩展与工作区设置冲突，就禁用它。"
    }
  ],
  "source": {
    "source_id": "cursor-official",
    "source_name": "Cursor Official Website",
    "source_url": "https://cursor.com/cn",
    "source_type": "official_website",
    "source_priority": "P0"
  },
  "domain_pack_id": "ai-programming-english",
  "scene_tags": ["ide_editor", "ai_code_assistant"],
  "frequency_tier": "F1",
  "usage_tasks": ["understand Cursor website and IDE terminology"],
  "synonyms": ["add-on", "plugin"],
  "confusing_words": ["plugin", "integration"],
  "word_family": ["extend", "extended", "extensible"],
  "tags": ["ai-programming", "ide/editor", "source/cursor"],
  "links": ["plugin", "integration"],
  "aliases": ["VS Code extension", "Cursor extension"],
  "notes": "Prepared outside the client and imported as content. Compare with [[plugin]] and [[integration]]. #ai-programming #ide/editor",
  "frequency_reason": "F1 because this term appears in IDE setup, extension install, and troubleshooting flows.",
  "source_context": "Cursor and VS Code extension pages use this word for installable editor capabilities.",
  "card_status": "approved",
  "quality": {
    "source_verified": true,
    "examples_translated": true,
    "ready_for_learning": true
  }
}
```

## Import Validation

The importer must validate:

```text
required fields
unique card_id
known domain_pack_id
at least two examples
example Chinese translation
source_name and source_url
frequency_tier in F1/F2/F3/F4
audio_accent in US/UK/tool-native/other when provided
card_status in candidate/draft/approved/hold when provided
scene_tags are arrays
usage_tasks are arrays
```

## Import Result

The importer should produce:

```text
imported card count
skipped duplicate count
error count
error report
created UserMemoryState count
generated relation count
```

## CSV Compatibility

CSV is supported as a flattened format. Canonical CSV column names must use snake_case:

```text
card_id
headword
phonetic
audio_url
audio_asset_id
audio_accent
definition_zh
definition_en
part_of_speech
example_en_1
example_zh_1
example_en_2
example_zh_2
source_id
source_name
source_url
source_type
source_priority
domain_pack_id
scene_tags
frequency_tier
usage_tasks
synonyms
confusing_words
word_family
tags
links
aliases
notes
frequency_reason
source_context
card_status
source_verified
examples_translated
ready_for_learning
```

Array fields in CSV can use `|`, `;`, or `；` as separators.

Required CSV columns:

```text
card_id
headword
definition_zh
definition_en
part_of_speech
example_en_1
example_zh_1
example_en_2
example_zh_2
source_id
source_name
source_url
source_type
source_priority
domain_pack_id
scene_tags
frequency_tier
usage_tasks
```

## Boundary

Importing a card package is not the same as learning it.

After import, TechLex OS must still:

```text
create initial UserMemoryState
include cards in learning-plan candidates
generate daily tasks
run FSRS reviews
record ReviewEvent
update memory state
update the word galaxy
```
