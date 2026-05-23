# TechLex OS Constitution v1.1

> 本文档是 TechLex OS 的宪法级目标锚点。后续无论对话压缩、窗口切换、工具更换或开发阶段变化，都必须先以本文档判断：终极目标是什么，当前阶段是否偏航。

## 1. 一句话定义

TechLex OS 是一个面向真实技术英语场景的自动学习运行系统。

用户批量导入已加工好的技术英语词卡后，只需设置学习计划和记忆规则，系统即可自动推送每日学习任务、执行 FSRS 记忆调度、记录复习反馈、更新掌握状态，并通过“单词星系”展示词汇之间的多维知识关系。

## 2. 最高目标

TechLex OS 的最高目标不是管理词库，而是让用户可以直接学习。

最终用户体验必须是：

```text
导入词卡
-> 设置学习计划和记忆规则
-> 点击开始学习
-> 系统自动推送每日任务
-> 用户完成复习互动
-> 系统自动记录反馈
-> 系统自动更新掌握状态
-> 系统自动安排下一次复习
-> 系统自动更新单词星系
-> 必要时导出学习数据
```

## 3. 产品本质

TechLex OS 不是词卡加工后台。
TechLex OS 不是普通词库管理器。
TechLex OS 不是单纯 Anki 替代品。
TechLex OS 不是单纯 Obsidian 图谱替代品。

TechLex OS 的本质是：

```text
技术英语自动学习运行系统
= 批量词卡导入
+ 学习计划引擎
+ FSRS 记忆调度引擎
+ 客户端复习交互
+ ReviewEvent 自动记录
+ UserMemoryState 自动回流
+ 单词星系知识图谱
+ 批量导入导出
```

## 4. 职责边界

### Codex 工作台负责词卡加工

Codex 工作台负责：

```text
来源注册表整理
目标官网/工具页倒推候选词
候选词池生成
50 卡槽选择
词卡草稿生成
中文释义
英文释义
真实开发场景例句
中文翻译
来源证据
同义词
易混词
词族
质量审查
结构化导出
异常修复
```

这些不是 TechLex OS 客户端的核心职责。

### TechLex OS 客户端负责学习运行

TechLex OS 客户端负责：

```text
批量导入标准词卡包
批量导入学习历史
设置学习计划
设置记忆规则
自动生成每日学习任务
执行复习互动
记录 ReviewEvent
更新 UserMemoryState
执行 FSRS 调度
展示单词星系
导出词卡/复习/记忆/图谱数据
处理导入异常
```

客户端不得被设计成以手工制卡为中心的后台系统。

## 5. 标准词卡包要求

TechLex OS 必须支持批量导入标准词卡数据。

每张词卡至少支持：

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
source_name
source_url
source_type
source_priority
domain_pack
scene_tags
frequency_tier
synonyms
confusing_words
word_family
usage_tasks
notes
```

导入后，系统应自动完成：

```text
字段校验
重复检测
来源校验
标签解析
图谱关系生成
初始学习状态创建
每日任务候选生成
```

## 6. 学习计划引擎

用户必须能设置学习规则，而不是每天手动安排。

至少支持：

```text
每天新学数量
每天复习上限
目标记忆率
优先 Domain Pack
优先场景
优先词频等级
是否优先复习逾期词
是否自动巩固弱项
是否暂停新词
学习日历
每日提醒时间
```

系统必须根据这些规则自动生成每日任务。

## 7. FSRS 记忆调度引擎

TechLex OS 必须内置成熟 FSRS 记忆调度能力。

系统必须自动处理：

```text
新卡学习
到期复习
逾期复习
复习评分
下次复习时间
记忆稳定性
记忆难度
遗忘次数
掌握状态
巩固建议
降级建议
放行建议
```

用户只需要在复习时反馈：

```text
忘记 / 困难 / 良好 / 简单
```

系统必须自动记录并计算下一步。

## 8. 客户端复习交互

客户端必须以“开始学习”为核心入口。

复习流程必须支持：

```text
今日任务展示
开始学习
看题
显示答案
选择掌握反馈
自动进入下一张
本轮完成统计
错题/弱项自动进入巩固
下次复习自动安排
```

用户不应需要手动判断下一次什么时候复习。

## 9. ReviewEvent 自动记录

每次复习都必须自动生成 ReviewEvent。

ReviewEvent 至少包括：

```text
card_id
user_id
reviewed_at
rating
response_time
review_mode
scheduler
fsrs_state_before
fsrs_state_after
device_context
```

ReviewEvent 是真实复习行为记录，不能用 mock_event 参与正式判断。

## 10. UserMemoryState 自动回流

系统必须为每个用户、每张词卡维护独立记忆状态。

UserMemoryState 至少包括：

```text
card_id
user_id
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

