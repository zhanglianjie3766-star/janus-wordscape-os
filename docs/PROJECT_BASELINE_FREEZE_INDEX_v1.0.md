# 项目横截面冻结基线总览 v1.0

本文档定义“雅努斯词境 OS”0~1 阶段的横向冻结基线。当前场景应用为“雅努斯词境 OS · 技术英语词汇网络”，TechLex OS 仅作为历史开发代号保留。

它回答一个问题：

```text
如果后续 1~3 阶段开发失败、不顺利或方向漂移，哪些 0~1 成功态必须仍然稳定可用？
```

本文档不是 UI 总入口，也不是单个功能说明。

它是整个项目从 0 到 1 的“横截面描述”。

## 1. 冻结基线的意义

0~1 阶段的成功不是某一个页面好看，也不是某个算法能跑。

0~1 成功态必须同时包含：

```text
产品边界清楚
数据模型稳定
真实词卡可生产
导入格式可验证
学习算法可审计
本地存储可恢复
五页 UI 可使用
图谱价值可解释
回归验收可重复
```

这些维度共同构成项目的最低稳定版本。

## 2. 横向冻结维度

当前建议冻结 10 个维度：

```text
1. 产品定位与边界
2. 词卡制作标准
3. 导入格式与 Schema
4. 数据模型
5. 记忆算法逻辑
6. 页面 UI 与组件体验
7. 图谱价值与交互
8. 本地存储与备份恢复
9. 回归测试与验收
10. 第三方算法与版权治理
```

这些维度应横向成套维护。

## 3. 维度 1：产品定位与边界

冻结目标：

```text
雅努斯词境 OS 是个人场景英语自动学习运行时。
雅努斯词境 OS · 技术英语词汇网络是当前技术英语场景应用。
TechLex OS 是技术英语词汇网络的历史开发代号。
系统不是单纯词典，不是制卡后台，也不是图谱玩具。
```

基线文档：

```text
PROJECT_STATE.md
docs/TECHLEX_OS_CONSTITUTION_v1.2.md
docs/MAINLINE_INTERFACE_PROTOCOL.md
docs/NAMING_CONVENTION_FREEZE_v1.0.md
```

必须保持：

```text
客户端负责导入、学习计划、每日任务、FSRS 复习、ReviewEvent、UserMemoryState、图谱和备份。
Codex 工作区负责来源研究、候选生成、词卡加工、质量评审和结构化导出。
```

## 4. 维度 2：词卡制作标准

冻结目标：

```text
真实词卡必须能学习、能读音、能溯源、能进图谱、能被 FSRS 复习。
```

基线文档：

```text
docs/WORD_CARD_PRODUCTION_FREEZE_v1.0.md
docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md
```

不得退化为：

```text
单词 + 中文释义
无来源
无二级场景
无例句
无图谱关系
```

## 5. 维度 3：导入格式与 Schema

冻结目标：

```text
真实词卡包可以稳定导入，不破坏现有数据。
```

基线文档：

```text
docs/IMPORT_FORMAT.md
schemas/standard-word-card-package.schema.json
examples/standard-word-card-package.example.json
examples/standard-word-card-package.example.csv
```

必须保持：

```text
JSON 为首选格式。
CSV/TSV 为兼容格式。
导入前校验。
导入失败不破坏当前数据。
导入前保留快照。
```

## 6. 维度 4：数据模型

冻结目标：

```text
词卡内容、用户复习事件和记忆状态分离。
```

基线文档：

```text
docs/DATA_MODEL.md
docs/DATA_FLOW_FREEZE_v1.0.md
src/types.ts
```

必须保持：

```text
WordCard 不存用户记忆状态。
ReviewEvent 记录每次动作。
UserMemoryState 记录当前用户当前记忆状态。
LearningPlan 记录学习规则。
```

## 7. 维度 5：记忆算法逻辑

冻结目标：

```text
FSRS 正式复习、产品 Adapter、今日队列和统计口径可审计、可回归。
```

基线文档：

```text
docs/MEMORY_ALGORITHM_FREEZE_v1.0.md
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
scripts/fsrs-golden-test.mjs
src/fsrsEngine.ts
src/scheduler.ts
```

必须保持：

```text
ts-fsrs 5.4.0 精确锁定。
scheduler_version 写入 ReviewEvent。
fsrs_raw_state_after 与 state_after 分离。
browser_detail 与 daily_task 分离。
```

## 8. 维度 6：页面 UI 与组件体验

冻结目标：

```text
五个底栏页面可复刻到 90% - 95%。
```

基线文档：

```text
docs/UI_FREEZE_INDEX_v1.0.md
docs/DESIGN_TOKENS_FREEZE_v1.0.md
docs/COMPONENTS_FREEZE_v1.0.md
docs/TODAY_PAGE_INTERACTION_FREEZE_v1.0.md
docs/NOTEBOOK_INTERACTION_FREEZE_v1.0.md
docs/STATS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/GALAXY_INTERACTION_FREEZE_v1.0.md
docs/SETTINGS_PAGE_INTERACTION_FREEZE_v1.0.md
```

必须保持：

