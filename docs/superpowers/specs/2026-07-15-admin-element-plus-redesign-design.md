# SaaSBase 前端 admin Element Plus 全量改造设计

## 目标

将 `apps/admin` 的整体 UI 统一改造成 `Element Plus` 风格，保留现有业务能力、路由结构、API 契约和权限边界，只替换页面表达层与交互组件。

本阶段要做到：

- `apps/admin` 的主布局、登录页、业务页和系统页都使用 `Element Plus` 组件表达
- 现有业务流程不变，仍然覆盖登录、权限拦截、工作台、用户、部门、文件、平台租户、租户资料
- 所有表单、表格、弹窗、分页、提示、空状态与结果页统一到 `Element Plus` 风格
- 页面在桌面端保持高信息密度，同时具备基本响应式能力

## 范围

包含：

- `apps/admin` 的全局样式与主题变量收敛
- `AdminLayout` 与 `DomainLayout` 的统一改造
- `login`、`forbidden`、`not-found` 等系统页重做
- `dashboard`、`users`、`departments`、`files`、`platform/tenants`、`tenant/profile` 等业务页重做
- `Element Plus` 组件的全局注册、图标与消息提示接入
- 布局、表单、表格、分页、抽屉、对话框、结果页、空状态的统一替换
- 相关单元测试与 E2E 的 UI 断言更新

不包含：

- 路由路径调整
- 权限规则调整
- API 路径、请求参数和响应结构调整
- `client`、`portal` 或其他应用的 UI 改造
- 生产部署、CI/CD 或环境变量改动

## 架构

```text
apps/admin
├── src/main.ts
├── src/styles/
├── src/layouts/
├── src/modules/auth/
├── src/modules/dashboard/
├── src/modules/users/
├── src/modules/depts/
├── src/modules/files/
├── src/modules/platform/
├── src/modules/tenant/
├── src/modules/system/
└── src/router/
```

### 模块边界

- `main.ts`：注册 `Element Plus`、图标、全局配置与基础主题
- `styles`：保留全局 reset、设计令牌与少量覆盖样式，不再承担主要页面视觉
- `layouts`：只负责页面壳、导航、顶部信息、内容容器和退出入口
- `modules/*`：各业务页只保留业务编排、数据状态和少量局部样式
- `system`：统一承载 `login`、`403`、`404`、空状态和通用异常展示

### 设计原则

- 以 `Element Plus` 的默认组件语义为主，不再用大量自绘卡片模拟组件库
- 页面结构优先保持现有信息架构，先统一视觉语言，再微调布局细节
- 业务逻辑和请求流不因 UI 改造而变化
- 高风险操作仍保留二次确认

### 数据流

- 登录、退出、权限守卫、列表查询和详情查看沿用现有数据流
- 视图层只替换组件和状态呈现方式，不改变请求时机
- 页面内 loading、empty、error、confirm 与 success 状态统一由 `Element Plus` 反馈组件表达

## 路由

现有路由结构保持不变，仍以当前路由表为准：

- `/login`
- `/dashboard`
- `/tenant/profile`
- `/users`
- `/departments`
- `/files`
- `/platform/tenants`
- `/platform/overview`
- `/forbidden`
- `/:pathMatch(.*)*`

路由元信息、权限判断和页面标题同步逻辑不改，只更新对应页面的视觉表现。

## 布局与主题

### 布局

- `AdminLayout` 迁移为 `Element Plus` 容器体系，使用侧边栏、头部和主内容区组织管理端壳
- `DomainLayout` 不再保留独立视觉体系，改为复用统一管理端壳，避免双套风格并存
- 菜单入口保留当前业务优先级，平台租户入口只在有权限时显示

### 主题

- 保留当前品牌色和深色基调，但把主要视觉责任交给 `Element Plus`
- 仅保留少量全局变量用于品牌色、背景色、文本色与圆角控制
- 页面局部不再维护大块渐变背景和自绘阴影卡片

## 页面改造

### 登录页

- 使用 `el-card`、`el-form`、`el-input`、`el-button`、`el-alert`
- 明确展示租户编码、用户名、密码和提交状态
- 登录失败时保留字段值，并显示可读错误信息

### 工作台与业务页

- 工作台改为信息卡片、快捷入口、统计摘要或最近操作的组合
- 用户、部门、文件、平台租户等列表页统一使用 `el-form` + `el-table` + `el-pagination`
- 新建、编辑、详情、确认、删除等交互统一用 `el-dialog`、`el-drawer`、`el-popconfirm` 或 `el-message-box`
- 空列表、权限不足、未找到资源等状态统一用 `el-empty` 或 `el-result`

### 系统页

- `403`、`404`、无数据页和通用错误页统一使用 `Element Plus` 的结果页或信息提示组件
- 系统页保留清晰的返回入口，不再使用自绘占屏式大背景

## 交互与状态

- 所有表单输入继续遵守现有校验规则，只替换控件外观
- 高风险操作必须确认，不允许静默执行
- 列表页保留筛选、分页、刷新、详情和操作入口
- 加载中、禁用态、提交中与成功反馈都使用统一的组件反馈
- 组件宽度、列宽和弹窗宽度在桌面端优先保证可读性，不为“极简空白感”牺牲密度

## 错误处理

- 认证失效：清理会话并跳转登录页
- 权限不足：显示 `403`
- 路由不存在：显示 `404`
- 接口失败：保留当前筛选和已输入内容，并显示可理解的错误提示
- 表单校验失败：在字段级展示，不吞掉错误细节
- 资源为空：用空状态说明当前页面可做什么

## 测试与质量门禁

- 更新布局、登录页、结果页和关键业务页的单元测试，确保核心文案、导航和交互仍然存在
- 关键路径补充 E2E 或更新现有 E2E：登录、退出、权限页、用户列表、部门列表、文件列表、平台租户页
- 每次修改至少运行受影响模块的测试，再运行 `typecheck` 和必要的 `build`

## 完成标准

当以下条件全部满足时，本阶段可视为完成：

- `apps/admin` 的主要页面都已切换为 `Element Plus` 组件表达
- 登录、业务列表、详情、弹窗、分页和系统页视觉风格统一
- 现有路由、权限和 API 行为未被破坏
- 相关测试更新完成，关键交互仍然通过

## Agent Prompt Guide

- 先做全局布局和登录页，再做业务页和系统页
- 不要改路由和 API 契约
- 不要在业务组件里继续堆自绘卡片和原生控件
- 保持现有信息架构，不把 UI 重构扩展成无关的功能重写
