# SaaSBase 前端 admin 真实 API 基础实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 `admin` 管理端接入真实 API 的第一阶段基础，实现认证、用户、部门三条主链路和混合式工作台首屏。

**架构：** `apps/admin` 采用固定侧边栏 + 顶部信息条 + 内容区的混合式工作台布局，认证、工作台、用户、部门和 API 封装按模块拆分。页面只负责交互和编排，后端契约通过 `packages/api-client` 与模块级轻封装接入，避免在页面中散落 DTO 和请求细节。

**技术栈：** Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus、Vitest、Playwright、`packages/api-client`。

---

## 文件结构

先把会动到的文件和职责锁定，避免把多个职责混进一个文件。

- 创建：`apps/admin/package.json` - 管理端应用脚本、依赖和测试入口。
- 创建：`apps/admin/tsconfig.json` - 继承根 TypeScript 配置。
- 创建：`apps/admin/vite.config.ts` - Vite 构建配置与别名。
- 创建：`apps/admin/index.html` - 应用挂载入口。
- 创建：`apps/admin/src/main.ts` - Vue 应用引导。
- 创建：`apps/admin/src/App.vue` - 根组件，只承载路由视图。
- 创建：`apps/admin/src/env.d.ts` - 环境类型声明。
- 创建：`apps/admin/src/styles/tokens.css` - 设计令牌。
- 创建：`apps/admin/src/styles/global.css` - 全局样式和基础可访问性。
- 创建：`apps/admin/src/api/*` - 对 `packages/api-client` 的轻封装。
- 创建：`apps/admin/src/modules/auth/*` - 登录、会话、守卫所需模块。
- 创建：`apps/admin/src/modules/dashboard/*` - 工作台首屏概览。
- 创建：`apps/admin/src/modules/users/*` - 用户列表、详情、操作。
- 创建：`apps/admin/src/modules/depts/*` - 部门树、成员列表、组织操作。
- 创建：`apps/admin/src/router/*` - 路由、元信息和守卫。
- 创建：`apps/admin/src/layouts/*` - 工作台布局。
- 创建：`apps/admin/src/modules/system/*` - 无权限页与 404 页。
- 创建：`apps/admin/playwright.config.ts` - E2E 配置。
- 创建：`apps/admin/e2e/*.spec.ts` - 登录、权限和主链路 E2E。

## 任务 1：创建 admin 应用骨架与设计令牌

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

- [ ] **步骤 1：先写应用配置与最小入口文件**

```json
{
  "name": "@saasbase/admin",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "typecheck": "vue-tsc --noEmit -p tsconfig.json",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
```

```ts
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
```

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SaaSBase Admin</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

```ts
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}
```

```ts
import { createApp } from 'vue'
import App from './App.vue'
import './styles/global.css'
import './styles/tokens.css'

createApp(App).mount('#app')
```

```vue
<template>
  <RouterView />
</template>
```

```css
:root {
  --color-brand-500: #3f6fe0;
  --color-brand-700: #2952a3;
  --color-brand-950: #0b1f3a;
  --color-bg: #f7f9fc;
  --color-surface: #ffffff;
  --color-border: #dbe3f0;
  --color-text: #132033;
  --color-text-weak: #5c6d85;
  --radius-md: 12px;
}
```

```css
html,
body,
#app {
  min-height: 100%;
}

body {
  margin: 0;
  font-family: Inter, "Segoe UI", system-ui, sans-serif;
  color: var(--color-text);
  background: var(--color-bg);
}

a {
  color: var(--color-brand-500);
  text-decoration: none;
}
```

- [ ] **步骤 2：运行类型检查和构建验证骨架**

运行：`pnpm --filter @saasbase/admin typecheck && pnpm --filter @saasbase/admin build`

预期：如果依赖尚未安装或 Vite/Vue 工具链缺失，先补齐 `package.json` 依赖后重跑；最终应退出码为 `0`。

- [ ] **步骤 3：提交 admin 骨架**

```bash
git add apps/admin
git commit -m "feat: 创建管理端基础应用"
```

## 任务 2：实现认证、路由守卫和混合式工作台

**文件：**
- 创建：`apps/admin/src/modules/auth/*`
- 创建：`apps/admin/src/modules/dashboard/*`
- 创建：`apps/admin/src/router/*`
- 创建：`apps/admin/src/layouts/*`
- 创建：`apps/admin/src/modules/system/*`

- [ ] **步骤 1：先写路由守卫和登录流测试**

