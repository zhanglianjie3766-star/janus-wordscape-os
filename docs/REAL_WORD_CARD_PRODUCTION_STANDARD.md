# 真实词卡包生产标准 v1.2

本文档定义“真实词卡包”如何加工，服务于雅努斯词境 OS / TechLex OS 的单词记忆、FSRS 复习和关系图谱。

它不是导入 schema。`docs/IMPORT_FORMAT.md` 负责说明当前程序能导入什么字段；本文档负责说明什么样的词卡才值得导入、值得学习、值得进入图谱。

## 1. 总原则

一张真实词卡不是词典条目。

一张真实词卡必须同时承担五个任务：

```text
看得见：我看到的英文词或固定短语是什么？
读得出：它怎么读，词性或真实 UI 类型是什么？
用得上：它在我的真实场景里是什么意思？
找得到：它来自哪个真实来源？
连得起：它和哪些场景、来源、词族、易混词、标签形成关系？
```

图谱只回答一个核心问题：

```text
这个词为什么记不住，我应该从哪个场景、来源、关系或词族重新想起？
```

因此，真实词卡生产必须遵守：

```text
真实来源
真实场景
中文可理解
读音可识别
关系可连接
频率可排序
复习可追踪
```

## 2. 字段分层

### 2.1 正面识别层

这一层决定用户第一次看到词卡时能不能识别这个词。

| 字段 | 当前导入状态 | 作用 |
| --- | --- | --- |
| `headword` | 已支持 | 英语单词或固定技术短语 |
| `phonetic` | 已支持，可选 | 音标，优先 IPA |
| `audio_url` | 已支持，可选 | 可点播放的在线读音 |
| `audio_asset_id` | 已支持，可选 | 可点播放的本地或包内音频 |
| `audio_accent` | 已支持，可选 | US / UK / tool-native / other |
| `part_of_speech` | 已支持 | 词性或真实界面类型 |

当前运行时边界：

```text
headword、part_of_speech、phonetic、audio_url、audio_asset_id、audio_accent 已经可以进入当前导入 JSON。
phonetic / audio_* 是可选字段；没有可靠音标或音频时可以省略，不要伪造。
frequency_reason / source_context / card_status 也已支持导入，但属于生产质检层，不进入 UserMemoryState 或 FSRS 状态。
```

### 2.2 场景含义层

这一层决定词卡是不是“真实可学”。

| 字段 | 作用 |
| --- | --- |
| `definition_zh` | 中文场景含义 |
| `definition_en` | 简短英文定义 |
| `examples` | 至少 2 个真实场景例句 |
| `usage_tasks` | 学会后要能完成的真实任务 |

### 2.3 来源证据层

这一层决定词卡是否可信。

| 字段 | 作用 |
| --- | --- |
| `source.source_id` | 稳定来源 ID |
| `source.source_name` | 来源名称 |
| `source.source_url` | 来源地址 |
| `source.source_type` | 来源类型 |
| `source.source_priority` | 来源优先级 |

### 2.4 图谱关系层

这一层决定词卡能否进入关系图谱并产生诊断价值。

| 字段 | 图谱价值 |
| --- | --- |
| `domain_pack_id` | 一级场景节点 |
| `scene_tags` | 二级场景节点 |
| `synonyms` | 同义关系 |
| `confusing_words` | 易混关系 |
| `word_family` | 词族关系 |
| `tags` | 标签聚类 |
| `links` | 显式概念链接 |
| `aliases` | 搜索和链接解析 |
| `notes` | 关系边界说明 |

### 2.5 复习优先级层

| 字段 | 作用 |
| --- | --- |
| `frequency_tier` | 学习优先级 |
| `quality` | 是否可学习、是否来源确认、是否例句已翻译 |

## 3. 当前 v1 必填字段

当前 app 导入 JSON 必须包含：

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

当前推荐字段：

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

## 4. 正面识别层标准

### 4.1 `headword`

`headword` 是词卡正面显示的英文词、固定短语、命令、UI 标签或错误文本。

规则：

