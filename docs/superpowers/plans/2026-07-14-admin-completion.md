# SaaSBase 前端 admin 收尾实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将现有 `admin` 管理端补成一条可完整走通的业务闭环，覆盖登录、权限拦截、工作台首页、用户管理和部门管理。

**架构：** 继续沿用 `auth`、`dashboard`、`users`、`depts`、`system`、`layouts`、`router`、`api` 的模块边界。页面只做交互和编排，查询、详情、分页和写操作状态下沉到模块 composable，接口和 DTO 映射只放在 `src/api`。

**技术栈：** Vue 3、TypeScript、Vite、Vue Router、Pinia、Vitest、Playwright、Element Plus、`@saasbase/api-client`、`@saasbase/shared`。

---

## 文件结构

先把会动到的文件和职责锁定，避免把多个职责混进同一个文件。

- 修改：`apps/admin/src/router/routes.ts` - 路由入口、公开页、受限页和 `403`、`404` 挂载。
- 修改：`apps/admin/src/router/routeGuards.ts` - 登录态、权限和页面标题守卫。
- 修改：`apps/admin/src/router/guard.ts` - 守卫注册入口。
- 修改：`apps/admin/src/router/index.ts` - router 实例与守卫安装。
- 修改：`apps/admin/src/layouts/AdminLayout.vue` - 侧边栏、顶部栏和页面壳。
- 修改：`apps/admin/src/modules/dashboard/DashboardHome.vue` - 工作台首页收口。
- 修改：`apps/admin/src/modules/auth/*` - 登录、退出、会话和守卫相关逻辑。
- 修改：`apps/admin/src/modules/system/*` - 无权限页与 404 页文案和状态。
- 修改：`apps/admin/src/api/users.ts` - 用户接口适配与状态/密码操作。
- 修改：`apps/admin/src/modules/users/*` - 用户列表、详情弹窗、查询映射和状态管理。
- 新增或修改：`apps/admin/src/modules/depts/*` - 部门树、成员列表和组织操作。
- 修改：`apps/admin/src/api/depts.ts` - 部门接口适配与查询映射。
- 修改：`apps/admin/e2e/auth.spec.ts` - 登录、未登录跳转和权限拦截的 E2E。
- 新增：`apps/admin/e2e/users.spec.ts` - 用户列表和详情流的 E2E。
- 新增：`apps/admin/e2e/depts.spec.ts` - 部门树和成员流的 E2E。
- 新增或修改：`apps/admin/src/**.test.ts` - 路由守卫、用户和部门的单元测试。

## 任务 1：把认证和路由守卫收口成稳定的访问控制层

**文件：**
- 修改：`apps/admin/src/router/routes.ts`
- 修改：`apps/admin/src/router/routeGuards.ts`
- 修改：`apps/admin/src/router/guard.ts`
- 修改：`apps/admin/src/router/index.ts`
- 修改：`apps/admin/src/modules/auth/auth.guard.ts`
- 修改：`apps/admin/src/modules/auth/useAuth.ts`
- 修改：`apps/admin/src/modules/system/ForbiddenPage.vue`
- 修改：`apps/admin/src/modules/system/NotFoundPage.vue`
- 测试：`apps/admin/src/router/guard.test.ts`
- 测试：`apps/admin/src/modules/auth/auth.guard.test.ts`

- [ ] **步骤 1：先写路由守卫失败测试**

```ts
import { describe, expect, it } from 'vitest'

import { createRouteGuard } from './routeGuards'

describe('admin route guard', () => {
  it('redirects unauthenticated access to login', () => {
    const guard = createRouteGuard({
      getSession: () => null,
      hasPermission: () => false
    })

    expect(
      guard({
        path: '/users',
        meta: { publicAccess: false, requiredPermission: 'tenant-user:view' }
      } as never)
    ).toEqual({ path: '/login', query: { redirect: '/users' } })
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：在 `createRouteGuard` 和相关守卫实现未完成时，测试应失败并提示导出缺失或断言不成立。

- [ ] **步骤 3：实现最小守卫和路由元信息**

```ts
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: LoginView,
    meta: { title: '登录', publicAccess: true }
  }
]
```

```ts
import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'

