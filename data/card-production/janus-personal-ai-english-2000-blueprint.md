# Janus Personal AI English 2000 词卡生产蓝图

生成时间：2026-05-22T09:00:00+08:00

本蓝图用于生产你的个人 AI 工作流英语词卡包。目标不是堆词典词条，而是覆盖你在 AI 编程、模型平台、运行时、云协作、Web3、产品设计和创意工具中的真实高频任务词。

## 1. 目标

| 项目 | 标准 |
| --- | --- |
| 最低可用规模 | 1200 张 |
| 推荐完整规模 | 2000 张 |
| 覆盖目标 | 覆盖个人 AI 工作流 80%-90% 高频英语 |
| 当前交付 | 120 张验收样板包 |
| 导入边界 | 当前 JSON 已支持 phonetic / audio_* / frequency_reason / source_context / card_status；这些字段均为可选 |

## 2. 一级领域配额

| 一级领域 | 目标词卡数 | 样板词卡数 | 生产重点 |
| --- | ---: | ---: | --- |
| AI Programming English | 440 | 20 | IDEs, AI coding assistants, agentic coding, Git, CLI, debugging, and technical documentation. |
| AI Platform & Model Tools English | 380 | 20 | Model platforms, APIs, tokens, context, billing, console settings, model docs, and account workflows. |
| Programming Language & Runtime English | 320 | 20 | Python, TypeScript, JavaScript, Node.js, Shell, YAML, frameworks, dependencies, runtime, and build tooling. |
| Developer Cloud & Collaboration Tools English | 320 | 20 | GitHub, cloud deployment, permissions, files, deployment environments, and collaboration workflows. |
| Web3 Developer English | 280 | 20 | Wallets, smart contracts, DeFi, RPC, block explorers, security, and on-chain development. |
| Product Design & Creative Tools English | 260 | 20 | Figma, Gamma, Lovart, prototyping, canvas, presentation, generation, and creative production tools. |

## 3. 二级场景配额

| 一级领域 | 二级场景 | scene_tag | 目标词卡数 |
| --- | --- | --- | ---: |
| AI Programming English | IDE界面 | `ide_editor` | 65 |
| AI Programming English | AI代码助手 | `ai_code_assistant` | 65 |
| AI Programming English | AI代理编程 | `agentic_coding` | 60 |
| AI Programming English | 版本控制 | `git_version_control` | 55 |
| AI Programming English | 命令行终端 | `cli_terminal` | 50 |
| AI Programming English | 调试排错 | `debugging` | 55 |
| AI Programming English | 技术文档 | `technical_docs` | 45 |
| AI Programming English | 依赖管理 | `dependencies` | 45 |
| AI Platform & Model Tools English | 模型API | `model_api` | 70 |
| AI Platform & Model Tools English | 控制台 | `console` | 45 |
| AI Platform & Model Tools English | Token | `tokens` | 55 |
| AI Platform & Model Tools English | 上下文窗口 | `context_window` | 60 |
| AI Platform & Model Tools English | 账号计费 | `billing` | 35 |
| AI Platform & Model Tools English | 账号 | `account` | 30 |
| AI Platform & Model Tools English | API密钥 | `api_keys` | 40 |
| AI Platform & Model Tools English | 模型文档 | `model_docs` | 45 |
| Programming Language & Runtime English | TS/JS | `typescript_javascript` | 70 |
| Programming Language & Runtime English | Node运行时 | `node_runtime` | 55 |
| Programming Language & Runtime English | 依赖管理 | `dependencies` | 55 |
| Programming Language & Runtime English | 构建工具 | `build_tools` | 50 |
| Programming Language & Runtime English | 框架 | `frameworks` | 35 |
| Programming Language & Runtime English | Shell | `shell` | 30 |
| Programming Language & Runtime English | YAML | `yaml` | 25 |
| Developer Cloud & Collaboration Tools English | 部署环境 | `deployment_environment` | 65 |
| Developer Cloud & Collaboration Tools English | GitHub | `github` | 60 |
| Developer Cloud & Collaboration Tools English | 云服务 | `cloud` | 55 |
| Developer Cloud & Collaboration Tools English | 权限 | `permissions` | 45 |
| Developer Cloud & Collaboration Tools English | 文件协作 | `files` | 35 |
| Developer Cloud & Collaboration Tools English | 协作 | `collaboration` | 35 |
| Developer Cloud & Collaboration Tools English | 工作区管理 | `workspace_admin` | 25 |
| Web3 Developer English | 钱包 | `wallet` | 50 |
| Web3 Developer English | 智能合约 | `smart_contract` | 55 |
| Web3 Developer English | DeFi | `defi` | 45 |
| Web3 Developer English | RPC节点 | `rpc` | 40 |
| Web3 Developer English | 区块浏览器 | `block_explorer` | 35 |
| Web3 Developer English | 安全审计 | `security` | 30 |
| Web3 Developer English | 链上开发 | `on_chain_development` | 25 |
| Product Design & Creative Tools English | Figma | `figma` | 65 |
| Product Design & Creative Tools English | 原型 | `prototype` | 50 |
| Product Design & Creative Tools English | 画布 | `canvas` | 35 |
| Product Design & Creative Tools English | 演示 | `presentation` | 35 |
| Product Design & Creative Tools English | 生成式设计 | `generative_design` | 35 |
| Product Design & Creative Tools English | 创作流程 | `creative_workflow` | 25 |
| Product Design & Creative Tools English | Gamma | `gamma` | 15 |

