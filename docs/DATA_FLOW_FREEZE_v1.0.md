# 数据流冻结文档 v1.0

本文档冻结“雅努斯词境 OS / TechLex OS”五个底栏页面之间的数据语义、ReviewEvent 口径、FSRS 与产品规则的边界。

目标是避免未来重构时出现：

```text
页面看起来对，但数据联动错。
browser_detail 被误算成正式复习。
FSRS 原始输出和产品适配状态混在一起。
PC 和手机同一操作结果不一致。
```

## 1. 核心实体

主要实体：

```text
WordCard
UserMemoryState
ReviewEvent
LearningPlan
DomainPack
SceneTag
```

页面不得绕过这些实体自行维护另一套学习状态。

## 2. WordCard 字段用途

词卡字段分三层：

```text
学习呈现字段：headword, phonetic, audio, part_of_speech, definition_zh, definition_en, examples
场景组织字段：domain_pack_id, scene_tags, frequency_tier, tags
图谱关系字段：source, word_family, confusing_words, synonyms, links, tags, scene_tags
```

导入包必须保留这些字段，否则图谱和学习页都会退化。

## 3. 记忆状态分组

页面统一使用以下分组：

```text
未学习 = new 或无 UserMemoryState
学习中 = learning / reinforce / downgrade
待复习 = reviewing / due / overdue
已掌握 = release
```

任何页面不得把 `learning` 直接显示成 `复习中`。

## 4. 两类 ReviewEvent

正式复习：

```text
review_mode = daily_task
rating = again | hard | good | easy
来源 = 今日页或单词本内联学习评分
作用 = 正式进入 FSRS 和统计口径
```

浏览触发式遗忘标记：

```text
review_mode = browser_detail
rating = again
来源 = 点击单词列表词卡详情
作用 = 产品规则判断“我不认识”，加入今日待复习
```

边界：

```text
browser_detail 不得伪装成 daily_task。
browser_detail 不得计入今日已复习。
browser_detail 不得计入 Again率。
browser_detail 可以影响今日待复习队列。
```

## 5. FSRS 原始输出与产品适配

ReviewEvent 必须区分：

```text
fsrs_raw_state_after
state_after
```

含义：

```text
fsrs_raw_state_after = ts-fsrs 原始算法输出
state_after = 经过产品 Adapter / Queue Layer 适配后的最终状态
```

`daily_task`：

```text
fsrs_raw_state_after 和 state_after 通常一致，除非产品层有明确适配。
```

`browser_detail`：

```text
fsrs_raw_state_after 记录 ts-fsrs 对 again 的原始输出。
state_after 允许被产品规则适配为进入今日待复习队列。
```

## 6. Scheduler 审计字段

每条 ReviewEvent 必须记录：

```text
scheduler = ts-fsrs
scheduler_version = 5.4.0
```

不得只记录算法名称而不记录版本。

不得把产品规则描述为 FSRS 原始算法。

## 7. 点击单词列表词卡规则

冻结规则：

```text
只要用户点击单词列表词卡主体并打开详情，就视为不认识。
```

写入：

```text
review_mode = browser_detail
rating = again
state_after = 可进入今日待复习的状态
```

限制：

```text
点击读音按钮不触发。
重复展开同一词卡不应无限重复写入。
demo 词卡不写入。
```

目标：

```text
让真实使用中的“不认识”可以被系统捕获，而不是只依赖正式复习按钮。
```

## 8. 今日页数据口径

今日页队列：

```text
getReviewStageQueue(data, now)
```

进入今日页：

```text
reviewing
due
overdue
browser_detail + again 后被产品规则加入今日待复习的词卡
```

不进入今日页：

```text
普通 new
普通 learning
普通 reinforce
普通 downgrade
release
```

今日顶部统计：

```text
待复习 = 今日需要处理的复习规模
已复习 = 今日已完成的 daily_task 正式复习数量
剩余 = 当前队列剩余数量
```

`已复习` 不包含 `browser_detail`。

## 9. 单词本数据流

主页面：

```text
AppData.cards -> 按 selectedPackId 聚合 -> 二级场景文件夹
```

全部：

```text
selectedPackId = all
显示所有 Domain Pack 的 scene_tags 聚合文件夹
```

子页：

```text
scene range filter
frequency filter
status filter
insertion-desc sorting
```

操作：

```text
点击场景卡片 -> 进入子页
点击开始学习 -> 当前子页内联学习
点击词卡行 -> browser_detail + again
点击评分 -> daily_task
```

## 10. 统计页数据口径

今日执行：

```text
今日待复习 = 今日复习规模
今日已复习 = 今日 daily_task 数量
今日剩余 = 当前待复习队列剩余
今日新学 = 今日 daily_task 中 state_before 为 new 的数量
```

记忆健康：

```text
逾期词卡 = due_at 早于当前时间且未 release 的词卡
困难词卡 = reinforce / downgrade
Again率 = 近 30 天 daily_task 中 rating=again 的比例
近期保持率 = 100% - Again率
```

阶段分布：

```text
按当前 UserMemoryState 分组
```

薄弱场景：

```text
按困难、逾期、待复习、Again率综合排序
```

## 11. 图谱数据流

图谱节点来自：

```text
词卡
场景
来源
标签
词族
易混词
同义词
链接
```

关系焦点只决定“看哪些关系”，不修改词卡数据。

图谱弹层只读，不写入 ReviewEvent。

图谱筛选：

```text
词频
记忆状态
场景范围
关系焦点
```

筛选结果应同步更新：

```text
显示词卡数
节点数
关系数
图谱渲染结果
```

## 12. 设置页数据流

学习规则：

```text
写入 LearningPlan
影响今日队列和学习按钮行为
不清空当前数据
```

词卡与备份：

```text
导入前校验
导入成功后写入 AppData
导入失败不破坏当前数据
导入前生成可回滚快照
```

个人资料：

```text
只影响展示昵称和头像
不影响词卡和记忆状态
```

高级清空：

```text
必须确认
清空 IndexedDB/localStorage 中本应用数据
```

## 13. PC 与移动端一致性

同一数据和同一操作，在 PC 与手机端必须得到同一状态变化。

必须一致的行为：

```text
点击词卡行后，该词卡进入今日待复习。
browser_detail 不增加今日已复习。
daily_task 增加今日已复习。
统计页 Again率只看 daily_task。
单词本状态数字与词卡行状态一致。
图谱筛选结果与统计数字不互相污染。
```

## 14. 禁止回退清单

```text
PC 点击单词列表加入待复习，但今日页不显示。
手机和 PC 同一操作产生不同 ReviewEvent。
browser_detail 被纳入今日已复习。
browser_detail 被纳入 Again率。
正式评分不记录 scheduler_version。
FSRS 原始输出和产品适配状态混为一个字段。
普通未学习词卡自动进入今日页。
```

