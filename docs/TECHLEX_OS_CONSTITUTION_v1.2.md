# 雅努斯词境 OS / TechLex OS Constitution v1.2

本文档是“雅努斯词境 OS”通用产品与“TechLex OS / 技术词境”当前场景样板的宪法级目标与架构锚点。后续无论是网页端、H5、PWA、App、微信小程序、云同步，还是任何 UI 改造，都必须先服从本文档。

## 0. 命名与范围裁决

本项目必须区分通用系统和个人场景。

```text
雅努斯词境 OS = 通用产品 / 通用个人英语词汇学习操作系统
TechLex OS = 当前技术英语场景版 / 技术词境样板
技术词境 = 当前用户的技术英语 Domain Pack 体系
AI 编程英语 = 技术词境下的一个子场景
```

“雅努斯词境 OS”的目标用户不是只有技术英语学习者。不同用户可以根据自己的真实目标和材料，定义自己的场景包。

示例：

```text
技术词境：AI 编程 / Web3 / 云服务 / 设计工具
考研词境：阅读理解 / 翻译 / 作文 / 完形填空
职场词境：会议 / 邮件 / 汇报 / 面试 / 管理沟通
外贸词境：询盘 / 报价 / 合同 / 物流 / 售后
医学词境：临床 / 药品 / 病历 / 论文 / 医患沟通
法律词境：合同 / 诉讼 / 合规 / 证据 / 判例
用户自定义词境：由用户自己定义一级场景和二级场景
```

硬性规则：

```text
通用学习内核不得写死技术英语。
通用学习内核不得写死 AI 编程英语。
通用学习内核不得写死 Web3。
通用学习内核不得写死任何个人场景。
所有场景分类必须通过 DomainPack / primary_scene / secondary_scene / tags 配置进入系统。
```

实现约束：

```text
通用系统只提供能力，不提供固定场景。
个人场景只作为数据进入系统，不改变通用内核。
任何用户都可以创建自己的一级场景、二级场景、来源、词频规则、使用任务和标签体系。
任何默认场景包都只是初始化模板，可以被替换、禁用或扩展。
如果新增一个场景需要修改 Domain Core，说明架构已经偏离宪法。
```

## 1. 一句话定义

雅努斯词境 OS 是一个让每个人基于自己的真实场景、学习目标、真实材料和掌握状态，构建个人专属英语词汇学习系统的自动学习运行系统。

用户批量导入或创建适合自己场景的英语词卡后，只需要设置学习计划和记忆规则，系统即可自动生成每日学习任务、执行 FSRS 复习、记录 ReviewEvent、更新 UserMemoryState，并通过图谱展示词汇关系。

雅努斯词境 OS 不是词卡加工后台，不是普通单词表，不是 Anki 的简单替代品，也不是 Obsidian 的简单替代品。

TechLex OS / 技术词境只是“雅努斯词境 OS”的第一个深度样板，不代表通用产品的全部。

## 2. 当前阶段目标

当前阶段采用本地优先策略：

```text
PC 本地优先跑完整功能
手机通过 PWA / 局域网先体验复习
用备份文件在 PC 和手机之间迁移数据
后续再做自动同步
```

当前阶段的核心目标不是商业化云端系统，而是先让用户可以在自己的 PC 和手机上稳定使用。

## 3. 终局目标

雅努斯词境 OS 的终局目标是：

```text
跨端可用的个人词境自动学习运行系统
```

最终用户体验必须达到：

```text
选择或创建自己的场景包
-> 导入或创建标准词卡包
-> 设置学习计划和记忆规则
-> 系统自动生成每日任务
-> 用户完成学习与复习
-> 系统自动记录 ReviewEvent
-> 系统自动更新 UserMemoryState
-> 系统自动安排下一次复习
-> 系统自动更新图谱关系和掌握状态
-> 用户可备份、迁移、同步学习数据
```

## 4. 当前本地部署裁决

雅努斯词境 OS 当前采用 local-first 架构。TechLex OS / 技术词境样板用于验证这套通用架构。

PC 本地端的定位：

```text
完整功能主工作台
批量导入词卡包
完整复习
完整单词本
完整图谱
完整设置
备份导出
备份恢复
大包数据管理
```

手机本地端的定位：

