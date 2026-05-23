# 记忆算法逻辑冻结文档 v1.0

本文档冻结“雅努斯词境 OS / TechLex OS”当前 0~1 阶段的完整记忆算法逻辑。

它说明 FSRS、产品规则、队列规则、统计规则之间的边界。

对应关系：

```text
算法治理：docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
数据流：docs/DATA_FLOW_FREEZE_v1.0.md
数据模型：docs/DATA_MODEL.md
实现入口：src/fsrsEngine.ts, src/scheduler.ts
FSRS golden test：scripts/fsrs-golden-test.mjs
```

## 1. 算法总体定位

本系统不是简单背单词表。

当前算法体系由三层组成：

```text
FSRS 调度层
产品 Adapter / Queue Layer
统计与诊断层
```

三层必须分开：

```text
FSRS 调度层负责正式记忆评分后的间隔计算。
产品 Adapter 负责把“浏览即不认识”等产品信号接入队列。
统计与诊断层负责解释学习状态和薄弱点。
```

不得把产品规则伪装成 FSRS 原始输出。

## 2. 第三方依赖冻结

当前 FSRS 实现依赖：

```text
package: ts-fsrs
version: 5.4.0
license: MIT
```

硬性要求：

```text
package.json 必须锁死精确版本 "ts-fsrs": "5.4.0"。
ReviewEvent 必须记录 scheduler = ts-fsrs。
ReviewEvent 必须记录 scheduler_version = 5.4.0。
必须保留 FSRS golden test。
```

不得：

```text
手写替代 FSRS 核心公式。
静默升级 ts-fsrs。
把产品 Adapter 逻辑写进 FSRS 原始算法层。
```

## 3. 评分输入冻结

正式 FSRS 评分只有四个输入：

```text
again = 忘记
hard = 困难
good = 良好
easy = 简单
```

UI 显示：

```text
1 忘记
2 困难
3 良好
4 简单
```

这些按钮只在“显示答案”后出现。

点击任一评分按钮，写入：

```text
review_mode = daily_task
rating = again | hard | good | easy
```

## 4. ReviewEvent 审计冻结

每次记忆相关写入都必须产生 ReviewEvent。

字段冻结：

```text
review_event_id
card_id
reviewed_at
rating
response_time_ms
review_mode
scheduler
scheduler_version
state_before
fsrs_raw_state_after
state_after
```

核心边界：

```text
fsrs_raw_state_after = ts-fsrs 原始输出。
state_after = 产品规则适配后的最终状态。
```

## 5. FSRS 原始输出冻结

FSRS 原始输出由 `ts-fsrs` 产生。

当前实现通过：

```text
fsrs(generatorParameters({ request_retention }))
scheduler.next(fsrsCard, reviewedAt, rating)
```

生成原始下一状态。

原始输出必须保存在：

```text
fsrs_raw_state_after
```

它用于：

```text
算法审计
版本回归
版权和责任边界确认
golden test 对照
```

不得被产品规则覆盖。

## 6. 产品适配输出冻结

产品适配后的最终状态保存在：

```text
state_after
```

当前产品适配包含：

```text
again -> downgrade
hard -> reinforce
easy 且 reps >= 3 且 scheduled_days >= 21 -> release
maximum_interval_days 上限裁剪
again 按 relearning_interval_minutes 设定重学间隔
browser_detail + again -> due，并立即进入今日待复习
```

这些规则属于产品层，不属于 FSRS 原始算法公式。

## 7. 记忆阶段冻结

系统内部阶段：

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

页面分组：

```text
未学习 = new 或无状态
学习中 = learning / reinforce / downgrade
待复习 = reviewing / due / overdue
已掌握 = release
```

不得把 `learning` 显示成 `复习中`。

## 8. 今日队列冻结

今日页队列来自：

```text
getReviewStageQueue(data, now)
```

允许进入今日页：

```text
reviewing
due
overdue
browser_detail + again 后被产品 Adapter 标记为 due 的词卡
```

不得直接进入今日页：

```text
普通 new
普通 learning
普通 reinforce
普通 downgrade
release
```

