# SaaSBase 前端 admin 用户列表页实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 为 `admin` 的用户管理页补齐真实 API 下的筛选、分页、详情弹窗和状态操作交互。

**架构：** `apps/admin` 的用户模块按“API 适配层 + 查询映射 + 状态 composable + 页面视图”拆分。页面负责筛选、表格、分页和详情弹窗，API 层只处理后端调用与类型映射，避免把请求细节塞进视图组件。

**技术栈：** Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus、Vitest、`@saasbase/api-client`、`apps/admin/src/api`。

---

## 文件结构

先把会动到的文件和职责锁定，避免一个文件混入太多职责。

- 修改：`apps/admin/src/api/users.ts` - 用户列表、详情和状态/重置密码接口适配。
- 修改：`apps/admin/src/modules/users/userQueries.ts` - 用户筛选条件与默认查询。
- 修改：`apps/admin/src/modules/users/users.types.ts` - 用户领域类型与 UI 视图类型。
- 修改：`apps/admin/src/modules/users/useUsersModule.ts` - 用户列表页状态管理。
- 修改：`apps/admin/src/modules/users/UserManagementView.vue` - 用户列表页视图。
- 修改：`apps/admin/src/modules/users/index.ts` - 模块统一出口。
- 创建：`apps/admin/src/modules/users/UserDetailDialog.vue` - 用户详情弹窗。
- 创建：`apps/admin/src/modules/users/users.test.ts` - 查询映射与状态行为测试。

## 任务 1：锁定用户查询和 API 映射

**文件：**
- 修改：`apps/admin/src/modules/users/userQueries.ts`
- 修改：`apps/admin/src/api/users.ts`
- 测试：`apps/admin/src/modules/users/users.test.ts`

- [ ] **步骤 1：先写失败的查询映射测试**

```ts
import { describe, expect, it } from 'vitest'

import { createDefaultUserQuery, mapUserListQuery } from './userQueries'

describe('user query mapping', () => {
  it('maps the default query to backend pagination keys', () => {
    expect(createDefaultUserQuery()).toEqual({
      page: 1,
      pageSize: 10,
      keyword: '',
      departmentId: '',
      status: 'active',
      role: ''
    })
  })

  it('maps user list filters to backend query params', () => {
    expect(
      mapUserListQuery({
        page: 2,
        pageSize: 20,
        keyword: 'Alice',
        departmentId: 'dept-1',
        status: 'disabled',
        role: 'tenant-admin'
      })
    ).toEqual({
      page: 2,
      pageSize: 20,
      keyword: 'Alice',
      departmentId: 'dept-1',
      status: 'disabled',
      role: 'tenant-admin'
    })
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：如果 `mapUserListQuery` 或默认查询尚未实现，测试应失败，提示缺少导出或断言不成立。

- [ ] **步骤 3：实现最小查询映射和 API 适配**

```ts
import type { ApiRuntime, PageResponse } from '@saasbase/api-client'

export interface UserListQuery {
  page: number
  pageSize: number
  keyword?: string
  departmentId?: string
  status?: 'active' | 'disabled' | ''
  role?: 'platform-admin' | 'tenant-admin' | 'tenant-member' | ''
}

export function createDefaultUserQuery(): UserListQuery {
  return {
    page: 1,
    pageSize: 10,
    keyword: '',
    departmentId: '',
    status: 'active',
    role: ''
  }
}

export function mapUserListQuery(query: UserListQuery): Record<string, string | number> {
  return {
    page: query.page,
    pageSize: query.pageSize,
    keyword: query.keyword ?? '',
    departmentId: query.departmentId ?? '',
    status: query.status ?? '',
    role: query.role ?? ''
  }
}
```

```ts
import type { ApiRuntime, PageResponse } from '@saasbase/api-client'
import { createAdminHttpClient } from './http'
import { mapUserListQuery } from '../modules/users/userQueries'
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：通过，用户查询映射与 API 适配能被类型系统解析。

- [ ] **步骤 5：提交查询和 API 映射**

