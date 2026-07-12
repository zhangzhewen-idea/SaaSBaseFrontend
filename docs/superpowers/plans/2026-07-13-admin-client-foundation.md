# SaaSBase 前端双应用基础骨架实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 创建一个可安装、可运行、可测试的 pnpm monorepo，包含 admin 管理端、client uni-app 端、共享权限模型、模拟认证和权限路由示例。

**架构：** 根工作区统一脚本和 TypeScript/Vitest 基础配置，`packages/shared` 提供无平台依赖的会话与权限契约。`apps/admin` 使用 Vue 3 SPA 实现分域导航、内存认证和权限守卫；`apps/client` 使用 uni-app 实现独立的跨端认证适配与最小页面，不跨应用共享 UI。

**技术栈：** pnpm workspace、TypeScript strict、Vue 3、Vite、Vue Router、Pinia、Element Plus、uni-app、Vitest、Vue Test Utils、Playwright、ESLint。

---

## 文件结构

### 根目录

- 创建：`package.json` —— 工作区脚本和开发依赖入口。
- 创建：`pnpm-workspace.yaml` —— 声明 `apps/*` 与 `packages/*`。
- 创建：`tsconfig.base.json` —— strict TypeScript 基础配置。
- 创建：`eslint.config.js` —— Vue 与 TypeScript 共享 lint 规则。
- 创建：`.gitignore` —— 忽略依赖、构建产物、测试报告和视觉伴侣目录。
- 创建：`README.md` —— 中文启动、测试和模拟账号说明。

### shared 包

- 创建：`packages/shared/package.json` —— `@saasbase/shared` 包元数据与脚本。
- 创建：`packages/shared/tsconfig.json` —— 继承根 TypeScript 配置。
- 创建：`packages/shared/src/auth.ts` —— 角色、权限和会话类型。
- 创建：`packages/shared/src/permissions.ts` —— 纯权限判断函数。
- 创建：`packages/shared/src/permissions.test.ts` —— 权限函数单元测试。
- 创建：`packages/shared/src/index.ts` —— 包公开出口。

### admin 应用

- 创建：`apps/admin/package.json`、`apps/admin/tsconfig.json`、`apps/admin/vite.config.ts`、`apps/admin/index.html` —— Vite 应用配置。
- 创建：`apps/admin/playwright.config.ts`、`apps/admin/e2e/auth.spec.ts` —— 认证与权限 E2E。
- 创建：`apps/admin/src/main.ts`、`apps/admin/src/App.vue`、`apps/admin/src/env.d.ts` —— 应用入口。
- 创建：`apps/admin/src/styles/tokens.css`、`apps/admin/src/styles/global.css` —— 设计令牌与全局样式。
- 创建：`apps/admin/src/modules/auth/auth.service.ts` —— mock 登录服务。
- 创建：`apps/admin/src/modules/auth/auth.store.ts` —— 内存会话 Pinia store。
- 创建：`apps/admin/src/modules/auth/auth.store.test.ts` —— 会话状态测试。
- 创建：`apps/admin/src/modules/auth/LoginPage.vue` —— 登录页。
- 创建：`apps/admin/src/router/meta.d.ts`、`apps/admin/src/router/routes.ts`、`apps/admin/src/router/index.ts`、`apps/admin/src/router/guard.ts` —— 路由声明与权限守卫。
- 创建：`apps/admin/src/router/guard.test.ts` —— 路由决策单元测试。
- 创建：`apps/admin/src/layouts/DomainLayout.vue` —— C「分域导航」布局。
- 创建：`apps/admin/src/modules/platform/PlatformOverviewPage.vue` —— 平台概览示例。
- 创建：`apps/admin/src/modules/tenant/TenantWorkspacePage.vue` —— 租户空间示例。
- 创建：`apps/admin/src/modules/system/ForbiddenPage.vue`、`apps/admin/src/modules/system/NotFoundPage.vue` —— 异常状态页。

### client 应用