```text
日常复习
浏览单词
轻量图谱
学习设置查看和少量调整
备份导入
备份导出
```

局域网访问的定位：

```text
PC 启动本地应用
手机在同一 Wi-Fi 下访问 PC 地址
用于预览、体验、测试复习流程
```

PWA 的定位：

```text
让手机和 PC 像 App 一样使用 Web 应用
支持离线或弱网下的基础学习能力
作为正式 App 之前的低成本跨端方案
```

## 5. 终局跨端裁决

雅努斯词境 OS 必须支持未来跨端扩展，但不能为了跨端牺牲核心架构。

未来支持端包括：

```text
PC Web
H5
PWA
uni-app App
微信小程序
未来云端同步版
```

跨端原则：

```text
核心学习逻辑一套
不同端只替换 UI Shell 和 Adapter
```

不追求所有代码 100% 一码多端。正确目标是：

```text
领域核心复用
应用服务复用
导入导出规则复用
FSRS 调度逻辑复用
图谱数据模型复用
UI 和平台能力按端适配
```

## 6. 最高架构原则

雅努斯词境 OS 必须采用：

```text
纵向业务分域
+ 横向技术分层
+ Adapter 解耦
```

不能只按页面开发，也不能只按前端 / 后端 / API 粗暴拆分。

## 7. 纵向业务分域

雅努斯词境 OS 的业务域分为：

```text
词卡导入域
单词记忆域
单词本浏览域
图谱关系域
学习设置域
备份恢复域
同步适配域
统计分析域
```

词卡加工域不属于 TechLex OS 客户端核心。

词卡加工由 Codex 工作台或外部 Card Factory 负责：

```text
来源整理
候选词生成
词卡加工
中文解释
英文例句
中文翻译
来源证据
质量审查
结构化导出
```

雅努斯词境 OS 客户端只负责学习运行：

```text
导入
复习
记忆调度
掌握状态回流
图谱展示
设置
备份
迁移
同步
```

## 8. 横向技术分层

雅努斯词境 OS 的技术架构必须分层：

```text
UI Shell
Application Services
Domain Core
Adapter Interfaces
Infrastructure
```

### UI Shell

负责页面和交互：

```text
复习
单词本
统计
图谱
设置
```

UI Shell 可以因平台不同而不同。

### Application Services

负责用例编排：

```text
ImportCardPackage
BuildTodayQueue
SubmitReview
UpdateMemoryState
BuildWordGraph
BackupData
RestoreData
ExportData
```

### Domain Core

负责平台无关的核心模型和规则：

```text
WordCard
DomainPack
LearningPlan
ReviewEvent
UserMemoryState
GraphNode
GraphEdge
ImportReport
BackupSnapshot
```

Domain Core 不得依赖 React、DOM、IndexedDB、微信小程序 API、uni-app API 或具体后端。

Domain Core 也不得依赖任何具体场景值。

禁止在 Domain Core 写死：

```text
AI Programming
Web3
IDE
Cursor
GitHub
考研
外贸
医学
法律
任何个人固定场景
```

这些内容必须作为 DomainPack 或用户配置数据进入系统。

### Adapter Interfaces

负责隔离外部能力：

```text
SchedulerAdapter
StorageAdapter
ImportExportAdapter
GraphRendererAdapter
FileAdapter
NotificationAdapter
SyncAdapter
```

### Infrastructure

负责具体实现：

```text
IndexedDB
localStorage shadow
PWA service worker
browser file API
mobile storage
future remote backend
future cloud sync
```

## 9. 核心数据对象

以下数据对象必须长期保持分离：

```text
WordCard
UserMemoryState
ReviewEvent
DomainPack
LearningPlan
GraphRelation
ImportReport
BackupSnapshot
```

关键原则：

```text
WordCard 是内容
UserMemoryState 是用户对某张卡的掌握状态
ReviewEvent 是一次真实学习或复习行为
DomainPack 是场景包规则
LearningPlan 是学习计划和记忆规则
GraphRelation 是词汇关系
```

不得把词卡内容、用户记忆状态、复习事件混在同一个对象里。

## 10. 标准词卡包

雅努斯词境 OS 必须以标准词卡包为导入核心。

标准词卡至少包含：

