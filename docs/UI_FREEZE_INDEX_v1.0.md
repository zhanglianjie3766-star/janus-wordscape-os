# UI 冻结文档总入口 v1.0

本文档是“雅努斯词境 OS / TechLex OS”前端 UI 冻结规格的总入口。

如果把本项目交给新的 AI、开发者或从 0 重新实现前端，必须先阅读本文档，再按本文档指定的顺序阅读其他冻结文档。

本文档的作用不是重复各页面细节，而是说明：

```text
这些文档是一套整体规格。
每份文档负责什么。
发生冲突时听谁的。
从 0 复刻时按什么顺序执行。
如何验收是否真正复现当前效果。
```

## 1. 文档组定位

本组文档共同冻结当前五个底栏页面的产品体验：

```text
今日
单词本
统计
图谱
设置
```

以及支撑这些页面一致复刻的四类资产：

```text
设计 Tokens
组件规格
数据流
UI 回归脚本
```

整体目标：

```text
从 0 重新实现时，复现当前前端 UI、核心交互和数据联动效果的 90% - 95%。
```

本组文档是产品级和工程级冻结规格，不是一次性开发计划。

## 2. 必须成套读取

不得只读取某一个页面冻结文档就开始实现。

原因：

```text
页面冻结文档描述页面目标和交互。
Design Tokens 描述颜色、字号、间距和视觉尺度。
Components 描述跨页面复用组件。
Data Flow 描述 FSRS、ReviewEvent 和页面联动。
Regression 描述验收脚本和禁止回退项。
```

如果只读页面文档，容易做出“看起来像，但状态错”的 UI。

如果只读数据流文档，容易做出“逻辑对，但体验不像”的 UI。

## 3. 推荐读取顺序

从 0 复刻时，严格建议按以下顺序读取：

```text
1. docs/UI_FREEZE_INDEX_v1.0.md
2. docs/DESIGN_TOKENS_FREEZE_v1.0.md
3. docs/COMPONENTS_FREEZE_v1.0.md
4. docs/DATA_FLOW_FREEZE_v1.0.md
5. docs/TODAY_PAGE_INTERACTION_FREEZE_v1.0.md
6. docs/NOTEBOOK_INTERACTION_FREEZE_v1.0.md
7. docs/STATS_PAGE_INTERACTION_FREEZE_v1.0.md
8. docs/GALAXY_INTERACTION_FREEZE_v1.0.md
9. docs/SETTINGS_PAGE_INTERACTION_FREEZE_v1.0.md
10. docs/UI_REGRESSION_SCRIPT_FREEZE_v1.0.md
```

理由：

```text
先建立视觉语言。
再建立组件语言。
再锁定数据语义。
再实现各页面。
最后用回归脚本验收。
```

## 4. 文档职责分工

### 4.1 页面冻结文档

页面冻结文档负责回答：

```text
这个页面是什么？
这个页面不是什么？
用户在这里做什么？
页面上应该出现哪些区域？
哪些交互必须保留？
哪些旧设计不得回退？
```

对应文件：

```text
docs/TODAY_PAGE_INTERACTION_FREEZE_v1.0.md
docs/NOTEBOOK_INTERACTION_FREEZE_v1.0.md
docs/STATS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/GALAXY_INTERACTION_FREEZE_v1.0.md
docs/SETTINGS_PAGE_INTERACTION_FREEZE_v1.0.md
```

### 4.2 Design Tokens

Design Tokens 负责回答：

```text
主色是什么？
灰阶如何使用？
状态色如何克制？
字号、间距、圆角、阴影如何统一？
移动端断点如何验收？
```

对应文件：

```text
docs/DESIGN_TOKENS_FREEZE_v1.0.md
```

### 4.3 Components

组件规格负责回答：

```text
底栏如何复刻？
状态筛选条如何复刻？
二级场景卡片如何复刻？
词卡行如何复刻？
内联学习卡如何复刻？
FSRS 评分按钮如何复刻？
图谱控制按钮如何复刻？
```

对应文件：

