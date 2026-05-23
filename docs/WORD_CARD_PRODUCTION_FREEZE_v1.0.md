# 词卡制作标准冻结文档 v1.0

本文档冻结“雅努斯词境 OS / TechLex OS”真实词卡包的生产标准。

它面向从 0 生产真实词卡包的 AI、人工编辑或流水线，不是导入 schema，也不是 UI 说明。

对应关系：

```text
生产标准冻结：本文档
当前导入格式说明：docs/IMPORT_FORMAT.md
数据结构说明：docs/DATA_MODEL.md
JSON Schema：schemas/standard-word-card-package.schema.json
现有生产标准说明：docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md
```

## 1. 生产目标

一张真实词卡不是词典条目。

一张真实词卡必须同时服务：

```text
学习识别
真实场景理解
读音和音标
来源追溯
词频排序
图谱连接
FSRS 复习
```

最终目标：

```text
用户看到一个词时，不只是知道中文释义，而是能从真实技术场景、来源、词族和易混边界中重新想起它。
```

## 2. 生产原则

冻结原则：

```text
真实来源优先
真实场景优先
中文解释必须可理解
音标和读音必须可靠
图谱关系必须有价值
词频必须可解释
宁可留空，不伪造
```

不得生产：

```text
只有单词和中文释义的薄词卡
来源不明的词卡
例句不真实的词卡
音标和读音瞎编的词卡
关系字段为凑数而填的词卡
把词典义堆满但没有场景含义的词卡
```

## 3. 字段分层

词卡字段固定分为六层：

```text
正面识别层
场景含义层
来源证据层
图谱关系层
复习优先级层
生产质检层
```

### 3.1 正面识别层

目的：

```text
让用户能看见、读出、初步识别这个词。
```

字段：

```text
headword
phonetic
audio_url
audio_asset_id
audio_accent
part_of_speech
aliases
```

要求：

```text
headword 必填。
part_of_speech 必填。
phonetic 推荐填写，普通英语词优先 IPA。
audio_url / audio_asset_id 至少一个可选，有可靠资源才填。
audio_accent 只在需要区分时填写，例如 US / UK / tool-native / other。
aliases 用于搜索和图谱链接解析，不作为主词。
```

音标和读音边界：

```text
音标 = 用户看到的读音文本。
读音 = 用户点击后能播放的音频资源或系统 TTS。
两者都需要，但都不得伪造。
没有可靠音频时，优先用系统 TTS 兜底；没有可靠音标时，可以暂缺。
```

### 3.2 场景含义层

目的：

```text
让用户知道这个词在真实技术场景里是什么意思。
```

字段：

```text
definition_zh
definition_en
examples
usage_tasks
notes
```

要求：

```text
definition_zh 必填，必须是场景中文释义，不是机械词典义。
definition_en 必填，必须简短。
examples 必填，至少 2 条，中英文都要有。
usage_tasks 必填，说明学会后能完成什么真实任务。
notes 可补充边界、链接和图谱标签。
```

好例子：

```text
workspace：在编辑器中，当前打开的一组项目文件、设置和上下文。
```

坏例子：

```text
workspace：工作空间。
```

### 3.3 来源证据层

目的：

```text
确保词卡可追溯、可信、可复查。
```

字段：

```text
source.source_id
source.source_name
source.source_url
source.source_type
source.source_priority
source_context
```

要求：

```text
source 必填。
source_url 必须可追溯。
source_priority 必须为 P0 / P1 / P2 / P3 / P4。
source_context 推荐填写，说明这个词在来源中怎样出现。
```

来源优先级：

```text
P0 官方文档 / 官方网站 / 产品内真实 UI
P1 官方博客 / 官方帮助中心 / 标准规范
P2 高质量技术文档 / 主流框架文档
P3 社区文章 / 教程
P4 待验证来源
```

P4 词卡不得直接进入 approved。

### 3.4 图谱关系层

目的：

```text
让图谱能回答：这个词为什么记不住，应从哪个场景、关系或来源重新想起？
```

字段：

```text
domain_pack_id
scene_tags
synonyms
confusing_words
word_family
tags
links
aliases
notes
```

要求：