```text
一个词卡只放一个核心 headword。
如果用户在真实场景中总是以固定短语遇到它，就不要强行拆词。
大小写以真实场景为准。
命令、参数、API 名称、UI 标签可以保留原始大小写和符号。
```

好例子：

```text
workspace
command palette
seed phrase
context window
package-lock.json
ERR_CONNECTION_REFUSED
```

坏例子：

```text
work / workspace / working
command
AI tool
error
```

### 4.2 `phonetic`

`phonetic` 用于音标显示，优先 IPA。

规则：

```text
普通单词建议填写 IPA。
固定技术短语可以按核心词或短语读音填写。
缩写、命令、文件名、错误码没有自然读音时，可以为空或标记为 not_applicable。
不要为了填音标而编造不确定读音。
```

示例：

```text
workspace -> /ˈwɜːrkˌspeɪs/
extension -> /ɪkˈstenʃən/
cache -> /kæʃ/
YAML -> /ˈjæməl/ 或 tool-native
```

### 4.3 `audio_url` / `audio_asset_id` / `audio_accent`

读音字段服务于“点播放”。

规则：

```text
在线音频用 audio_url。
离线包内音频用 audio_asset_id。
audio_accent 只记录必要差异，例如 US / UK / tool-native。
没有可靠音频时，先留空，不要链接不稳定或侵权音频。
```

优先级：

```text
P0: 自有或可授权音频资源
P1: 系统 TTS 可生成读音
P2: 公开且授权明确的发音资源
P3: 暂无音频，仅保留 phonetic
```

### 4.4 `part_of_speech`

`part_of_speech` 不只是传统语法词性，也可以描述真实技术界面类型。

推荐值：

```text
noun
verb
adjective
adverb
phrase
phrasal_verb
abbreviation
command
parameter
file
ui_label
error_text
api_name
concept
```

原则：

```text
如果传统词性足够清楚，用 noun / verb / adjective 等。
如果真实学习难点来自技术界面，就用 command / ui_label / error_text / file 等。
词性字段必须帮助识别，而不是为了语法完整而填噪声。
```

## 5. 场景标准

### 5.1 一级场景：`domain_pack_id`

`domain_pack_id` 是一级场景，一张卡只能属于一个一级场景。

当前默认一级场景：

```text
ai-programming-english
web3-developer-english
programming-language-runtime-english
ai-platform-model-tools-english
developer-cloud-collaboration-english
product-design-creative-tools-english
```

选择规则：

```text
选择用户最常遇到这个词的真实任务场景。
不要按学术分类选。
不要为了图谱好看而把一个词塞进多个一级场景。
```

### 5.2 二级场景：`scene_tags`

`scene_tags` 是二级场景。

规则：

```text
至少 1 个。
推荐 1 个主场景。
最多 2 个，且必须都是用户真实反复遇到的任务场景。
超过 2 个通常说明这张卡太泛，应该拆卡或重写。
第一个 scene_tag 视为主浏览场景。
```

好例子：

```text
ide_editor
ai_code_assistant
git_version_control
cli_terminal
dependencies
api_keys
model_docs
wallet
smart_contract
```

坏例子：

```text
ai
tool
misc
common
advanced
english
```

中文显示限制：

```text
一级场景中文名不超过 5 个字。
二级场景中文名不超过 7 个字。
内部 ID 使用 lowercase snake_case 或 kebab-case。
内部 ID 不使用中文。
```

## 6. 来源标准

每张真实词卡必须有一个主来源。

来源不是装饰字段，而是回答：

```text
为什么这个词值得学？
我忘记时应该回到哪里重新理解？
```

### 6.1 来源字段

```text
source_id
source_name
source_url
source_type
source_priority
```

### 6.2 `source_type`

推荐值：

```text
official_website
official_docs
api_reference
help_center
tool_ui
cli_output
error_message
real_workflow
other
```

### 6.3 `source_priority`

```text
P0: 官方文档、官网、官方 API、官方 UI 文案
P1: 官方帮助中心、官方教程、厂商示例
P2: 可信项目文档、GitHub repo 文档、标准生态文档、release notes
P3: 高质量社区文章、课程、论坛回答
P4: 个人笔记、截图记忆、推断语境、未核验来源
```