```text
card_id
headword
phonetic
definition_zh
definition_en
part_of_speech
examples
source_name
source_url
source_type
source_priority
domain_pack
primary_scene
secondary_scene
frequency_tier
synonyms
confusing_words
word_family
usage_tasks
tags
links
notes
```

导入后系统必须自动完成：

```text
字段校验
重复检测
初始 UserMemoryState 创建
图谱关系生成
每日任务候选生成
导入报告生成
异常提示
```

## 11. FSRS 记忆调度

FSRS 是雅努斯词境 OS 的核心记忆调度引擎。

用户只需要反馈：

```text
忘记
困难
良好
简单
```

系统必须自动处理：

```text
新卡学习
到期复习
逾期复习
遗忘重学
弱项巩固
下次复习时间
稳定性
难度
可回忆率
掌握阶段
推荐动作
```

FSRS 必须通过 SchedulerAdapter 接入，不能让 UI 直接依赖具体 FSRS 库。

### 11.1 第三方算法依赖治理候选条款

本条为宪法级候选条款。详细治理规则归属 `docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md`，本文档只保留最高层裁决。

FSRS / `ts-fsrs` 属于第三方算法依赖，不是雅努斯词境 OS 自行发明的记忆算法。系统可以把 FSRS 作为核心记忆调度引擎，但必须长期保持可审计、可替换、可追溯。

硬性规则：

```text
第三方算法必须通过 Adapter 接入，不能污染 UI Shell 或 Domain Core。
第三方算法依赖必须锁定精确版本，不能使用漂移版本范围。
ReviewEvent 必须记录 scheduler 和 scheduler_version。
关键调度行为必须有 golden test，验证固定输入下的原始第三方算法输出。
系统必须区分第三方算法原始输出和产品规则适配后的最终状态。
第三方算法的版权、许可证和来源声明必须保留。
产品规则不得伪装成第三方算法原始规则。
```

FSRS 审计字段必须区分：

```text
fsrs_raw_state_after = ts-fsrs 原始输出
state_after = 经过雅努斯词境 OS 产品规则适配后的最终状态
```

“点击词卡 = 不认识 = browser_detail + again = 加入今日待复习队列”是雅努斯词境 OS 的产品规则，属于 Adapter / Queue Layer 叠加。它可以影响今日待复习队列，但不得被伪装成 `daily_task` 正式复习，也不得被写成 FSRS 原始算法规则。

## 12. ReviewEvent 规则

每一次学习行为都必须生成 ReviewEvent。

ReviewEvent 至少包含：

```text
card_id
reviewed_at
rating
response_time
review_mode
scheduler
scheduler_version
state_before
fsrs_raw_state_after
state_after
device_context
```

ReviewEvent 类型必须区分：

```text
daily_task
browser_detail
manual_mark
smoke_test
imported_history
```

测试事件不得参与真实记忆判断。

`daily_task` 和 `browser_detail` 必须在统计、复习队列和审计数据中可区分。浏览详情写入可以表达“不认识”和加入今日待复习队列，但不能计入正式每日复习完成量。

## 13. UserMemoryState 规则

每张词卡必须有独立 UserMemoryState。

UserMemoryState 至少包含：

```text
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
```

recommended_action 至少包括：

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

## 14. 图谱架构

图谱不是装饰功能，而是词汇关系检查和学习优先级判断工具。

图谱必须支持：

```text
全局图谱
局部图谱
词卡节点
场景节点
来源节点
标签节点
同义词节点
易混词节点
词族节点
掌握状态节点
双向链接
反向链接
点击节点查看词卡
点击节点查看相关词
按 Domain Pack / 场景 / 掌握状态筛选
```

视觉和交互目标：

```text
Obsidian-like
灰阶
低噪声
背景节点淡化
选中节点高亮
直接相关边和邻居节点增强
拖动节点有力场、弹簧、惯性、阻尼和自然回弹
```

图谱渲染必须通过 GraphRendererAdapter 或独立渲染组件隔离，不能污染核心图谱数据模型。

## 15. 单词本架构

单词本是学习入口，不是管理后台。

单词本必须支持：

```text
全部
一级场景
二级场景
未学习统计
学习中统计
待复习统计
学习记忆
浏览单词
学习设置
```

单词本中的二级场景应像文件夹一样组织。

浏览单词模式必须支持：

