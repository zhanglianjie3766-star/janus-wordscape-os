# 第三方算法依赖治理

状态：宪法级候选治理文档

本文档定义雅努斯词境 OS / TechLex OS 对第三方算法依赖和版权合规的治理规则。本文档是 `docs/TECHLEX_OS_CONSTITUTION_v1.2.md` 的治理扩展，不是 UI 规范，也不是阶段验收报告。

## 1. 文档归属裁决

本规则不应只写入 `docs/MAINLINE_INTERFACE_PROTOCOL.md`。

主线接口协议负责接手规则、阶段纪律和上下文恢复，不适合承载详细算法审计和版权合规规则。

本规则也不应完整塞入 `docs/TECHLEX_OS_CONSTITUTION_v1.2.md`。

宪法正文只应保留最高层原则：第三方算法必须 Adapter 隔离、版本锁定、可审计、版权合规，并且不得与产品规则混淆。

因此，详细规则归属本独立治理文档：

```text
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
```

宪法正文只引用本文档作为宪法级候选治理扩展。

## 2. 适用范围

凡是会影响学习状态、调度结果、队列生成、统计指标、图谱含义或用户可见推荐的外部算法依赖，都适用本文档。

当前纳入治理的依赖：

```text
FSRS / ts-fsrs
```

未来可能纳入治理的依赖包括：

```text
embedding model
ranking model
recommendation model
semantic clustering algorithm
graph layout algorithm if it changes graph meaning rather than only rendering
```

## 3. 核心规则

第三方算法可以作为引擎使用，但产品边界必须由雅努斯词境 OS 自己掌握。

系统必须始终区分：

```text
第三方算法原始输出
产品 Adapter 输出
队列规则
统计规则
UI 呈现
```

任何产品规则都不得被描述、存储或统计成第三方算法原始输出。

## 4. FSRS / ts-fsrs 治理

FSRS 是本产品采用的记忆调度思想。`ts-fsrs` 是当前本地实现所使用的第三方库。

硬性要求：

```text
依赖版本必须锁定为精确版本
ReviewEvent 必须记录 scheduler
ReviewEvent 必须记录 scheduler_version
必须用 golden test 验证固定输入下的原始调度输出
第三方算法原始输出必须与产品适配后的最终状态分开保存
必须保留版权和许可证声明
```

当前要求记录：

```text
scheduler = ts-fsrs
scheduler_version = 5.4.0
```

## 5. 原始输出与产品输出

SchedulerAdapter 必须保留两层输出：

```text
fsrs_raw_state_after
state_after
```

含义：

```text
fsrs_raw_state_after = ts-fsrs 对本次评分返回的原始输出
state_after = 经过雅努斯词境 OS 产品规则适配后的最终状态
```

原始输出用于算法审计、版本回归和责任边界确认。

产品输出用于用户体验、队列策略、统计策略和跨页面联动。

## 6. 产品规则：浏览即不认识

雅努斯词境 OS 保留以下产品规则：

```text
点击单词列表中的词卡
= 用户不认识这个词
= review_mode browser_detail
= rating again
= 加入今日待复习队列
```

该规则不是正式每日复习。

它不得被写成：

```text
review_mode = daily_task
```

它也不得被描述成：

```text
FSRS 原始调度结果
```

它是产品 Adapter / Queue Layer 规则，用于让用户快速把陌生词重新压回复习队列，但不能伪装成一次完整回忆复习。

## 7. 统计边界

正式复习统计必须区分 `daily_task` 和 `browser_detail`。

规则：

```text
daily_task 计入正式学习/复习执行
browser_detail 记录陌生词信号
browser_detail 可以加入今日待复习队列
browser_detail 不能计入今日正式已复习
smoke_test 不能影响真实学习统计
```

## 8. 版权与许可证合规

每一个第三方算法依赖都必须保留：

```text
package name
package version
license
copyright notice when provided
source repository or package source when available
```

产品不得复制、改写或重新包装第三方算法公式，并声称这是自己的原创算法。

如果第三方许可证要求在分发产物中署名或保留声明，正式打包发布前必须补齐对应声明。

## 9. 回归门禁

任何会影响调度依赖、版本、Adapter 映射、ReviewEvent schema、队列策略或统计策略的变更，都必须通过：

```text
typecheck
build
FSRS golden test
Phase 11 real-use UI regression smoke or equivalent non-destructive regression
```

golden test 必须验证第三方算法原始输出，而不是产品适配后的输出。

产品回归测试必须验证 Adapter 行为，尤其是：

```text
browser_detail + again 会进入今日待复习队列
browser_detail 不计入正式已复习
daily_task 仍是正式 FSRS 复习执行路径
```

## 10. 非目标

本文档不定义：

```text
UI 布局
按钮文案
图谱视觉风格
具体页面交互细节
手工制卡流程
云同步实现
```

以上内容归属 UI 规范、阶段验收文档或 Adapter 实现记录。
