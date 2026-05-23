# TechLex OS 主线接口协议 v1.0

> 来源窗口：`宪法｜目标｜techlex_os_web项目`
> 目标窗口：`00｜主线｜techlex_os_web项目`
> 目的：让执行主线在任何上下文压缩、窗口切换、Meoo 代聊中，都能与终局宪法目标和当前阶段状态保持一致。

## 1. 先读文件

执行主线每次接手前，必须先读取：

```text
docs/TECHLEX_OS_CONSTITUTION_v1.2.md
PROJECT_STATE.md
docs/MAINLINE_INTERFACE_PROTOCOL.md
```

读取后必须先确认：

```text
终局目标是什么？
当前阶段是什么？
已通过哪些阶段？
当前阶段允许做什么？
当前阶段禁止做什么？
最近关键裁决是什么？
是否偏离“自动学习运行系统”最高目标？
```

## 2. 终局宪法目标

TechLex OS 的最高目标是：

```text
自动学习运行系统
```

不是：

```text
词卡加工后台
```

最终验收只看这一句话：

```text
我是否可以批量导入已加工好的技术英语词卡，只设置学习计划和记忆规则，然后系统自动推送每日学习任务、执行 FSRS 复习、记录反馈、更新掌握状态，并通过单词星系展示词汇关系？
```

如果可以，项目达标。  
如果不可以，项目未达标。

## 3. 职责边界

Codex 工作台负责：

```text
来源整理
候选词生成
词卡加工
例句与翻译
来源证据
质量审查
结构化导出
异常修复
```

TechLex OS 客户端负责：

```text
批量导入标准词卡包
设置学习计划
设置记忆规则
自动生成每日学习任务
复习互动
记录 ReviewEvent
更新 UserMemoryState
执行 FSRS 调度
展示单词星系
批量导出学习数据
处理导入异常
```

客户端不得被开发成以手工制卡为中心的后台系统。

## 4. 当前阶段状态

本协议不再保存固定阶段锚点。

当前阶段、已通过阶段、下一阶段、允许事项、禁止事项，统一以 `PROJECT_STATE.md` 为准；路线图以 `ROADMAP.md` 为准。

截至本次更新：

```text
Phase 9：已通过
当前阶段：Self-Developed Phase 9 IndexedDB migration and recovery hardening completed
下一阶段候选：Phase 10 Remote Sync Decision And Persistence Adapter Boundary
```

继续工作前必须先读取：

```text
docs/TECHLEX_OS_CONSTITUTION_v1.2.md
PROJECT_STATE.md
ROADMAP.md
docs/MAINLINE_INTERFACE_PROTOCOL.md
```

阶段规则：

```text
如果本协议与 PROJECT_STATE.md 对当前阶段描述冲突，以 PROJECT_STATE.md 为准。
如果 PROJECT_STATE.md 与宪法文档对终局目标、职责边界、偏航判定冲突，以宪法文档为准。
```

## 5. 开发协作方式

执行主线与 Meoo 协作时采用：

```text
短指令
先查证据
再裁决
不许越阶段
必要时问用户要辅助截图或授权
```

每次给 Meoo 的指令应该短、明确、可验收。

不允许让 Meoo：

```text
自由发挥
一次性全量开发
跨 Phase 实现未来功能
用公开 service_role 测试函数绕过正常权限
把 UI 细节优先于核心链路
把客户端做成词卡加工后台
```

## 6. 防上下文压缩结构

本项目用三层结构最大限度防止压缩损失：

```text
宪法目标文档：保证方向不丢
PROJECT_STATE.md：保证阶段不丢
最近几轮短锚点：保证最新裁决不丢
```

对应文件：

```text
docs/TECHLEX_OS_CONSTITUTION_v1.2.md
PROJECT_STATE.md
```

当任务涉及第三方算法依赖、FSRS / `ts-fsrs`、调度审计、版权合规、ReviewEvent 原始算法输出与产品规则输出边界时，还必须读取：

```text
docs/THIRD_PARTY_ALGORITHM_GOVERNANCE.md
```

执行主线每次上下文压缩、新窗口接手、阶段切换后，都必须优先恢复这三件事：

```text
终局目标
当前阶段
最新裁决
```

## 7. PROJECT_STATE.md 自动更新规则

每次发生关键裁决后，执行主线必须更新 `PROJECT_STATE.md`。

必须更新的情况包括：

```text
阶段通过
阶段失败
当前阶段切换
发现重大技术债
修正架构裁决
新增禁止事项
确认下一个 Phase
```

更新后必须在回复末尾说明：

```text
已更新 PROJECT_STATE.md：更新了哪些裁决。
```

## 8. 阶段推进裁决规则

进入下一阶段前必须满足：

```text
有构建结果
有页面或功能证据
有 DB 前后状态证据
有未越阶段写入证据
有安全边界检查
有明确“通过 / 不通过 / 补证据”的裁决
```

如果证据不足，不得进入下一阶段。

## 9. Meoo 代聊规则

执行主线可以代用户与 Meoo 聊天，但必须遵守：

```text
只发当前阶段所需短指令
先要求 Meoo 回传证据
看到证据后再裁决
必要时请用户辅助截图、登录、授权、切页面
不让 Meoo 越阶段开发
```

如果浏览器自动化不稳定：

```text
先尝试可见窗口操作
再让用户辅助把输入框、截图或返回内容发回来
不要为了操作浏览器而牺牲阶段门禁
```

## 10. 续接短锚点

```text
窗口身份：00｜主线｜techlex_os_web项目
对齐来源：宪法｜目标｜techlex_os_web项目
宪法目标：TechLex OS 是自动学习运行系统，不是词卡加工后台
稳定结构：宪法目标文档 + PROJECT_STATE.md + 最近短锚点
当前阶段：以 PROJECT_STATE.md 为准；当前为 Phase 9 已通过
下一阶段：Phase 10 Remote Sync Decision And Persistence Adapter Boundary
推进方式：短指令，先证据，再裁决，不许越阶段
关键规则：关键裁决后必须更新 PROJECT_STATE.md
```