学习准入：

```text
P0-P2 可以直接进入学习包。
P3 需要人工复核后才能 ready_for_learning。
P4 默认不能 ready_for_learning，除非补充更高优先级来源。
```

禁止：

```text
禁止编造 source_url。
禁止把来源写成 Google / Baidu / ChatGPT。
禁止把没有出处的 AI 生成解释伪装成官方来源。
```

## 7. 定义标准

### 7.1 `definition_zh`

中文定义必须优先解释真实任务含义。

好：

```text
workspace: 工作区；编辑器当前打开的一组项目文件、设置和上下文。
```

坏：

```text
workspace: 工作空间。
```

规则：

```text
先写场景含义，再补一般含义。
不要只写词典翻译。
一句话能说清楚就不要写长段落。
```

### 7.2 `definition_en`

英文定义要短、准确、技术语境明确。

好：

```text
The set of files, folders, settings, and context currently opened in an editor.
```

坏：

```text
A place where work is done.
```

## 8. 例句标准

每张卡至少 2 个例句。

规则：

```text
例句 1：接近来源或 UI / workflow 的真实用法。
例句 2：同一场景下的另一个真实任务句。
每个英文例句必须有中文翻译。
例句要帮助用户判断这个词在真实场景里怎么用。
```

坏：

```text
This is a workspace.
```

好：

```text
Open this folder as a workspace before editing the project settings.
在编辑项目设置之前，把这个文件夹作为工作区打开。
```

## 9. 使用任务标准

`usage_tasks` 表示学会这个词后，用户应该能完成什么真实任务。

规则：

```text
1-3 条。
必须是动作或理解任务。
不能写成 learn this word / know this word。
```

好：

```text
understand IDE workspace settings and warnings
distinguish workspace from repository and project
read an extension permission warning
```

坏：

```text
learn English
remember workspace
know the meaning
```

## 10. 词频标准

`frequency_tier` 决定学习优先级。

```text
F1 高：高频、阻塞理解、经常出现在 UI / 文档 / 错误 / 设置 / 工作流中。
F2 中高：某个场景内常见，重要但不一定每天遇到。
F3 中：更窄的技术词，适合 F1/F2 稳定后学习。
F4 低：低频、背景、进阶或偶发词，早期包尽量少放。
```

判定原则：

```text
F1 不是“看起来重要”，而是“反复遇到且会阻塞任务”。
F2 是“场景内常见，但不一定全局高频”。
F3 是“专业但不常阻塞”。
F4 是“暂时知道即可，不急着记”。
```

早期真实包建议：

```text
F1 + F2 占 70%-85%。
F4 不应大量进入第一批真实学习包。
每张卡最好保留 frequency_reason；当前 schema 已支持导入，但它只属于生产依据，不参与 FSRS 调度。
```

## 11. 图谱关系字段标准

### 11.1 总原则

关系字段不是为了填满，而是为了让图谱能诊断。

每张生产级词卡至少应有 2 类有价值关系：

```text
场景关系
来源关系
易混关系
词族关系
标签关系
显式链接关系
```

### 11.2 `confusing_words`

只放真实易混词。

规则：

```text
1-3 个。
必须会导致理解、使用或选择错误。
不要放泛泛相关词。
最好在 notes 中写一句边界。
```

例子：

```text
workspace confusing_words: ["repository", "project", "folder"]
notes: "workspace is the editor context; repository is the version-controlled codebase."
```

### 11.3 `synonyms`

只放同一场景下可近似替换的词。

规则：

```text
0-3 个。
不要堆词典同义词。
不同场景不可替换的词不要放。
```

例子：

```text
extension synonyms: ["add-on", "plugin"]
```

### 11.4 `word_family`

用于识别词根、派生词、变体和常见相关形式。

规则：

```text
1-5 个。
只放能帮助识别的词形或派生关系。
不要把同一主题下所有词都塞进词族。
```

例子：

```text
extend
extension
extensible
extended
```

### 11.5 `tags`

标签用于稳定聚类。

规则：

```text
0-6 个。
优先使用稳定、可复用的标签。
不要重复系统已经自动生成的标签，除非它有额外语义。
```

