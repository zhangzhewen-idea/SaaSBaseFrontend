# SaaSBase Frontend Design

## 设计目标

本设计用于 `SaaSBase` 前端首页与后续管理端页面的统一视觉基线。当前首要目标是一个介绍型门户首页：

- 先介绍产品，再提供入口分流
- 桌面端入口放在首屏右上角
- 保持企业级、克制、清晰的视觉气质

## Color

### Brand

- `--color-brand-950: #0b1f3a`
- `--color-brand-900: #12305a`
- `--color-brand-700: #2952a3`
- `--color-brand-500: #3f6fe0`

### Neutrals

- `--color-bg: #f7f9fc`
- `--color-surface: #ffffff`
- `--color-surface-strong: #eef3fb`
- `--color-border: #dbe3f0`
- `--color-text: #132033`
- `--color-text-weak: #5c6d85`
- `--color-text-muted: #7a8798`

### Feedback

- `--color-success: #1f8b4c`
- `--color-warning: #b46a00`
- `--color-danger: #b42318`
- `--color-info: #2563eb`

### Usage Rules

- 页面背景优先使用 `--color-bg`
- 卡片和内容容器使用 `--color-surface`
- 主标题使用 `--color-text`
- 次要说明使用 `--color-text-weak` 或 `--color-text-muted`
- 品牌强调色只用于关键按钮、链接和少量视觉锚点，不做大面积铺色

## Typography

### Font Stack

- `--font-display: "Inter", "Avenir Next", "Segoe UI", system-ui, sans-serif`
- `--font-body: "Inter", "Avenir Next", "Segoe UI", system-ui, sans-serif`
- `--font-mono: "SFMono-Regular", "SF Mono", Consolas, monospace`

### Type Scale

- `--text-xs: 12px`
- `--text-sm: 14px`
- `--text-base: 16px`
- `--text-lg: 18px`
- `--text-xl: 24px`
- `--text-2xl: 32px`
- `--text-3xl: 44px`

### Usage Rules

- 页面标题使用 display font，正文使用 body font
- Hero 标题优先使用 `--text-3xl`
- 章节标题使用 `--text-2xl`
- 正文默认 `--text-base`
- 辅助信息使用 `--text-sm` 或 `--text-xs`
- 行高以可读性优先，正文不要压得过紧

## Layout

### Grid And Width

- 内容最大宽度：`1200px`
- 页面左右内边距：桌面端 `32px`，平板端 `24px`，移动端 `20px`
- 主要内容采用 12 列思路组织，但组件实现时允许按内容块自适应

### Spacing

- 基础间距单位：`8px`
- 常用间距：`8px`、`12px`、`16px`、`24px`、`32px`、`48px`、`64px`
- Hero 区垂直留白充足，首屏内容不要拥挤

### Radius

- `--radius-sm: 8px`
- `--radius-md: 12px`
- `--radius-lg: 16px`

### Elevation

- 阴影保持轻量，只用于悬浮卡片和按钮 hover
- 不使用厚重投影，不使用霓虹或高对比光晕

### Responsive Behavior

- `>= 1200px`：顶部栏、Hero、内容卡片并列展示
- `768px - 1199px`：内容可折行，入口按钮保持可点击性
- `< 768px`：入口进入顶部纵向排列，Hero 纵向堆叠，卡片单列

## Components

### Header

- 左侧品牌名，右侧两枚入口按钮
- 入口按钮包括 `平台后台` 和 `租户后台`
- Header 始终保持清晰可见，不压缩为纯图标导航

### Button

- 主按钮使用品牌色填充
- 次按钮使用浅底和描边
- hover 只做轻微位移或明暗变化

### Card

- 卡片使用白底、细边框和轻微圆角
- 卡片用于展示产品能力、系统分区和关键信息

### Section

- 每个 section 有明确标题和简短说明
- 区块之间留出足够呼吸感，避免密集堆叠

## Agent Prompt Guide

- 首页先介绍产品，再提供入口分流
- 首屏右上角放后台入口
- 视觉优先级是：标题 > 说明 > 入口 > 补充信息
- 不要把首页写成纯登录页
- 不要做过度装饰和无意义动效
- 不要引入与企业级气质冲突的强烈渐变、夸张插画或高饱和色块