- 创建：`apps/client/package.json`、`apps/client/tsconfig.json`、`apps/client/vite.config.ts` —— uni-app 配置。
- 创建：`apps/client/src/env.d.ts`、`apps/client/src/main.ts`、`apps/client/src/App.vue` —— 应用入口。
- 创建：`apps/client/src/manifest.json`、`apps/client/src/pages.json` —— uni-app 清单与路由。
- 创建：`apps/client/src/auth/auth.adapter.ts` —— 应用内 mock 认证适配器。
- 创建：`apps/client/src/auth/auth.adapter.test.ts` —— 认证适配器测试。
- 创建：`apps/client/src/pages/login/index.vue` —— 登录页。
- 创建：`apps/client/src/pages/home/index.vue` —— 首页及四种数据状态示例。
- 创建：`apps/client/src/styles/tokens.scss` —— client 端设计令牌。

## 任务 1：初始化 pnpm 工作区

**文件：**
- 创建：`package.json`
- 创建：`pnpm-workspace.yaml`
- 创建：`tsconfig.base.json`
- 创建：`eslint.config.js`
- 创建：`.gitignore`

- [ ] **步骤 1：创建工作区声明**

```yaml
# pnpm-workspace.yaml
packages:
  - apps/*
  - packages/*
```

- [ ] **步骤 2：创建根脚本与基础 TypeScript 配置**

```json
{
  "name": "saasbase-frontend",
  "private": true,
  "packageManager": "pnpm@10.13.1",
  "scripts": {
    "lint": "eslint .",
    "typecheck": "pnpm -r typecheck",
    "test": "pnpm -r --if-present test",
    "build": "pnpm -r --if-present build",
    "test:e2e": "pnpm --filter @saasbase/admin test:e2e"
  },
  "devDependencies": {
    "@eslint/js": "^9.31.0",
    "eslint": "^9.31.0",
    "eslint-plugin-vue": "^10.3.0",
    "typescript": "^5.8.3",
    "typescript-eslint": "^8.37.0",
    "vitest": "^3.2.4",
    "vue-eslint-parser": "^10.2.0"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

- [ ] **步骤 3：配置 lint 和忽略目录**

`eslint.config.js` 使用 `@eslint/js`、`typescript-eslint` 和 `eslint-plugin-vue` 的 flat config，解析 `.vue` 中的 TypeScript；`.gitignore` 包含 `node_modules/`、`dist/`、`coverage/`、`playwright-report/`、`test-results/`、`.superpowers/`。

- [ ] **步骤 4：安装依赖并验证工作区可解析**

运行：`pnpm install`

预期：退出码为 0，生成 `pnpm-lock.yaml`，无 workspace package 缺失错误。

- [ ] **步骤 5：提交工作区骨架**

提交前展示 `git status --short` 与 `git diff --stat`，只暂存本任务文件和 `pnpm-lock.yaml`。

```bash
git add package.json pnpm-workspace.yaml pnpm-lock.yaml tsconfig.base.json eslint.config.js .gitignore
git commit -m "chore: 初始化前端工作区"
```

## 任务 2：以 TDD 创建共享权限模型

**文件：**
- 创建：`packages/shared/package.json`
- 创建：`packages/shared/tsconfig.json`
- 创建：`packages/shared/src/auth.ts`
- 创建：`packages/shared/src/permissions.ts`
- 创建：`packages/shared/src/permissions.test.ts`
- 创建：`packages/shared/src/index.ts`

- [ ] **步骤 1：创建 shared 包配置和失败测试**

定义 `UserRole = 'platform_admin' | 'tenant_admin' | 'member'`、`Permission = 'platform:read' | 'tenant:read'`。测试必须覆盖：空会话拒绝、平台管理员访问平台域、租户管理员访问租户域、错误权限拒绝。

```ts
import { describe, expect, it } from 'vitest'
import { canAccess } from './permissions'