```text
docs/COMPONENTS_FREEZE_v1.0.md
```

### 4.4 Data Flow

数据流文档负责回答：

```text
WordCard 字段如何服务学习和图谱？
未学习、学习中、待复习、已掌握如何分组？
daily_task 和 browser_detail 如何区分？
FSRS 原始输出和产品适配状态如何区分？
今日、单词本、统计、图谱、设置如何联动？
```

对应文件：

```text
docs/DATA_FLOW_FREEZE_v1.0.md
```

### 4.5 UI Regression

UI 回归脚本文档负责回答：

```text
要测哪些页面？
要测哪些屏幕尺寸？
哪些交互必须自动化验收？
哪些数据链路必须验收？
哪些行为属于禁止回退？
```

对应文件：

```text
docs/UI_REGRESSION_SCRIPT_FREEZE_v1.0.md
```

## 5. 冲突处理规则

如果文档之间出现表述冲突，按以下规则处理。

### 5.1 数据语义冲突

数据语义优先级：

```text
DATA_FLOW_FREEZE > 页面冻结文档 > COMPONENTS_FREEZE > UI_REGRESSION_SCRIPT_FREEZE
```

例如：

```text
如果某页面文档说“今日已复习”，但没有说明是否包含 browser_detail，
必须以 DATA_FLOW_FREEZE 为准：
今日已复习只统计 daily_task，不统计 browser_detail。
```

### 5.2 视觉样式冲突

视觉样式优先级：

```text
DESIGN_TOKENS_FREEZE > COMPONENTS_FREEZE > 页面冻结文档
```

例如：

```text
如果某页面文档提到按钮是红色，
但没有说明具体红色，
必须以 DESIGN_TOKENS_FREEZE 的 brand #d11b3d 为准。
```

### 5.3 组件结构冲突

组件结构优先级：

```text
COMPONENTS_FREEZE > 页面冻结文档中的零散组件描述
```

例如：

```text
如果页面文档要求“词卡列表显示状态”，
具体状态 badge 如何显示，应以 COMPONENTS_FREEZE 为准。
```

### 5.4 验收冲突

验收优先级：

```text
UI_REGRESSION_SCRIPT_FREEZE > 单次人工观察
```

人工截图可以发现问题，但不能替代回归脚本的关键断言。

## 6. 五页关系总览

五个页面不是孤立页面。

它们的关系如下：

```text
设置
  -> 学习规则影响 今日队列 和 单词本内联学习
  -> 词卡导入影响 单词本 / 今日 / 统计 / 图谱

单词本
  -> 组织词卡
  -> 点击词卡写入 browser_detail + again
  -> 进入 今日待复习
  -> 内联学习评分写入 daily_task

今日
  -> 只处理待复习队列
  -> 正式评分写入 daily_task
  -> 影响统计

统计
  -> 读取 daily_task 和 UserMemoryState
  -> 不把 browser_detail 当正式复习

图谱
  -> 读取词卡关系字段
  -> 帮助诊断为什么记不住
  -> 不直接写 ReviewEvent
```

## 7. 核心产品规则

以下规则是跨页面核心规则，任何实现都不得破坏。

### 7.1 今日页规则

```text
今日页是全局待复习入口。
今日页不混入普通未学习新词。
今日页正式评分写入 daily_task。
今日已复习只统计 daily_task。
```

### 7.2 单词本规则

```text
单词本主页面默认展示二级场景文件夹。
全部 tab 展示跨领域二级场景文件夹，不展示平铺词卡列表。
点击场景卡片整张进入子页。
子页顶部只保留状态筛选，不再保留学习模式/浏览模式大选项。
```

### 7.3 点击词卡规则

```text
点击单词列表词卡主体 = 不认识。
写入 browser_detail + again。
加入今日待复习。
不得伪装成 daily_task。
```

### 7.4 FSRS 规则

```text
显示答案后的 忘记 / 困难 / 良好 / 简单 是 FSRS 正式评分入口。
正式评分写入 daily_task。
ReviewEvent 必须记录 scheduler 和 scheduler_version。
必须区分 fsrs_raw_state_after 和 state_after。
```