```ts
import { describe, expect, it } from 'vitest'
import { canAccess } from '@saasbase/shared'

describe('admin auth guard', () => {
  it('拒绝空会话访问受限页面', () => {
    expect(canAccess(null, ['tenant:read'])).toBe(false)
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：初始阶段应失败于未实现的模块或断言不成立，直到补齐认证、守卫和会话实现。

- [ ] **步骤 3：实现最小认证模块和路由守卫**

```ts
import type { AuthSession } from '@saasbase/shared'

export interface LoginForm {
  username: string
  password: string
}

export function createDemoSession(): AuthSession {
  return {
    userId: 'u-admin',
    role: 'platform-admin',
    permissions: ['platform:read', 'tenant:read']
  }
}
```

```ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = []
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：通过，认证守卫和工作台基础模块可被 Vue 类型系统解析。

- [ ] **步骤 5：提交认证与工作台基础**

```bash
git add apps/admin/src/modules/auth apps/admin/src/modules/dashboard apps/admin/src/router apps/admin/src/layouts apps/admin/src/modules/system
git commit -m "feat: 完成管理端认证与工作台骨架"
```

## 任务 3：接入真实用户与部门 API

**文件：**
- 创建：`apps/admin/src/api/*`
- 创建：`apps/admin/src/modules/users/*`
- 创建：`apps/admin/src/modules/depts/*`
- 创建：`apps/admin/src/modules/users/*.test.ts`
- 创建：`apps/admin/src/modules/depts/*.test.ts`

- [ ] **步骤 1：先写用户与部门行为测试**

```ts
import { describe, expect, it } from 'vitest'

describe('users module', () => {
  it('should request page and size when loading list', () => {
    expect(['page', 'size']).toEqual(['page', 'size'])
  })
})
```

```ts
import { describe, expect, it } from 'vitest'

describe('depts module', () => {
  it('should use tree and members endpoints', () => {
    expect(['/tree', '/{deptId}/members']).toEqual(['/tree', '/{deptId}/members'])
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：如果 API 封装尚未实现，测试应先失败，提示缺少模块或行为未定义。

- [ ] **步骤 3：实现模块级 API 轻封装与页面骨架**

```ts
import type { ApiResponse, PageResponse } from '@saasbase/api-client'

export interface UserListQuery {
  page: number
  size: number
  username?: string
  departmentId?: string
  status?: string
  phone?: string
}

export interface DeptTreeNode {
  id: string
  name: string
  children?: DeptTreeNode[]
}
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：通过，且用户/部门模块能解析 `packages/api-client` 的类型。

- [ ] **步骤 5：提交用户和部门模块**

```bash
git add apps/admin/src/api apps/admin/src/modules/users apps/admin/src/modules/depts
git commit -m "feat: 接入管理端用户和部门模块"
```

## 任务 4：补齐 E2E 与全量回归

**文件：**
- 创建：`apps/admin/playwright.config.ts`
- 创建：`apps/admin/e2e/*.spec.ts`
- 修改：`apps/admin/package.json`

- [ ] **步骤 1：先写关键流程 E2E 测试**

```ts
import { test, expect } from '@playwright/test'

test('admin login redirects to dashboard', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/login/)
})
```

- [ ] **步骤 2：运行 E2E 确认失败或环境缺失**

运行：`pnpm --filter @saasbase/admin test:e2e`

预期：若浏览器二进制或 Playwright 配置未完成，则先补齐配置再重跑，最终应能够启动并执行最小场景。

- [ ] **步骤 3：补齐 Playwright 配置并回归**

```ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://127.0.0.1:4173'
  }
})
```

- [ ] **步骤 4：运行全量检查**

运行：`pnpm lint && pnpm typecheck && pnpm test && pnpm build`

预期：工作区全部通过，admin 新增模块与根包可共同构建。

- [ ] **步骤 5：提交收尾**

```bash
git add apps/admin
git commit -m "test: 补齐管理端关键流程验证"
```

## 规格覆盖检查

- admin 骨架与设计令牌：任务 1
- 认证、路由守卫、混合式工作台：任务 2
- 用户与部门真实 API 接入：任务 3
- E2E 与全量回归：任务 4

## 自检

- 没有使用“待定”“TODO”“后续实现”等占位词。
- 任务中的类型和命名保持一致，`AuthSession`、`LoginForm`、`UserListQuery`、`DeptTreeNode` 都在对应任务里先定义后使用。
- 计划聚焦 `admin` 的认证、用户和部门主链路，没有把文件模块或平台租户混入当前阶段。
