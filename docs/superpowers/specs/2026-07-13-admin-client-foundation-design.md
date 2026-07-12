# SaaSBase 前端双应用基础骨架设计

## 目标

基于 `CLAUDE.md` 搭建 SaaSBase 首个可运行前端基础工程，同时提供 `admin` 管理后台和 `client` 用户侧跨端应用。首版包含模拟认证、权限路由和最小示例页面，但不接入真实后端。

## 范围

包含：

- pnpm workspace monorepo
- `apps/admin`：Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus
- `apps/client`：uni-app、Vue 3、TypeScript，提供 H5 启动能力
- `packages/shared`：共享权限类型、会话类型、纯工具函数
- admin 登录页、内存模拟会话、路由权限守卫、无权限页
- admin C「分域导航」布局，以及平台概览、租户空间示例页
- client 登录页、首页和基础导航骨架
- Vitest 单元测试、基础 Playwright 流程，以及 lint/typecheck/test/build 脚本

不包含：真实 API、OpenAPI 生成、生产认证、后端联调、portal 官网和 CI/CD 配置变更。

## 架构

```text
apps/admin  ─────┐
                 ├── packages/shared
apps/client ────┘
```

`packages/shared` 只包含与平台无关的领域类型和纯函数，不依赖 Vue、uni-app、浏览器对象或应用别名。两个应用不直接共享页面或平台组件。

### admin 目录职责

- `src/api`：为未来 API Client 预留的轻量封装边界
- `src/components`：跨模块展示组件
- `src/composables`：认证和交互逻辑
- `src/layouts`：分域导航布局
- `src/modules/auth`：登录、模拟认证和会话状态
- `src/modules/platform`：平台概览示例
- `src/modules/tenant`：租户空间示例
- `src/router`：路由、权限元数据和守卫
- `src/stores`：仅保存会话与当前权限
- `src/styles`：设计令牌和全局样式

### client 目录职责

提供跨端兼容的登录、首页和基础导航。认证通过应用内 adapter 接入共享类型，不引入 Element Plus；平台差异留在应用边界内。

## 路由与权限

admin 路由分为 `/platform/*` 和 `/tenant/*`，分别表达平台管理员与租户管理员边界。路由元数据声明所需角色或权限；未登录跳转 `/login`，已登录但无权限进入独立无权限页。前端入口只用于体验控制，后端授权仍是最终边界。

## 认证与数据流

首版使用 mock auth service，登录成功后将最小会话保存在内存中；刷新页面默认回到登录页。业务页面不自行读写 token。模拟服务不生成或暴露真实密钥、token 或个人隐私数据。

页面级异步状态明确区分 loading、empty、error 和 success；本阶段示例数据为本地静态数据，不伪造未发布的后端 DTO。

## 测试与质量门禁

- Vitest：覆盖共享权限判断、认证 composable 和关键状态转换。
- Playwright：覆盖 admin 登录、未登录跳转、平台/租户权限拦截。
- 根据生成的 `package.json` 实际脚本运行 lint、typecheck、test、build。
- 所有新增 TypeScript 使用 strict，不以 `any` 绕过类型错误。

## 可维护性约束

- 设计令牌集中在应用样式目录，业务组件不散落魔法值。
- 高风险操作示例若出现，必须二次确认；本首版不实现真实变更操作。
- 仅提交 `.env.example`（如需要），不修改 `.env`、密钥、证书或 CI/CD 配置。
- 后续接入后端时，以 OpenAPI 为唯一接口事实来源，并将 API 类型放入 `packages/api-client`。