## 11. 单词星系知识图谱

TechLex OS 必须提供 Obsidian-style 的多维双向链接能力，并产品化为“单词星系”。

每个单词必须能连接到：

```text
场景
来源
词频
词性
同义词
易混词
词族
Domain Pack
使用任务
掌握状态
复习状态
```

单词星系必须支持：

```text
全局图谱
局部词图谱
场景 Hub
来源 Hub
易混词 Hub
词族 Hub
掌握状态着色
复习到期提示
点击节点查看词卡
按 Domain Pack / 场景 / 掌握状态筛选
```

图谱不是装饰，而是帮助用户理解词汇关系和学习优先级的核心功能。

## 12. 自动学习任务

系统首页必须围绕每日学习任务设计。

用户必须能一眼看到：

```text
今日新学
今日复习
今日巩固
逾期复习
已完成数量
剩余数量
预计用时
连续学习天数
当前掌握趋势
```

首页主按钮必须是：

```text
开始学习
```

而不是“管理词库”。

## 13. 批量导入导出

系统必须支持数据可迁移。

导入至少支持：

```text
标准词卡包
学习历史
ReviewEvent
UserMemoryState
图谱关系
```

导出至少支持：

```text
词卡数据
复习事件
用户记忆状态
图谱关系
异常报告
Codex 回流包
Obsidian 兼容包
Anki 兼容包
```

## 14. 异常处理

正常学习流程应自动运行，人工只处理异常。

异常包括：

```text
导入字段缺失
来源链接缺失
重复词卡
同词冲突
图谱关系冲突
FSRS 状态异常
导出失败
数据格式不兼容
```

异常必须进入异常队列，由用户选择：

```text
修复
忽略
退回 Codex 工作台
暂缓
```

## 15. 不合格定义

以下任何情况都视为偏离宪法目标：

```text
客户端主要变成手工制卡后台
用户必须每天手动选择学习词
用户必须手动安排复习时间
系统不能自动记录 ReviewEvent
系统不能自动更新 UserMemoryState
系统没有 FSRS 调度能力
系统没有单词星系图谱
系统只能展示词库，不能推动学习
系统只能管理数据，不能自动学习
Codex 的词卡加工职责被塞进客户端核心
Anki 或 Obsidian 被写死成唯一依赖
```

## 16. 最终验收句

以后验收 TechLex OS，只看这一句话：

```text
我是否可以批量导入已加工好的技术英语词卡，只设置学习计划和记忆规则，然后系统自动推送每日学习任务、执行 FSRS 复习、记录反馈、更新掌握状态，并通过单词星系展示词汇关系？
```

如果可以，项目达标。
如果不可以，项目未达标。

## 17. 最终裁决

TechLex OS 的最高目标是：

```text
自动学习运行系统
```

不是：

```text
词卡加工后台
```

词卡加工属于 Codex 工作台。
学习运行属于 TechLex OS 客户端。
FSRS 负责记忆调度。
单词星系负责知识关系。
用户负责设置规则和完成学习互动。
系统负责其余自动化流程。

## 18. 阶段状态锚点归属

宪法文档只记录终局目标、职责边界、偏航判定和最高验收句。

当前阶段、已通过阶段、下一阶段、外部工具状态、测试候选词、临时禁止事项，不再写入本文档。

这些会快速变化的信息统一归属：

```text
PROJECT_STATE.md
ROADMAP.md
docs/MAINLINE_INTERFACE_PROTOCOL.md
```

如果本文档和 `PROJECT_STATE.md` 对当前阶段描述冲突，以 `PROJECT_STATE.md` 为准。

如果 `PROJECT_STATE.md` 和本文档对终局目标、职责边界、偏航判定冲突，以本文档为准。

## 19. 压缩后续接规则

每次上下文压缩或新窗口继续时，先读取本文档，再读取 `PROJECT_STATE.md`。

必须先回答：

```text
终极目标是什么？
当前阶段是什么？
哪些阶段已通过？
当前阶段允许做什么？
当前阶段禁止做什么？
是否偏离自动学习运行系统这个最高目标？
```