describe('canAccess', () => {
  it('拒绝空会话', () => expect(canAccess(null, ['tenant:read'])).toBe(false))
  it('允许匹配权限', () => expect(canAccess({ userId: 'u1', displayName: '平台管理员', role: 'platform_admin', permissions: ['platform:read'] }, ['platform:read'])).toBe(true))
  it('拒绝不匹配权限', () => expect(canAccess({ userId: 'u2', displayName: '租户管理员', role: 'tenant_admin', permissions: ['tenant:read'] }, ['platform:read'])).toBe(false))
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/shared test`

预期：FAIL，提示无法解析 `./permissions` 或 `canAccess` 未定义。

- [ ] **步骤 3：实现最小共享契约**

```ts
export type UserRole = 'platform_admin' | 'tenant_admin' | 'member'
export type Permission = 'platform:read' | 'tenant:read'

export interface AuthSession {
  userId: string
  displayName: string
  role: UserRole
  permissions: Permission[]
}
```

```ts
import type { AuthSession, Permission } from './auth'

export function canAccess(session: AuthSession | null, required: Permission[]): boolean {
  return session !== null && required.every((permission) => session.permissions.includes(permission))
}
```

- [ ] **步骤 4：运行测试和类型检查验证通过**

运行：`pnpm --filter @saasbase/shared test && pnpm --filter @saasbase/shared typecheck`

预期：全部 PASS，TypeScript 退出码为 0。

- [ ] **步骤 5：提交共享包**

```bash
git add packages/shared
git commit -m "feat: 添加共享权限模型"
```

## 任务 3：创建 admin 应用入口与设计令牌

**文件：**
- 创建：`apps/admin/package.json`
- 创建：`apps/admin/tsconfig.json`
- 创建：`apps/admin/vite.config.ts`
- 创建：`apps/admin/index.html`
- 创建：`apps/admin/src/env.d.ts`
- 创建：`apps/admin/src/main.ts`
- 创建：`apps/admin/src/App.vue`
- 创建：`apps/admin/src/styles/tokens.css`
- 创建：`apps/admin/src/styles/global.css`

- [ ] **步骤 1：创建 admin 包配置**

声明 Vue、Pinia、Vue Router、Element Plus 依赖以及 Vite、`vue-tsc`、Vue Test Utils、jsdom 开发依赖。脚本包含 `dev`、`build`、`typecheck`、`test`、`test:e2e`。

- [ ] **步骤 2：创建最小应用入口**

`main.ts` 创建 Vue 应用，安装 Pinia、router 和 Element Plus；`App.vue` 只渲染 `<RouterView />`；Vite alias `@` 指向 `src`。

- [ ] **步骤 3：创建集中设计令牌**

`tokens.css` 定义品牌色、背景色、文字色、边框色、4/8/12/16/24/32 间距、4/8/12 圆角和层级变量；`global.css` 设置语义化基础样式与 `:focus-visible` 键盘焦点。

- [ ] **步骤 4：运行类型检查和构建**

运行：`pnpm --filter @saasbase/admin typecheck && pnpm --filter @saasbase/admin build`

预期：退出码为 0，生成 `apps/admin/dist/`。

- [ ] **步骤 5：提交 admin 基础应用**

```bash
git add apps/admin package.json pnpm-lock.yaml
git commit -m "feat: 创建管理端基础应用"
```

## 任务 4：以 TDD 实现 admin 模拟认证

**文件：**
- 创建：`apps/admin/src/modules/auth/auth.service.ts`
- 创建：`apps/admin/src/modules/auth/auth.store.ts`
- 创建：`apps/admin/src/modules/auth/auth.store.test.ts`
- 创建：`apps/admin/src/modules/auth/LoginPage.vue`

- [ ] **步骤 1：编写失败的 store 测试**

测试平台管理员登录后得到 `platform:read`、租户管理员得到 `tenant:read`、退出后 `session` 为 null、无效账号抛出中文错误。

```ts
it('平台管理员登录后建立内存会话', async () => {
  const store = useAuthStore()
  await store.login('platform', 'demo123')
  expect(store.session?.permissions).toEqual(['platform:read'])
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin test -- src/modules/auth/auth.store.test.ts`

预期：FAIL，提示 `useAuthStore` 或 auth service 不存在。

- [ ] **步骤 3：实现 mock service 与 store**

`login(username, password)` 只接受 `platform/demo123` 和 `tenant/demo123`，返回对应 `AuthSession`；其他输入抛出 `登录名或密码错误`。store 暴露只读语义的 `session`、`isAuthenticated`、`login()`、`logout()`，不进行持久化。

- [ ] **步骤 4：实现可访问登录页**

使用带 `label` 的用户名和密码字段、登录按钮、loading 状态和 `role="alert"` 错误提示；登录成功后根据角色进入 `/platform/overview` 或 `/tenant/workspace`。页面明确展示两个模拟账号，不展示或保存真实 token。

- [ ] **步骤 5：运行认证测试与类型检查**

运行：`pnpm --filter @saasbase/admin test -- src/modules/auth/auth.store.test.ts && pnpm --filter @saasbase/admin typecheck`

预期：全部 PASS。

- [ ] **步骤 6：提交认证模块**

```bash
git add apps/admin/src/modules/auth
git commit -m "feat: 实现管理端模拟认证"
```

## 任务 5：以 TDD 实现权限路由与分域布局

**文件：**
- 创建：`apps/admin/src/router/meta.d.ts`
- 创建：`apps/admin/src/router/routes.ts`
- 创建：`apps/admin/src/router/index.ts`
- 创建：`apps/admin/src/router/guard.ts`
- 创建：`apps/admin/src/router/guard.test.ts`
- 创建：`apps/admin/src/layouts/DomainLayout.vue`
- 创建：`apps/admin/src/modules/platform/PlatformOverviewPage.vue`
- 创建：`apps/admin/src/modules/tenant/TenantWorkspacePage.vue`
- 创建：`apps/admin/src/modules/system/ForbiddenPage.vue`
- 创建：`apps/admin/src/modules/system/NotFoundPage.vue`

- [ ] **步骤 1：编写纯路由决策失败测试**

```ts
it('未登录访问受保护页面时跳转登录', () => {
  expect(resolveAccess(null, ['platform:read'], '/platform/overview')).toEqual({ name: 'login', query: { redirect: '/platform/overview' } })
})

it('权限不匹配时跳转无权限页', () => {
  expect(resolveAccess(tenantSession, ['platform:read'], '/platform/overview')).toEqual({ name: 'forbidden' })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin test -- src/router/guard.test.ts`

预期：FAIL，提示 `resolveAccess` 未定义。

- [ ] **步骤 3：实现路由元数据和守卫**

路由元数据使用 `requiresAuth?: boolean` 与 `permissions?: Permission[]`。`resolveAccess` 返回 `true`、登录跳转对象或无权限跳转对象；全局守卫只读取 auth store，不读写 token。

- [ ] **步骤 4：实现分域导航布局**

左侧按“平台域”和“租户域”分组，仅显示当前会话拥有权限的入口；顶部显示当前身份和退出按钮。所有导航元素支持键盘操作，图标按钮提供 `aria-label`。

- [ ] **步骤 5：实现页面四态**

平台概览和租户空间页使用本地异步加载函数，展示 loading、error、empty、success 四种状态；示例状态由页面内明确的演示切换控件驱动，不进入 Pinia。

- [ ] **步骤 6：运行单测、类型检查和构建**

运行：`pnpm --filter @saasbase/admin test -- src/router/guard.test.ts && pnpm --filter @saasbase/admin typecheck && pnpm --filter @saasbase/admin build`

预期：全部 PASS，构建退出码为 0。

- [ ] **步骤 7：提交路由与页面**

```bash
git add apps/admin/src/router apps/admin/src/layouts apps/admin/src/modules/platform apps/admin/src/modules/tenant apps/admin/src/modules/system
git commit -m "feat: 添加管理端分域导航与权限路由"
```

## 任务 6：以 TDD 创建 client uni-app 骨架

**文件：**
- 创建：`apps/client/package.json`
- 创建：`apps/client/tsconfig.json`
- 创建：`apps/client/vite.config.ts`
- 创建：`apps/client/src/env.d.ts`
- 创建：`apps/client/src/main.ts`
- 创建：`apps/client/src/App.vue`
- 创建：`apps/client/src/manifest.json`
- 创建：`apps/client/src/pages.json`
- 创建：`apps/client/src/auth/auth.adapter.ts`
- 创建：`apps/client/src/auth/auth.adapter.test.ts`
- 创建：`apps/client/src/pages/login/index.vue`
- 创建：`apps/client/src/pages/home/index.vue`
- 创建：`apps/client/src/styles/tokens.scss`

- [ ] **步骤 1：创建 client 包配置与认证失败测试**

声明 `@dcloudio/uni-app`、`@dcloudio/vite-plugin-uni`、Vue 和 `@saasbase/shared`。测试 adapter 使用 `tenant/demo123` 返回 tenant 会话，错误输入拒绝，`clearSession()` 清空内存会话。

- [ ] **步骤 2：运行 adapter 测试验证失败**

运行：`pnpm --filter @saasbase/client test -- src/auth/auth.adapter.test.ts`

预期：FAIL，提示 `auth.adapter` 不存在。

- [ ] **步骤 3：实现平台无关的认证适配器**

adapter 内部维护模块级 `AuthSession | null`，暴露 `login()`、`getSession()`、`clearSession()`；不使用 `window`、`localStorage` 或自定义 Header。

- [ ] **步骤 4：创建 uni-app 入口和页面清单**

`pages.json` 注册登录页为首页、业务首页为第二页；`manifest.json` 使用非生产示例标识，不包含密钥、生产地址或个人账号。

- [ ] **步骤 5：实现登录页与首页**

登录页使用 uni-app 基础表单组件和触控友好的最小 44px 操作区域，显示 loading 和 `role` 等价的可读错误文本。登录成功使用 `uni.reLaunch` 进入首页；首页提供 loading、empty、error、success 四态演示和退出入口。

- [ ] **步骤 6：运行测试、类型检查和 H5 构建**

运行：`pnpm --filter @saasbase/client test && pnpm --filter @saasbase/client typecheck && pnpm --filter @saasbase/client build:h5`

预期：全部 PASS，生成 client H5 构建产物。

- [ ] **步骤 7：提交 client 应用**

```bash
git add apps/client package.json pnpm-lock.yaml
git commit -m "feat: 创建用户端跨端应用"
```

## 任务 7：添加 admin Playwright 关键流程

**文件：**
- 创建：`apps/admin/playwright.config.ts`
- 创建：`apps/admin/e2e/auth.spec.ts`
- 修改：`apps/admin/package.json`

- [ ] **步骤 1：编写 E2E 测试**

覆盖未登录访问平台页跳转登录、平台账号进入平台概览、租户账号直接访问平台页进入无权限页、退出后返回登录页。

```ts
test('租户管理员不能访问平台域', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('用户名').fill('tenant')
  await page.getByLabel('密码').fill('demo123')
  await page.getByRole('button', { name: '登录' }).click()
  await page.goto('/platform/overview')
  await expect(page.getByRole('heading', { name: '无权访问' })).toBeVisible()
})
```

- [ ] **步骤 2：安装 Playwright 浏览器并运行测试**

运行：`pnpm exec playwright install chromium && pnpm --filter @saasbase/admin test:e2e`

预期：4 个关键流程全部 PASS；失败时保留 trace，不提交测试报告。

- [ ] **步骤 3：提交 E2E 配置和测试**

```bash
git add apps/admin/playwright.config.ts apps/admin/e2e apps/admin/package.json pnpm-lock.yaml
git commit -m "test: 覆盖管理端认证与权限流程"
```

## 任务 8：补充中文使用文档并完成全量验证

**文件：**
- 创建：`README.md`
- 修改：`package.json`（仅在实际脚本与文档不一致时）

- [ ] **步骤 1：编写中文 README**

文档包含 Node.js 与 pnpm 前置要求、`pnpm install`、admin/client H5 启动命令、两个模拟账号、四个质量命令、目录边界和“模拟认证不可用于生产”的明确说明。

- [ ] **步骤 2：扫描安全与边界问题**

运行：`rg -n "localStorage|sessionStorage|v-html|X-Tenant-Id|tenant_id|\bany\b" apps packages --glob '!**/*.test.ts'`

预期：没有 token 持久化、`v-html`、擅自添加租户 Header/参数或显式 `any`；若命中说明文本，逐项人工确认不是实现违规。

- [ ] **步骤 3：运行全量质量门禁**

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e
```

预期：五条命令全部退出码为 0。

- [ ] **步骤 4：检查工作区变更范围**

运行：`git status --short && git diff --stat`

预期：只包含本计划定义的文件；不得覆盖用户现有的 `CLAUDE.md` 工作区修改。

- [ ] **步骤 5：提交文档与最终调整**

提交前向用户展示变更摘要；只暂存 README 和本任务必要调整。

```bash
git add README.md package.json
git commit -m "docs: 补充前端项目使用说明"
```

- [ ] **步骤 6：请求代码审查**

使用 superpowers:requesting-code-review 审查规格覆盖、权限边界、安全约束和验证输出；修复必须修复项后重新运行受影响命令。