每日复习上限：

```text
常规到期词卡受 daily_review_limit 限制。
browser_detail + again 的手动待复习词卡优先进入今日队列。
```

## 9. 浏览触发式遗忘标记冻结

这是用户自定义的产品算法/方法。

名称建议：

```text
浏览触发式遗忘标记
或
Recognition Failure Capture
```

规则：

```text
点击单词列表词卡主体 = 用户不认识这个词。
写入 review_mode = browser_detail。
写入 rating = again。
通过 Adapter 把 state_after 标记为 due。
进入今日待复习队列。
```

边界：

```text
它不是 FSRS 正式回忆复习。
它不计入今日已复习。
它不计入 Again率。
它不替代显示答案后的四个 FSRS 评分按钮。
```

协同关系：

```text
浏览触发式遗忘标记负责发现陌生词。
今日页正式复习负责让用户回忆并输入 FSRS 评分。
FSRS 根据正式评分更新长期复习间隔。
```

## 10. 新词学习冻结

新词学习入口：

```text
单词本 -> 二级场景子页 -> 开始学习
```

新词学习不得跳转到底栏今日页。

新词学习写入：

```text
review_mode = daily_task
```

默认筛选：

```text
未学习
```

但用户可以在子页选择：

```text
全部
未学习
学习中
待复习
已掌握
```

学习范围必须限定在当前子页和当前筛选结果中。

## 11. 学习规则参数冻结

当前 LearningPlan 参数：

```text
daily_new_limit
daily_review_limit
daily_weak_limit
target_retention
maximum_interval_days
relearning_interval_minutes
leech_lapse_threshold
review_sort_order
prioritize_overdue
review_weak_items
pause_new_cards
```

含义：

```text
daily_new_limit = 每天新学上限
daily_review_limit = 每天常规复习上限
daily_weak_limit = 每天弱项巩固上限
target_retention = FSRS 目标保持率
maximum_interval_days = 最大复习间隔
relearning_interval_minutes = 遗忘后重学间隔
leech_lapse_threshold = 难点阈值
review_sort_order = 复习排序策略
prioritize_overdue = 逾期优先
review_weak_items = 是否复习弱项
pause_new_cards = 暂停新卡
```

## 12. 统计口径冻结

正式学习统计：

```text
只统计 daily_task。
```

陌生词信号：

```text
记录 browser_detail。
可进入今日待复习。
不算正式已复习。
不算 Again率。
```

Again率：

```text
近 30 天 daily_task 中 rating=again 的比例。
```

近期保持率：

```text
100% - Again率。
```

今日已复习：

```text
今日 daily_task 中完成的正式到期复习。
```

## 13. Golden Test 冻结

必须保留：

```text
corepack pnpm run test:fsrs-golden
```

golden test 验证：

```text
ts-fsrs 版本为 5.4.0。
固定时间、固定初始卡、固定 rating 下的原始 FSRS 输出不漂移。
```

golden test 验证的是：

```text
fsrs_raw_state_after
```

不是：

```text
state_after
产品 Adapter 输出
UI 队列结果
```

## 14. 禁止回退清单

```text
升级 ts-fsrs 但不更新 golden test 和治理说明。
ReviewEvent 不记录 scheduler_version。
把 browser_detail 写成 daily_task。
把 browser_detail 纳入今日已复习。
把 browser_detail 纳入 Again率。
删除 fsrs_raw_state_after。
只保存 state_after。
普通 new 自动进入今日页。
单词本开始学习跳转到底栏今日页。
把学习中显示成复习中。
```

## 15. 验收清单

每次改算法、队列或统计后至少执行：

```bash
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run test:fsrs-golden
```

并验证：

```text
点击词卡列表 -> browser_detail + again -> 今日待复习增加。
今日待复习增加不等于今日已复习增加。
今日页正式评分 -> daily_task -> 今日已复习增加。
统计 Again率只受 daily_task 影响。
ReviewEvent 同时有 fsrs_raw_state_after 和 state_after。
ReviewEvent 有 scheduler = ts-fsrs 和 scheduler_version = 5.4.0。
```