好例子：

```text
ide/editor
workflow/settings
source/cursor
error/network
```

坏例子：

```text
important
hard
learn
english
misc
```

### 11.6 `links`

`links` 是显式概念连接，类似 Obsidian 的 `[[...]]`。

规则：

```text
0-5 个。
优先链接到已有或计划生产的 headword。
只有当链接能帮助回忆或辨析时才添加。
不要把所有相关词都链接一遍。
```

### 11.7 `aliases`

`aliases` 用于搜索、链接解析和 UI 中的别名。

例子：

```text
["VS Code workspace", "Cursor workspace"]
```

### 11.8 `notes`

`notes` 只写短说明。

适合写：

```text
易混边界
来源上下文
链接理由
特殊 UI 用法
```

不适合写：

```text
长篇来源摘录
百科解释
AI 生成长段落
无证据推断
```

## 12. 字段到图谱价值矩阵

| 字段 | 图谱节点/边 | 解决的问题 |
| --- | --- | --- |
| `headword` | 词卡节点 | 我正在学哪个词 |
| `part_of_speech` | 系统标签 | 这个词在任务中是什么类型 |
| `phonetic` | 词卡正面信息 | 我怎么读出来 |
| `audio_*` | 词卡正面操作 | 我能不能听一下 |
| `domain_pack_id` | 一级场景节点 | 这个词属于哪个大场景 |
| `scene_tags` | 二级场景节点 | 我在哪个具体任务遇到它 |
| `source` | 来源节点 | 我忘了应回到哪里 |
| `frequency_tier` | 系统标签/筛选 | 它应该先学还是后学 |
| `confusing_words` | 易混边 | 它和谁容易混 |
| `word_family` | 词族边 | 它有哪些词形和派生关系 |
| `synonyms` | 同义边 | 哪些词在本场景相近 |
| `tags` | 标签节点 | 它属于哪些稳定语义组 |
| `links` | 双向链接边 | 它和哪些概念显式相连 |
| `aliases` | 链接解析 | 用户可能用什么名字找它 |
| `notes` | 详情说明 | 关系边界是什么 |

## 13. 质量门禁

### Candidate

候选词卡可以不完整，但必须标记来源状态。

适用：

```text
AI 初筛
人工待查
来源未确认
场景待确认
```

### Importable

可导入词卡必须通过当前 schema。

要求：

```text
当前必填字段齐全
card_id 唯一
domain_pack_id 已知
scene_tags 是数组
frequency_tier 是 F1/F2/F3/F4
examples 至少 2 条
usage_tasks 至少 1 条
source 字段完整
```

### Learnable

可学习词卡必须满足：

```text
source_verified = true
examples_translated = true
ready_for_learning = true
中文定义是场景定义
至少一个清晰主场景
词频分级有依据
正面识别字段完整
```

当前正面识别字段要求：

```text
headword 完整
part_of_speech 完整
```

可选正面识别字段要求：

```text
phonetic 尽量完整
audio_url 或 audio_asset_id 可选但推荐
audio_accent 有差异时填写
```

### Graph-Ready

图谱可用词卡必须满足：

```text
有来源
有场景
有词频
至少 2 类有效关系字段
易混词是真实易混
词族不过度填充
标签和链接稳定
notes 能解释关键边界
```

### Hold

以下情况必须暂缓进入正式学习包：

```text
来源不可验证
中文解释只是词典翻译
场景过宽
词频靠猜
例句泛泛
关系字段为空或噪声太多
音频来源不可靠或版权不清
```

## 14. 包级生产标准

第一批真实包建议：

```text
60-300 张
6 个 Domain Pack 保持分离
每个启用的二级场景至少 5 张
F1 + F2 占 70%-85%
P0-P2 来源占主体
每张卡至少 2 个真实例句
每张卡至少 2 类图谱关系
```

不要做：

```text
一开始就做 3000 张低质量词卡
大量 F4 低频词进入早期学习
同一来源堆出一个巨大来源节点
所有词都打同样标签
没有易混词、词族、链接的孤岛词卡太多
```

## 15. 生产检查清单

导入前逐项检查：

