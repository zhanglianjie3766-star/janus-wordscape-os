# Quick Start

This guide is for the first public alpha release of:

```text
雅努斯词境 OS · 技术英语词汇网络
```

## 1. Open The App

Open the published GitHub Pages URL or run the release package locally with a
static server.

If the browser supports PWA installation, add the app to desktop or home screen.

## 2. Import A Card Package

Go to:

```text
设置 -> 词卡与备份 -> 选择文件
```

Choose a standard `.json` word-card package.

Recommended first package:

```text
data/card-production/janus-personal-ai-english-sample-120.package.json
```

## 3. Learn From Notebook

Go to:

```text
单词本
```

Choose a domain pack or `全部`, then open a second-level scene folder.

In a scene subpage:

```text
全部 / 未学习 / 学习中 / 待复习 / 已掌握
```

filter the word list. Click `开始学习` to start inline learning.

## 4. Browse Means Unfamiliar

Clicking a word row in the word list means:

```text
I do not know this word.
```

The app writes:

```text
review_mode = browser_detail
rating = again
```

and adds the card to today's review queue.

This is a product rule, not a formal FSRS daily-task review.

## 5. Review Today

Go to:

```text
今日
```

Only due-review cards are shown here. Review them with:

```text
忘记 / 困难 / 良好 / 简单
```

These four buttons are the formal FSRS rating inputs.

## 6. Use The Graph

Go to:

```text
图谱
```

The graph answers:

```text
Why can I not remember this word, and which scene, relation, or source should I use to recall it?
```

First touch/click highlights a node. Second touch/click opens details.

## 7. Back Up Your Data

Go to:

```text
设置 -> 词卡与备份 -> 导出备份
```

Export a backup before:

```text
clearing browser storage
switching browsers
changing devices
large imports
```

This alpha is local-first. Your learning state lives in your browser profile.