### 7.5 图谱规则

```text
图谱回答：这个词为什么记不住，应从哪个场景、关系或来源重新想起？
第一次触碰节点只高亮。
第二次点击同一节点才打开详情。
左上图谱图标承担刷新和清除选中。
图谱设置默认关系焦点为全景。
```

## 8. 实现顺序建议

如果从 0 开始实现，建议顺序：

```text
1. 搭建 AppData / WordCard / ReviewEvent / UserMemoryState 基础类型。
2. 实现 DESIGN_TOKENS 对应的主题变量。
3. 实现底栏导航和基础卡片组件。
4. 实现 Settings 导入和学习规则。
5. 实现 Notebook 主页面和场景子页。
6. 实现 browser_detail + again 产品规则。
7. 实现 Today 队列和 daily_task 正式评分。
8. 实现 Stats 数据口径。
9. 实现 Galaxy 图谱和交互。
10. 跑 UI_REGRESSION_SCRIPT 中的验收矩阵。
```

不要先做图谱，再补数据语义。图谱依赖词卡字段和记忆状态。

不要先做视觉，再补 `daily_task/browser_detail` 边界。否则后期容易出现统计口径错乱。

## 9. 复刻验收目标

最低验收：

```text
五个底栏页面都可用。
移动端不横向溢出。
今日、单词本、统计、图谱、设置核心交互均通过。
browser_detail 与 daily_task 统计边界正确。
```

目标验收：

```text
达到当前 UI 体验 90% - 95% 复现。
华为 Mate70、常见安卓 WebView、桌面浏览器均协调。
图谱交互手感接近当前冻结体验。
```

## 10. 交付给 AI 的推荐提示

如果把本组文档交给新的 AI，建议使用以下提示：

```text
你正在从 0 复刻“雅努斯词境 OS / TechLex OS”的前端 UI。

请先阅读 docs/UI_FREEZE_INDEX_v1.0.md。
它是冻结文档总入口。

然后严格按总入口中的读取顺序，读取所有页面冻结文档、Design Tokens、组件规格、数据流和 UI 回归脚本文档。

实现时必须遵守：
1. 页面冻结文档定义页面目标和交互。
2. DESIGN_TOKENS_FREEZE 定义视觉变量。
3. COMPONENTS_FREEZE 定义组件结构。
4. DATA_FLOW_FREEZE 定义 ReviewEvent、FSRS、browser_detail/daily_task 和跨页面联动。
5. UI_REGRESSION_SCRIPT_FREEZE 定义验收标准。

不得只读取单个页面文档就开始实现。
不得把 browser_detail 伪装成 daily_task。
不得破坏当前五底栏页面的冻结体验。
```

## 11. 维护规则

新增或修改冻结规则时：

```text
先判断属于页面、tokens、组件、数据流还是回归脚本。
不要把所有规则塞进页面文档。
不要把 UI 细节写入数据流文档。
不要把数据口径写成视觉建议。
```

如果规则影响多个页面，应优先写入：

```text
DATA_FLOW_FREEZE
COMPONENTS_FREEZE
DESIGN_TOKENS_FREEZE
```

然后再在页面冻结文档中引用或补充具体落点。

## 12. 当前冻结文档清单

```text
docs/UI_FREEZE_INDEX_v1.0.md
docs/DESIGN_TOKENS_FREEZE_v1.0.md
docs/COMPONENTS_FREEZE_v1.0.md
docs/DATA_FLOW_FREEZE_v1.0.md
docs/TODAY_PAGE_INTERACTION_FREEZE_v1.0.md
docs/NOTEBOOK_INTERACTION_FREEZE_v1.0.md
docs/STATS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/GALAXY_INTERACTION_FREEZE_v1.0.md
docs/SETTINGS_PAGE_INTERACTION_FREEZE_v1.0.md
docs/UI_REGRESSION_SCRIPT_FREEZE_v1.0.md
```

这 10 份文档应作为一个整体版本看待。