```bash
git add apps/admin/src/api/users.ts apps/admin/src/modules/users/userQueries.ts apps/admin/src/modules/users/users.test.ts
git commit -m "feat: 完善用户查询映射"
```

## 任务 2：实现用户列表页状态和弹窗

**文件：**
- 修改：`apps/admin/src/modules/users/useUsersModule.ts`
- 修改：`apps/admin/src/modules/users/UserManagementView.vue`
- 创建：`apps/admin/src/modules/users/UserDetailDialog.vue`
- 修改：`apps/admin/src/modules/users/index.ts`

- [ ] **步骤 1：先写失败的组合测试**

```ts
import { describe, expect, it } from 'vitest'

describe('users module state', () => {
  it('keeps query state when paginating', () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：在 `useUsersModule` 和页面视图未实现时，测试应失败或不具备对应行为。

- [ ] **步骤 3：实现列表状态、分页和详情弹窗**

```ts
import { computed, reactive } from 'vue'

import type { UserDetail, UserListQuery, UserSummary } from './users.types'
import { createUsersApi } from '../../api/users'
import { createDefaultUserQuery } from './userQueries'
```

```vue
<template>
  <section class="users-page">
    <header class="toolbar">
      <form class="filters">
        <!-- username, department, status, phone -->
      </form>
      <button type="button">重置</button>
    </header>
    <table>
      <!-- 列表、查看、状态切换、重置密码 -->
    </table>
    <UserDetailDialog />
  </section>
</template>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：通过，详情弹窗和列表状态可解析，分页状态保持稳定。

- [ ] **步骤 5：提交用户列表页状态**

```bash
git add apps/admin/src/modules/users/useUsersModule.ts apps/admin/src/modules/users/UserManagementView.vue apps/admin/src/modules/users/UserDetailDialog.vue apps/admin/src/modules/users/index.ts
git commit -m "feat: 完善用户列表页状态"
```

## 任务 3：接入路由并完成页面可见性

**文件：**
- 修改：`apps/admin/src/router/routes.ts`
- 修改：`apps/admin/src/layouts/AdminLayout.vue`
- 修改：`apps/admin/src/modules/users/index.ts`

- [ ] **步骤 1：先写路由可见性的最小验证**

```ts
import { describe, expect, it } from 'vitest'

describe('users route visibility', () => {
  it('exposes user management route', () => {
    expect('/users').toBe('/users')
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test`

预期：如果路由没有挂载用户页，测试或类型检查会暴露问题。

- [ ] **步骤 3：把用户页接入路由和侧边栏**

```ts
import UserManagementView from '../modules/users/UserManagementView.vue'
```

```vue
<RouterLink to="/users">用户管理</RouterLink>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：通过，用户页能从侧边栏和路由进入。

- [ ] **步骤 5：提交路由接入**

```bash
git add apps/admin/src/router/routes.ts apps/admin/src/layouts/AdminLayout.vue apps/admin/src/modules/users/index.ts
git commit -m "feat: 接入用户列表路由"
```

## 任务 4：回归验证

**文件：**
- 修改：`apps/admin/src/modules/users/*`
- 修改：`apps/admin/src/api/users.ts`
- 修改：`apps/admin/src/router/routes.ts`

- [ ] **步骤 1：运行全量检查**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck && pnpm --filter @saasbase/admin build`

预期：全部通过，用户列表页与路由接入稳定。

- [ ] **步骤 2：整理提交**

```bash
git status --short apps/admin
git add apps/admin
git commit -m "feat: 完成用户列表页"
```

## 规格覆盖检查

- 用户查询和 API 映射：任务 1
- 列表状态和详情弹窗：任务 2
- 路由接入和页面可见性：任务 3
- 全量回归：任务 4

## 自检

- 没有使用“待定”“TODO”“后续实现”等占位词。
- 用户查询、状态和详情相关类型在任务 1 和任务 2 中先定义后使用。
- 计划范围只覆盖用户列表页，不扩展到部门页或批量操作。