```text
[ ] headword 是真实会看到的单词或固定短语
[ ] part_of_speech 能帮助识别
[ ] phonetic 已准备，或明确暂缺原因
[ ] audio 元数据已准备，或明确暂不支持
[ ] definition_zh 是场景含义，不只是词典翻译
[ ] definition_en 简短准确
[ ] examples 至少 2 条，且都有中文
[ ] usage_tasks 是真实任务
[ ] source 是真实来源，不是编造来源
[ ] source_priority 合理
[ ] domain_pack_id 只有一个
[ ] scene_tags 有清晰主场景
[ ] frequency_tier 有依据
[ ] confusing_words 是真实易混
[ ] word_family 能帮助识别
[ ] tags 稳定不过度
[ ] links 能帮助回忆或辨析
[ ] aliases 能帮助搜索或链接解析
[ ] notes 解释关键边界
[ ] quality.ready_for_learning 只在来源复核后为 true
```

## 16. 当前可导入示例

以下示例兼容当前 schema，包含新增可选字段示范。

```json
{
  "card_id": "ai-programming-ide-editor-workspace-001",
  "headword": "workspace",
  "phonetic": "/WURK-spays/",
  "audio_asset_id": "audio/ai-programming-english/workspace-us.mp3",
  "audio_accent": "US",
  "definition_zh": "工作区；编辑器当前打开的一组项目文件、设置和上下文。",
  "definition_en": "The set of files, folders, settings, and context currently opened in an editor.",
  "part_of_speech": "noun",
  "examples": [
    {
      "example_en": "Open this folder as a workspace before changing the project settings.",
      "example_zh": "修改项目设置之前，先把这个文件夹作为工作区打开。",
      "context": "IDE setup"
    },
    {
      "example_en": "The extension is disabled because the workspace is not trusted.",
      "example_zh": "由于当前工作区不受信任，该扩展已被禁用。",
      "context": "IDE warning"
    }
  ],
  "source": {
    "source_id": "cursor-docs",
    "source_name": "Cursor Docs",
    "source_url": "https://docs.cursor.com/",
    "source_type": "official_docs",
    "source_priority": "P0"
  },
  "domain_pack_id": "ai-programming-english",
  "scene_tags": ["ide_editor"],
  "frequency_tier": "F1",
  "usage_tasks": [
    "understand IDE workspace settings and warnings",
    "distinguish workspace from repository and project"
  ],
  "synonyms": ["working folder"],
  "confusing_words": ["repository", "project", "folder"],
  "word_family": ["workspaces"],
  "tags": ["ide/editor", "workflow/settings"],
  "links": ["repository", "project", "extension"],
  "aliases": ["VS Code workspace", "Cursor workspace"],
  "notes": "Workspace is the editor working context. Compare with [[repository]] and [[project]].",
  "frequency_reason": "F1 because workspace appears repeatedly in editor setup, trust, settings, and project context flows.",
  "source_context": "Cursor Docs and IDE help pages use workspace for the active editor context.",
  "card_status": "approved",
  "quality": {
    "source_verified": true,
    "examples_translated": true,
    "ready_for_learning": true
  }
}
```

图谱结果：

```text
workspace -> IDE界面
workspace -> Cursor Docs
workspace -> repository / project / folder
workspace -> workspaces
workspace -> ide/editor / workflow/settings
workspace -> repository / project / extension
```

记忆结果：

```text
F1 进入优先学习层。
点击单词列表会触发 browser_detail + again，加入今日待复习。
正式 FSRS 间隔仍由记忆卡评分按钮决定。
```

## 17. 当前可选扩展字段

当前导入格式已支持以下 `WordCard` 可选字段：

```text
phonetic?: string
audio_url?: string
audio_asset_id?: string
audio_accent?: "US" | "UK" | "tool-native" | "other"
frequency_reason?: string
source_context?: string
card_status?: "candidate" | "draft" | "approved" | "hold"
```

这些字段的性质：

```text
phonetic / audio_* 属于学习正面识别层。
frequency_reason / source_context / card_status 属于生产质检层。
它们不属于 FSRS 记忆状态，也不应混入 UserMemoryState。
```
