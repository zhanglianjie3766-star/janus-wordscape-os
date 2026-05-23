# ADR: Graph Renderer Architecture

## Status

Accepted.

## Context

我的词境 OS 的图谱经历过多轮调整。早期实现容易出现以下问题：

```text
彩色环形图
默认噪声过高
节点拖动僵硬
邻居不跟随
释放不回弹
释放后颜色不恢复
手机端无法缩放或图谱过小
点击节点看不到词卡内容
```

用户最终明确要求对齐 Obsidian-like 图谱体验：

```text
灰阶清爽
低噪声全局视图
选中节点临时红色高亮
相关边和邻居增强
背景淡化
拖动有弹簧、惯性、阻尼、自然回弹
点击节点可查看详情
```

因此需要把图谱技术路线固化，防止未来回退到静态 SVG 或装饰性动画。

## Decision

图谱渲染采用：

```text
Canvas renderer
+ d3-force physics simulation
+ isolated GraphRenderer component
+ domain data -> graph view model -> renderer
```

当前主要实现文件：

```text
src/components/InteractiveGalaxyGraph.tsx
src/views/GalaxyView.tsx
src/wordGalaxy.ts
```

## Architecture

图谱分为三层：

```text
Graph Data Model
-> Graph View Model
-> Graph Renderer
```

### Graph Data Model

来源于应用核心数据：

```text
WordCard
DomainPack
UserMemoryState
ReviewEvent
source
tags
links
synonyms
confusing_words
word_family
```

该层不得依赖 Canvas、DOM、React 或 d3。

### Graph View Model

将学习数据转为：

```text
GraphNode
GraphEdge
degree
node_type
relationship_type
display_label
related_cards
```

该层可以做筛选、抽样、渲染上限和局部图谱构建。

### Graph Renderer

只负责绘制和交互：

```text
Canvas drawing
d3-force simulation
zoom
pan
drag
pinch
fit view
selection
hover
detail overlay
```

Graph Renderer 不得修改 WordCard、UserMemoryState 或 ReviewEvent。

## Required Physics

图谱必须使用真实力导向模拟。至少包含：

```text
forceLink
forceManyBody
forceCollide
forceCenter
forceX
forceY
alphaTarget during drag
velocity decay
release settling
```

拖动节点时：

```text
拖动节点成为临时交互目标
直接邻居通过 link spring 被牵引
二跳邻居可轻微受影响
无关背景节点保持空间稳定
释放后取消临时高亮
释放后 simulation 继续自然衰减
```

## Required Interaction States

### Idle

```text
灰阶
低透明边
低噪声节点
默认隐藏标签
全局结构可见
```

### Hover / Pointer Down

```text
识别目标节点
准备高亮邻域
不永久改变颜色
```

### Drag

```text
焦点节点红色
直接边红色或深色
直接邻居深灰
背景淡化
邻居跟随移动
```

### Release

```text
清除临时高亮
回到灰阶
保留详情面板
保留用户视口
simulation 自然冷却
```

### Click

```text
打开详情
卡片节点显示单词
Hub / 标签 / 来源 / 场景节点显示相关词
详情可关闭
```

## Mobile Requirements

移动端渲染必须显式支持：

```text
touch pointer events
single-finger node drag
single-finger pan when not on node
two-finger pinch zoom
larger invisible hit target
fit-to-view after initial layout
bottom navigation safe area
```

移动端不能只依赖桌面鼠标事件。

## Viewport Rules

默认视图应为“全局可读”，而不是“极度缩小”或“局部裁切”。

fit view 策略：

```text
以主要节点云为目标，而不是被极端离群点支配
保留适度边距
给移动端适当放大
用户手动缩放后不得自动抢回视口
重新布局后可以重新 fit
```

## Rejected Alternatives

### Hand-written SVG per-frame renderer

拒绝原因：

```text
大图性能差
拖动容易僵硬
节点和边更新成本高
容易产生 React 重渲染压力
难以实现平滑惯性和阻尼
```

### Decorative animation

拒绝原因：

```text
不能表达真实关系
不能替代拖动节点的力场反馈
容易偏离学习检查目标
```

### Default colorful mastery graph

拒绝原因：

```text
颜色噪声过高
破坏 Obsidian-like 灰阶全局感
掌握颜色应作为可选图层，不应默认铺满全图
```

### Fixed circular layout

拒绝原因：

```text
缺少自然关系聚类
不符合 Obsidian 图谱经验
拖动时很难表现邻居牵引和自然回弹
```

## Implementation Rules

未来修改图谱时必须遵守：

```text
不要把场景值写死进 renderer
不要让 renderer 直接改学习状态
不要用颜色作为唯一语义通道
不要默认显示所有标签文字
不要删除 fit view / relayout / detail close
不要移除手机 pinch zoom 支持
不要回退到只拖当前节点
```

## Test Requirements

每次修改图谱后至少运行：

```text
corepack pnpm run typecheck
corepack pnpm run build
corepack pnpm run smoke:phase10
```

如果新增 `smoke:graph`，则图谱改动必须运行：

```text
corepack pnpm run smoke:graph
```

还必须进行人工检查：

```text
PC 默认全局视图
PC 节点拖动
PC 释放回弹
PC 点击详情与关闭
手机默认视图
手机单指拖动
手机双指缩放
手机详情关闭
```

## Consequences

该决策带来：

```text
图谱体验更接近 Obsidian
大图渲染性能更稳定
拖动和释放可以由物理模拟负责
未来可以替换 renderer，但不能改变 Graph Data Model
```

代价：

```text
Canvas 调试比 SVG 更难
自动化测试难以完全验证“丝滑感”
仍需要人工视频/手机体验验收
```

这是可接受代价。