## 4. 词频配额

| 词频 | 目标词卡数 | 含义 |
| --- | ---: | --- |
| F1 高 | 760 | 每天都会撞见的按钮、状态、API、错误、文档词。 |
| F2 中高 | 700 | 每周高频使用的配置、流程、参数和工具词。 |
| F3 中 | 420 | 理解技术文档和图谱关系时需要的中频词。 |
| F4 低 | 120 | 低频但能补足边界、排错、安全或专业表达的词。 |

样板包当前词频分布：

| 词频 | 样板数量 |
| --- | ---: |
| F1 | 48 |
| F2 | 42 |
| F3 | 24 |
| F4 | 6 |

## 5. 生产规则

每张正式词卡必须满足：

1. 有真实来源，优先官方文档、API Reference、Help Center。
2. 只放一个核心 `headword`，固定短语不强行拆词。
3. 至少一个二级 `scene_tag`，最多两个；第一项作为主场景。
4. 中文释义必须服务真实任务，不写泛泛词典解释。
5. 至少两条例句：一条真实场景例句，一条来源/操作边界例句。
6. `frequency_tier` 必须能解释为什么先学它。
7. 图谱关系字段必须克制：词族、易混词、同义词、标签、显式链接都要服务“为什么记不住”。

## 6. 来源策略

| 来源等级 | 用途 |
| --- | --- |
| P0 官方文档/API Reference/Help Center | 首选来源，适合正式词卡 |
| P1 官方博客/官方教程 | 可补充新功能和真实表达 |
| P2 真实 CLI 输出/工具 UI | 适合错误信息、按钮、界面词 |
| P3 真实个人工作流 | 适合无法从文档直接抽取但反复出现的操作词 |
| P4 非官方文章 | 仅做候选，不直接进正式包 |

## 7. 生产批次

| 批次 | 数量 | 目标 |
| --- | ---: | --- |
| 验收样板 | 120 | 验证字段质量、导入、图谱、复习体验 |
| 第一正式批 | 300-500 | 覆盖 AI 编程、模型 API、运行时核心高频词 |
| 第二正式批 | 300-500 | 扩展 Web3、云协作、设计创意 |
| 第三正式批 | 300-500 | 补全错误、边界、易混词、来源词 |
| 完整版 | 1800-2000 | 形成个人 AI 工作流 80%-90% 高频覆盖 |

## 8. 验收门槛

样板包验收通过才扩展：

- 能被当前 app 直接导入。
- 单词本能按全部、一级、二级场景浏览。
- 点击词卡能进入 browser_detail + again 的今日待复习队列。
- 图谱能显示来源、场景、词族、易混词、标签关系。
- 学习卡片中文解释清楚，不依赖英文词典原文。
- 120 张中重复、泛化、无真实场景的卡不得超过 5 张。

## 9. 当前可选扩展字段

当前生产标准已经纳入，导入 schema 已支持：

```text
phonetic
audio_url
audio_asset_id
audio_accent
frequency_reason
source_context
card_status
```

这些字段属于词卡内容或生产质检层，不进入 UserMemoryState，也不参与 FSRS 调度。
