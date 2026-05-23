# 设计 Tokens 冻结文档 v1.0

本文档冻结“雅努斯词境 OS / TechLex OS”前端 UI 的基础视觉变量。

五个页面冻结文档回答“页面应该是什么”。本文档回答“视觉应该如何稳定复刻”。

未来从 0 重建前端时，应先按本文档建立 tokens，再实现页面和组件。

## 1. 设计目标

整体风格固定为：

```text
极简
低噪声
白底卡片
主色红
柔和灰阶
移动端优先
桌面端不松散
```

不得回退为：

```text
强营销风格
大面积渐变
复杂装饰背景
多色混乱状态系统
厚重边框
卡片嵌套卡片
```

## 2. 主色系统

主色来自图谱谱线红色。

冻结主色：

```text
brand: #d11b3d
brand-hover: #b91635
brand-soft: #fce8ed
brand-softer: #fff1f4
brand-border: #f3b8c4
```

使用范围：

```text
底栏选中态
主按钮
选中的筛选 chip
图谱高亮节点和谱线
重要行动状态
音频按钮图标
轻量提示中的重点词
```

不得把主色用于：

```text
大面积页面背景
所有文字标题
普通说明文字
每个状态都强制红色
错误以外的警告堆叠
```

## 3. 中性色系统

基础背景：

```text
page-bg: #eef3f8
panel-bg: #ffffff
panel-soft: #f7f9fc
chip-bg: #f6f8fb
line: #d7e1ec
line-soft: #e8eef5
```

文字颜色：

```text
ink: #0f1f33
text: #334155
muted: #64748b
muted-soft: #94a3b8
inverse: #ffffff
```

图谱默认灰阶：

```text
graph-node-idle: #6f6f6f
graph-node-idle-soft: #9b9b9b
graph-edge-idle: rgba(120, 120, 120, 0.26)
graph-edge-background: rgba(128, 128, 128, 0.10)
```

图谱默认节点不得过浅。手机端白底下应清晰可见，但仍弱于选中红色。

## 4. 状态色系统

学习阶段状态只允许轻量区分，不得和 FSRS 四个评分色抢视觉主导。

冻结状态色：

```text
未学习: slate, text #64748b, bg #f1f5f9
学习中: amber, text #a16207, bg #fef3c7
待复习: brand, text #d11b3d, bg #fff1f4
已掌握: sky/slate, text #475569, bg #eef6ff
```

使用原则：

```text
状态筛选选中态统一用 brand。
列表状态 badge 使用轻量底色和文字色。
场景卡片统计文字以可读为主，不使用大面积色块。
```

FSRS 评分色固定：

```text
忘记: red
困难: orange
良好: green
简单: blue
```

评分色只用于评分按钮，不扩散到页面主导航。

## 5. 字体与字号

字体栈：

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

中文界面不得使用负 letter-spacing。

字号冻结：

```text
page-title: 28-34px / 700
section-title: 20-24px / 700
card-title: 18-22px / 700
body: 14-16px / 400-500
caption: 12-13px / 400-500
metric-number: 34-44px / 500-600
review-headword-mobile: 52-64px / 700
review-headword-desktop: 56-72px / 700
```

数字不得过粗、过黑。统计页数字建议使用：

```text
font-weight: 500
color: #334155
tabular-nums: enabled
```

## 6. 间距系统

基础单位：

```text
4px grid
```

常用间距：

```text
xs: 4px
sm: 8px
md: 12px
lg: 16px
xl: 20px
2xl: 24px
3xl: 32px
```

移动端页面边距：

```text
min: 12px
default: 16px
wide-mobile: 20px
```

桌面端内容宽度：

```text
common-max-width: 1120px
learning-card-max-width: 1120px
settings-max-width: 760px
graph: full bleed inside app content
```

## 7. 圆角与阴影

圆角：

```text
small-control: 10-12px
chip: 999px
card: 18-24px
modal: 20-24px
bottom-nav-active: 10-14px
```

卡片圆角不应超过 24px，除非是头像或图标圆形容器。

阴影：

```text
card-shadow: 0 2px 8px rgba(15, 31, 51, 0.06)
modal-shadow: 0 14px 34px rgba(15, 31, 51, 0.14)
button-shadow: 0 1px 2px rgba(15, 31, 51, 0.08)
```

不得使用重阴影制造浮夸层级。

## 8. 卡片和边框

页面卡片：

```text
background: panel-bg
border: 1px solid line
shadow: card-shadow
```

内部列表尽量使用分隔线，不重复嵌套厚边框。

薄弱场景、词卡列表等区域，应避免：

```text
外卡片 + 内卡片 + 内边框 的三层轮廓叠加
```

## 9. 按钮

主按钮：

```text
background: brand
color: white
height mobile: 48-56px
height desktop: 44-52px
radius: 999px or 12px, follow local context
```

次按钮：

```text
background: white
border: line
color: ink/muted
```

图标按钮：

```text
size: 40-48px
hit target: at least 40px
icon: 20-24px
background: transparent or chip-bg
```

手机端触控目标不得小于 40px。

## 10. 响应式断点

冻结断点：

```text
xs: 360px
sm: 390px
md: 430px
tablet: 768px
desktop: 1024px
wide: 1280px
```

必须验收：

```text
360 x 780
390 x 844
412 x 915
430 x 932
768 x 1024
1280 x 720
1440 x 900
```

移动端不得横向溢出。

## 11. 语音胶囊

读音胶囊冻结为：

```text
background: #f7f9fc
text: muted
accent label: ink, semibold
audio icon: brand
radius: 999px
padding: compact
```

胶囊背景必须比普通 chip 更浅，不能显脏或厚重。

## 12. 图谱视觉

默认图谱：

```text
白底
灰色节点
灰色关系线
选中节点和一跳关系变红
未选中节点仍可见但退后
```

选中态：

```text
selected-node: brand
selected-edge: brand
neighbor-node: dark gray
background-node: low opacity gray
```

首次高亮应有轻微连接动感，但不得造成眩晕或持续扰动。

## 13. 禁止回退清单

```text
主色变回绿色或蓝绿色。
状态色和评分色混用。
统计数字变得过粗、过大、过黑。
手机端 chips 因数字变多而换行错乱。
图谱默认节点浅到几乎不可见。
读音胶囊背景过重。
设置页卡片过高导致页面显得松散。
```

