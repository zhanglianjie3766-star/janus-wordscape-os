# 雅努斯词境 OS · 技术英语词汇网络

雅努斯词境 OS 是一个个人场景英语词汇学习运行时。当前发布场景应用是：

```text
雅努斯词境 OS · 技术英语词汇网络
```

历史开发代号：`TechLex OS`。

本项目不是制卡后台，也不是普通词典。它的核心目标是：导入已经加工好的真实词卡包，设置学习规则，然后自动生成今日任务、运行 FSRS 复习、记录 ReviewEvent、更新 UserMemoryState，并用关系图谱帮助用户判断一个词为什么记不住。

## 当前发布形态

```text
发布方式：PWA 静态网页应用
存储方式：本机浏览器 IndexedDB
核心算法：ts-fsrs 5.4.0
当前版本：v0.1.0-alpha
```

用户可以通过 GitHub Pages 打开应用，也可以下载 Release 包后本地静态托管运行。

## 快速使用

1. 打开应用页面。
2. 进入 `设置 -> 词卡与备份`。
3. 选择标准词卡包 JSON。
4. 导入后进入 `单词本`，按二级场景开始学习或浏览词卡。
5. 点击单词列表中的词卡表示“不认识”，该词会进入今日待复习队列。
6. 进入 `今日` 完成正式复习。
7. 定期在 `设置 -> 词卡与备份` 导出备份。

更详细说明见 [docs/QUICK_START.md](docs/QUICK_START.md)。

## 五个核心页面

```text
今日：只处理已到期的待复习词卡。
单词本：按领域包和二级场景组织词卡，支持学习与浏览。
统计：展示今日执行、记忆健康、阶段分布和薄弱场景。
图谱：展示词卡、场景、来源、词族和易混词关系。
设置：管理学习规则、词卡导入、备份恢复、数据健康和应用说明。
```

## 数据与隐私

默认情况下，学习数据保存在用户自己的浏览器 IndexedDB 中，不上传到本项目服务器。

需要注意：

```text
GitHub Pages 或其他托管平台可能记录基础访问日志。
点击读音时，应用可能请求公开词典发音接口或调用浏览器 Web Speech。
导出的备份文件由用户自行保管。
清除浏览器站点数据会删除本地学习记录，清除前应先导出备份。
```

完整说明见 [PRIVACY.md](PRIVACY.md)。

## 本地开发

```bash
corepack pnpm install
corepack pnpm run dev
```

打开：

```text
http://127.0.0.1:5173
```

## 发布构建

```bash
corepack pnpm run typecheck
corepack pnpm run test:fsrs-golden
corepack pnpm run build
corepack pnpm run package
```

本地预览生产构建：

```bash
corepack pnpm run serve:dist
```

打开：

```text
http://127.0.0.1:4173
```

## GitHub 发布

推荐发布形态：

```text
GitHub repository: source and documentation
GitHub Pages: installable PWA
GitHub Release: dist package, sample card package, schema, quick start
```

发布检查：

```bash
corepack pnpm run typecheck
corepack pnpm run test:fsrs-golden
corepack pnpm run smoke:phase11
corepack pnpm run build
```

`smoke:phase11` 依赖本机 Chrome 或 Edge。GitHub CI 默认执行类型检查、FSRS golden test 和 production build；端到端 smoke 可作为发布前本地验收。

## 关键文档

```text
PROJECT_STATE.md
docs/NAMING_CONVENTION_FREEZE_v1.0.md
docs/PROJECT_BASELINE_FREEZE_INDEX_v1.0.md
docs/REAL_WORD_CARD_PRODUCTION_STANDARD.md
docs/MEMORY_ALGORITHM_FREEZE_v1.0.md
docs/UI_FREEZE_INDEX_v1.0.md
docs/DATA_FLOW_FREEZE_v1.0.md
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
schemas/standard-word-card-package.schema.json
```

## 许可证与第三方声明

本项目当前以预览授权发布，详见 [LICENSE](LICENSE)。

第三方依赖和 FSRS/ts-fsrs 声明见 [NOTICE](NOTICE)。