```text
英语
音标
中文
折叠详情
例句
中文翻译
来源
场景
同义词
易混词
词族
记忆状态
```

## 16. 学习设置架构

学习设置必须支持全局设置，也必须支持单词本级设置。

至少支持：

```text
每日新卡上限
每日复习上限
每日弱项巩固上限
目标保持率
暂停新卡
最大复习间隔
遗忘后重学间隔
记忆难点阈值
复习排序
优先 Domain Pack
优先场景
```

设置不应堆在首页，而应下沉到设置页或单词本卡片设置入口。

## 17. 备份与迁移

在自动同步完成之前，备份文件是 PC 和手机之间迁移数据的正式通道。

必须支持：

```text
导出完整备份
导入完整备份
备份版本号
数据结构版本号
ReviewEvent 保留
UserMemoryState 保留
导入报告保留
异常恢复
last_good 快照
```

PC 与手机迁移流程：

```text
PC 导出备份
手机导入备份
手机完成学习
手机导出备份或 ReviewEvent
PC 导入回收
```

## 18. 同步架构

自动同步是未来增强，不是当前核心依赖。

必须通过 SyncAdapter 接入：

```text
ManualBackupSyncAdapter
LanSyncAdapter
RemoteSyncAdapter
CloudSyncAdapter
```

不得把任何云服务写死进 Domain Core。

未来远程同步必须解决：

```text
多端数据合并
ReviewEvent 去重
UserMemoryState 冲突处理
备份回滚
离线写入
恢复策略
隐私与权限
```

## 19. 多端架构

当前端：

```text
PC Web
H5
PWA
```

未来端：

```text
uni-app App
微信小程序
```

多端复用原则：

```text
Domain Core 复用
Application Services 复用
标准词卡包格式复用
FSRS 调度逻辑复用
图谱数据模型复用
备份格式复用
UI Shell 按端实现
StorageAdapter 按端实现
NotificationAdapter 按端实现
FileAdapter 按端实现
GraphRendererAdapter 按端实现
```

## 20. 不合格定义

以下情况视为偏离宪法目标：

```text
客户端主要变成手工制卡后台
用户必须每天手动安排复习
系统不能自动生成每日任务
系统不能记录 ReviewEvent
系统不能更新 UserMemoryState
系统没有 FSRS 调度能力
系统没有图谱关系能力
系统只能展示词库，不能推动学习
词卡加工职责被塞进客户端核心
Anki / Obsidian / Meoo / Supabase 被写死成核心依赖
技术英语 / AI 编程英语 / Web3 被写死进通用核心
用户不能自定义自己的一级场景和二级场景
PC 和手机数据无法备份迁移
未来同步会导致核心重写
```

## 21. 当前验收句

当前阶段是否达标，只看：

```text
我是否能在 PC 本地完整导入和学习当前技术词境样板词卡，
并能用手机通过 PWA 或局域网体验复习，
还能用备份文件在 PC 和手机之间迁移学习数据？
```

如果可以，当前阶段达标。

## 22. 终局验收句

终局是否达标，只看：

```text
我是否可以跨 PC、手机、PWA、未来 App 或小程序，
根据自己的学习目标创建或选择场景包，
批量导入或创建已经加工好的英语词卡，
只设置学习计划和记忆规则，
然后系统自动推送每日学习任务，
执行 FSRS 复习，
记录 ReviewEvent，
更新 UserMemoryState，
通过图谱展示词汇关系，
并可靠完成备份、迁移和同步？
```

如果可以，雅努斯词境 OS 达标。

如果不可以，雅努斯词境 OS 未达标。

## 23. 文档归属规则

本文档只记录：

```text
终局目标
当前本地优先裁决
架构边界
数据对象原则
多端原则
不合格定义
验收句
```

以下内容不写入本文档：

```text
当前开发阶段
具体测试截图
临时 bug
短期 UI 微调
阶段性 smoke test 结果
```

这些内容归属：

```text
PROJECT_STATE.md
ROADMAP.md
docs/*_VALIDATION.md
```

如果本文档与 PROJECT_STATE.md 对当前阶段描述冲突，以 PROJECT_STATE.md 为准。

如果本文档与 PROJECT_STATE.md 对终局目标、架构边界、不合格定义冲突，以本文档为准。