```text
domain_pack_id 必填。
scene_tags 必填，至少 1 个二级场景。
synonyms 只填真正同义或近义词。
confusing_words 只填容易误用、误解或边界相近的词。
word_family 只填派生词、词根相关词或同族技术表达。
tags 用于聚类，不用于堆关键词。
links 用于显式关系，不用于堆无关概念。
```

图谱关系不得为凑数量而填。

### 3.5 复习优先级层

目的：

```text
帮助学习队列优先处理高价值词。
```

字段：

```text
frequency_tier
frequency_reason
```

词频分级：

```text
F1 高：高频核心词，真实使用中经常遇到。
F2 中高：重要常见词，多个场景会遇到。
F3 中：需要掌握，但频率或场景覆盖较窄。
F4 低：低频、补充、专项或长尾词。
```

规则：

```text
frequency_tier 必填。
frequency_reason 推荐填写。
不要为了追求覆盖率把大量长尾词标成 F1。
```

### 3.6 生产质检层

目的：

```text
让词卡包能分阶段进入学习，而不是草稿直接污染正式词库。
```

字段：

```text
card_status
quality
created_at
updated_at
```

状态：

```text
candidate：候选词，未完成加工。
draft：已加工但未验收。
approved：可导入真实学习。
hold：暂缓，不应进入学习。
```

质量字段：

```text
source_verified
examples_translated
ready_for_learning
```

只有 `approved + ready_for_learning=true` 才建议批量进入真实学习。

## 4. 必填字段冻结

真实学习包必填：

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

强推荐字段：

```text
phonetic
audio_url 或 audio_asset_id
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

## 5. 场景分类冻结

场景必须服务“真实任务”，不是泛泛分类。

一级场景：

```text
用于领域包或大任务域。
例如：AI编程、Web3、语言运行时、AI平台、云与协作、设计创作。
```

二级场景：

```text
用于真实可学习的任务场景。
例如：IDE界面、AI代码助手、依赖管理、命令行终端、模型调用、钱包、智能合约。
```

要求：

```text
一张词卡至少有一个二级场景。
二级场景名称必须中文展示。
导入内部 ID 可以是英文，但 UI 展示必须有中文映射。
一级场景 UI 文案不超过 5 个汉字视觉宽度。
二级场景 UI 文案不超过 7 个汉字视觉宽度。
```

## 6. 音标与读音冻结

普通英语词：

```text
phonetic 优先 IPA。
audio_accent 优先 US，其次 UK。
audio_url 可使用可靠音频源。
没有音频源时，运行时可用系统 SpeechSynthesis 兜底。
```

技术短语：

```text
phonetic 可填写短语读音。
如果短语读音不稳定，可只填核心词音标。
```

命令、错误码、文件名：

```text
如果没有自然读音，可以不填 phonetic。
audio_accent 可为 tool-native 或 other。
```

禁止：

```text
伪造 IPA。
链接不稳定音频。
使用未授权音频资源。
把音标字段当备注字段。
```

## 7. 图谱价值倒推标准

生产每张词卡前，必须问：

```text
这个词为什么可能记不住？
应该从哪个场景想起它？
它容易和哪些词混淆？
它属于哪个词族或概念网络？
它来自哪个真实来源？
它在图谱中连接哪些有用节点？
```

如果一张词卡无法回答上述问题，说明它还不是合格的真实词卡。

## 8. 验收标准

一张词卡通过验收必须满足：

```text
必填字段完整。
至少 2 条中英例句。
来源可追溯。
中文释义贴近真实场景。
音标或读音策略明确。
至少 1 个二级场景。
frequency_tier 合理。
图谱关系字段不乱填。
card_status 为 approved。
quality.ready_for_learning 为 true。
```

一个词卡包通过验收必须满足：

```text
所有 card_id 唯一。
domain_pack_id 都可识别。
scene_tags 都能中文展示。
F1/F2/F3/F4 分布合理。
没有 P4 approved 词卡。
导入后单词本、今日、统计、图谱均能正常读取。
```

## 9. 禁止回退清单

```text
只生产单词 + 中文释义。
没有来源证据。
没有二级场景。
没有例句中文翻译。
音标和读音字段混乱。
frequency_tier 全部乱填 F1。
tags / links / word_family 为凑图谱节点而堆词。
card_status 不区分候选、草稿、可学。
生产标准和 UserMemoryState / FSRS 状态混在一起。
```