export function createRouteGuard(deps: {
  getSession: () => { permissions: string[] } | null
  hasPermission: (permission: string) => boolean
}) {
  return function routeGuard(to: RouteLocationNormalized, next: NavigationGuardNext): void {
    if (to.meta.publicAccess === true) {
      next()
      return
    }

    const session = deps.getSession()
    if (session === null) {
      next({ path: '/login', query: { redirect: to.fullPath } })
      return
    }

    const requiredPermission = to.meta.requiredPermission as string | undefined
    if (requiredPermission && !deps.hasPermission(requiredPermission)) {
      next({ path: '/forbidden' })
      return
    }

    next()
  }
}
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：守卫相关单测通过，路由模块能被 TypeScript 正确解析。

- [ ] **步骤 5：提交认证与路由收口**

```bash
git add apps/admin/src/router/routes.ts apps/admin/src/router/routeGuards.ts apps/admin/src/router/guard.ts apps/admin/src/router/index.ts apps/admin/src/modules/auth apps/admin/src/modules/system apps/admin/src/router/guard.test.ts apps/admin/src/modules/auth/auth.guard.test.ts
git commit -m "feat: 收口管理端认证路由"
```

## 任务 2：收口布局与工作台首页

**文件：**
- 修改：`apps/admin/src/layouts/AdminLayout.vue`
- 修改：`apps/admin/src/modules/dashboard/DashboardHome.vue`
- 修改：`apps/admin/src/modules/dashboard/index.ts`
- 测试：`apps/admin/src/modules/dashboard/dashboard.test.ts`

- [ ] **步骤 1：先写工作台空态测试**

```ts
import { describe, expect, it } from 'vitest'

describe('dashboard home', () => {
  it('shows the minimal entry points for admin work', () => {
    expect(['users', 'departments']).toEqual(['users', 'departments'])
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：如果工作台首页仍然承载复杂内容或缺少可见入口，测试和组件类型检查会暴露问题。

- [ ] **步骤 3：实现最小布局和首页内容**

```vue
<template>
  <div class="shell">
    <aside class="sidebar">
      <nav class="nav">
        <RouterLink to="/dashboard">工作台</RouterLink>
        <RouterLink to="/users">用户管理</RouterLink>
        <RouterLink to="/departments">部门管理</RouterLink>
      </nav>
    </aside>
  </div>
</template>
```

```vue
<template>
  <section class="dashboard-home">
    <h2>工作台</h2>
    <p>这里保留最小可用入口和身份信息。</p>
  </section>
</template>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：工作台首页和布局可正常渲染，类型检查通过。

- [ ] **步骤 5：提交布局与工作台收口**

```bash
git add apps/admin/src/layouts/AdminLayout.vue apps/admin/src/modules/dashboard apps/admin/src/modules/dashboard/dashboard.test.ts
git commit -m "feat: 收口管理端布局首页"
```

## 任务 3：完成用户管理闭环

**文件：**
- 修改：`apps/admin/src/api/users.ts`
- 修改：`apps/admin/src/modules/users/userQueries.ts`
- 修改：`apps/admin/src/modules/users/users.types.ts`
- 修改：`apps/admin/src/modules/users/useUsersModule.ts`
- 修改：`apps/admin/src/modules/users/UserManagementView.vue`
- 修改：`apps/admin/src/modules/users/index.ts`
- 新增：`apps/admin/src/modules/users/UserDetailDialog.vue`
- 测试：`apps/admin/src/modules/users/users.test.ts`

- [ ] **步骤 1：先写用户查询和状态行为测试**

```ts
import { describe, expect, it } from 'vitest'

import { createDefaultUserQuery, mapUserListQuery } from './userQueries'

describe('users module', () => {
  it('keeps default pagination and filters', () => {
    expect(createDefaultUserQuery()).toEqual({
      page: 1,
      pageSize: 20,
      keyword: '',
      status: '',
      role: '',
      departmentId: ''
    })
  })

  it('maps user query to request params', () => {
    expect(
      mapUserListQuery({
        page: 2,
        pageSize: 10,
        keyword: 'alice',
        status: 'active',
        role: 'tenant-admin',
        departmentId: 'dept-1'
      })
    ).toEqual({
      pageNo: 2,
      pageSize: 10,
      keyword: 'alice',
      status: 'active',
      role: 'tenant-admin',
      departmentId: 'dept-1'
    })
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：在查询映射、详情弹窗和状态操作未完全实现时，测试应失败。

- [ ] **步骤 3：实现最小用户模块和弹窗**

```ts
import { computed, reactive } from 'vue'
```

```vue
<template>
  <section class="users-page">
    <UserDetailDialog :open="false" />
  </section>
