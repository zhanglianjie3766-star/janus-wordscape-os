# 雅努斯词境 OS 核心验收包 60

Import file:

```text
data/imports/janus-wordscape-core-acceptance-60.json
```

Purpose:

```text
Use this as the first real local acceptance package for 雅努斯词境 OS.
It is small enough for daily testing and broad enough to exercise the notebook, FSRS learning flow, review queue, stats, graph, and settings.
```

## Structure

```text
6 first-level domains
12 second-level scenes
5 cards per scene
60 cards total
```

## Domain And Scene Coverage

```text
AI编程: IDE界面, AI代码助手
Web3: 钱包, 智能合约
语言运行时: TS/JS, 依赖管理
AI平台: 模型API, API密钥
云与协作: GitHub, 部署环境
设计创作: Figma, 原型
```

## Frequency Distribution

```text
F1: 24 cards
F2: 12 cards
F3: 12 cards
F4: 12 cards
```

## Validation Checklist

After importing this package locally, verify:

```text
单词本 -> 全部 shows 60 cards.
Each of the 12 second-level scene folders shows 5 cards.
Scene subpage filters show All 5, Unlearned 5, Learning 0, Due Review 0 before use.
Clicking any word row writes browser_detail + again and moves that card into active learning.
Inline learning writes daily_task events and updates FSRS memory state.
Bottom Review remains empty until due-review cards actually become due.
Stats reflects real ReviewEvent and UserMemoryState changes.
Word Galaxy can filter by frequency, memory status, scene range, and relation focus.
```