```text
今日只做待复习。
单词本以二级场景为入口。
统计只保留最小必要指标。
图谱保持 Obsidian 式低噪声关系诊断。
设置作为系统控制台。
```

## 9. 维度 7：图谱价值与交互

冻结目标：

```text
图谱回答：这个词为什么记不住，应从哪个场景、关系或来源重新想起？
```

基线文档：

```text
docs/GALAXY_INTERACTION_FREEZE_v1.0.md
docs/GRAPH_EXPERIENCE_CONSTITUTION.md
docs/OBSIDIAN_GRAPH_REFERENCE_SPEC.md
docs/GRAPH_REGRESSION_CHECKLIST.md
docs/adr/ADR-graph-renderer.md
```

必须保持：

```text
第一次触碰只高亮。
第二次点击才打开详情。
可拖动画面。
可拖动节点。
可缩放。
左上图谱图标刷新/清除选中。
默认关系焦点为全景。
```

## 10. 维度 8：本地存储与备份恢复

冻结目标：

```text
0~1 阶段即使没有云同步，也必须本地稳定可用。
```

基线文档：

```text
docs/PERSISTENCE_AND_PACKAGING.md
docs/PHASE9_INDEXEDDB_MIGRATION_AND_RECOVERY_VALIDATION.md
src/storage.ts
src/storageBudget.ts
```

必须保持：

```text
IndexedDB 为主存储。
localStorage shadow 作为恢复线索。
导入前快照。
支持导出备份。
支持恢复备份。
测试不得清空用户真实 IndexedDB/localStorage。
```

## 11. 维度 9：回归测试与验收

冻结目标：

```text
每次改动都能证明没有破坏 0~1 成功态。
```

基线文档：

```text
docs/UI_REGRESSION_SCRIPT_FREEZE_v1.0.md
docs/PHASE11_REAL_USE_UI_REGRESSION_VALIDATION.md
docs/GRAPH_REGRESSION_CHECKLIST.md
```

最低命令：

```bash
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run test:fsrs-golden
```

必要时执行：

```bash
corepack pnpm run smoke:phase11
```

## 12. 维度 10：第三方算法与版权治理

冻结目标：

```text
第三方算法依赖可审计、版权合规、责任边界清楚。
```

基线文档：

```text
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
docs/MEMORY_ALGORITHM_FREEZE_v1.0.md
package.json
```

必须保持：

```text
版本锁定。
许可证保留。
golden test。
原始算法输出和产品输出分离。
```

## 13. 0~1 最小可用基线

如果后续 1~3 阶段开发失败，必须能回到以下状态：

```text
本地打开应用。
导入真实词卡包。
查看单词本二级场景。
进入场景子页学习和浏览。
点击词卡进入今日待复习。
今日页正式复习并写入 FSRS。
统计页显示最小必要指标。
图谱页显示关系并可交互。
设置页可导入、备份、调整学习规则。
所有数据保存在本地且可导出。
```

这就是 0~1 成功态。

## 14. 不建议立即冻结但需要候选池的维度

以下维度暂不作为 0~1 冻结基线，但应进入后续候选：

```text
远程同步协议
多设备冲突合并
用户账户体系
云端制卡流水线
付费或商业化权限
多语言扩展
团队共享词卡包市场
AI 自动制卡 Agent
```

原因：

```text
它们属于 1~3 阶段扩展。
不应污染 0~1 的本地稳定成功态。
```

## 15. 冻结文档维护规则

新增规则时先判断归属：

```text
产品边界 -> constitution / PROJECT_STATE
词卡质量 -> WORD_CARD_PRODUCTION_FREEZE
算法队列 -> MEMORY_ALGORITHM_FREEZE / DATA_FLOW_FREEZE
页面体验 -> UI_FREEZE_INDEX 体系
存储恢复 -> PERSISTENCE_AND_PACKAGING
第三方依赖 -> THIRD_PARTY_ALGORITHM_GOVERNANCE
```

不得把所有规则塞进一个大文档。

不得把 UI 细节写入算法冻结文档。

不得把算法统计口径写进词卡生产标准。

## 16. 当前横截面冻结清单

```text
docs/PROJECT_BASELINE_FREEZE_INDEX_v1.0.md
docs/NAMING_CONVENTION_FREEZE_v1.0.md
docs/WORD_CARD_PRODUCTION_FREEZE_v1.0.md
docs/MEMORY_ALGORITHM_FREEZE_v1.0.md
docs/UI_FREEZE_INDEX_v1.0.md
docs/DATA_FLOW_FREEZE_v1.0.md
docs/DESIGN_TOKENS_FREEZE_v1.0.md
docs/COMPONENTS_FREEZE_v1.0.md
docs/UI_REGRESSION_SCRIPT_FREEZE_v1.0.md
docs/TODAY_PAGE_INTERACTION_FREEZE_v1.0.md
docs/NOTEBOOK_INTERACTION_FREEZE_v1.0.md
docs/STATS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/GALAXY_INTERACTION_FREEZE_v1.0.md
docs/SETTINGS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
docs/IMPORT_FORMAT.md
docs/DATA_MODEL.md
docs/PERSISTENCE_AND_PACKAGING.md
```

这些文档共同描述 0~1 阶段的稳定横截面。