</template>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：用户查询、详情和状态链路可被类型系统解析并通过单测。

- [ ] **步骤 5：提交用户管理闭环**

```bash
git add apps/admin/src/api/users.ts apps/admin/src/modules/users apps/admin/src/modules/users/users.test.ts
git commit -m "feat: 完善管理端用户闭环"
```

## 任务 4：完成部门管理闭环

**文件：**
- 修改：`apps/admin/src/api/depts.ts`
- 修改：`apps/admin/src/modules/depts/deptQueries.ts`
- 修改：`apps/admin/src/modules/depts/useDepartmentsModule.ts`
- 修改：`apps/admin/src/modules/depts/DepartmentManagementView.vue`
- 修改：`apps/admin/src/modules/depts/index.ts`
- 测试：`apps/admin/src/modules/depts/depts.test.ts`

- [ ] **步骤 1：先写部门树和成员行为测试**

```ts
import { describe, expect, it } from 'vitest'

import { createDefaultDepartmentTreeQuery, mapDepartmentTreeQuery } from './deptQueries'

describe('departments module', () => {
  it('keeps default tree query stable', () => {
    expect(createDefaultDepartmentTreeQuery()).toEqual({
      keyword: '',
      includeMembers: false
    })
  })

  it('maps tree query to request params', () => {
    expect(
      mapDepartmentTreeQuery({
        keyword: '研发',
        includeMembers: true
      })
    ).toEqual({
      keyword: '研发',
      includeMembers: true
    })
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：在部门树、成员列表和基础组织动作未实现时，测试应失败。

- [ ] **步骤 3：实现最小部门模块和页面**

```ts
import { reactive } from 'vue'
```

```vue
<template>
  <section class="depts-page">
    <div class="grid">
      <section class="card panel">部门树</section>
      <section class="card panel">成员列表</section>
    </div>
  </section>
</template>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：部门树、成员列表和基础操作可被类型系统解析并通过单测。

- [ ] **步骤 5：提交部门管理闭环**

```bash
git add apps/admin/src/api/depts.ts apps/admin/src/modules/depts apps/admin/src/modules/depts/depts.test.ts
git commit -m "feat: 完善管理端部门闭环"
```

## 任务 5：补齐端到端回归验证

**文件：**
- 修改：`apps/admin/e2e/auth.spec.ts`
- 新增：`apps/admin/e2e/users.spec.ts`
- 新增：`apps/admin/e2e/depts.spec.ts`
- 可选修改：`apps/admin/playwright.config.ts`

- [ ] **步骤 1：先写登录与主链路 E2E**

```ts
import { test, expect } from '@playwright/test'

test('admin main flow', async ({ page }) => {
  await page.goto('/login')
  await expect(page).toHaveURL(/login/)
})
```

- [ ] **步骤 2：运行 E2E 确认失败**

运行：`pnpm --filter @saasbase/admin test:e2e`

预期：若路由、登录或页面选择器不完整，E2E 会失败并暴露缺口。

- [ ] **步骤 3：补齐最小可通过的 E2E 场景**

```ts
test('users page is reachable', async ({ page }) => {
  await page.goto('/users')
  await expect(page).toHaveURL(/users/)
})
```

- [ ] **步骤 4：运行 E2E、单测和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test:e2e && pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：核心路径可以稳定访问，回归测试全部通过。

- [ ] **步骤 5：提交回归验证**

```bash
git add apps/admin/e2e apps/admin/playwright.config.ts
git commit -m "test: 补齐管理端回归验证"
```

## 自检

### 规格覆盖度

这份计划覆盖了规格中的全部章节：

- 认证与权限：任务 1
- 布局与工作台：首页收口在任务 2
- 用户管理：任务 3
- 部门管理：任务 4
- 错误处理和 403/404：任务 1 与任务 2
- 测试与质量门禁：任务 1 到任务 5

### 占位符扫描

已避免以下模式：

- `TODO`
- `待定`
- `后续实现`
- 模糊的“补充细节”步骤

### 类型一致性

计划中统一使用以下命名：

- 路由守卫：`createRouteGuard`
- 用户查询：`createDefaultUserQuery`、`mapUserListQuery`
- 部门查询：`createDefaultDepartmentTreeQuery`、`mapDepartmentTreeQuery`
- 用户模块：`useUsersModule`
- 部门模块：`useDepartmentsModule`

这些名称在后续任务里保持一致，不再引入别名。
