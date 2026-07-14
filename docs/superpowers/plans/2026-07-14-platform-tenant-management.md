# 平台租户管理 实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 在 `admin` 应用中补齐平台侧租户管理的第一版业务闭环，支持列表查询、筛选、创建、编辑、启用和停用。

**架构：** 平台租户能力集中在 `apps/admin/src/modules/platform-tenants`，页面只做展示和交互编排，列表查询和写操作由模块级 composable 负责。后端契约只通过 `apps/admin/src/api/platformTenants.ts` 适配，平台侧要求的 `operatorId` 统一从会话上下文注入，不在页面里手工拼接。

**技术栈：** Vue 3、TypeScript、Vite、Vue Router、Pinia、Vitest，UI 继续沿用当前 `admin` 的现有风格和状态管理方式。

---

## 将要修改的文件

- 创建：`apps/admin/src/api/platformTenants.ts`
- 修改：`apps/admin/src/api/index.ts`
- 修改：`apps/admin/src/router/routes.ts`
- 修改：`apps/admin/src/router/meta.d.ts`
- 修改：`apps/admin/src/router/guard.ts` 或 `apps/admin/src/router/guard.test.ts`，用于补平台权限路由验证
- 创建：`apps/admin/src/modules/platform-tenants/PlatformTenantListView.vue`
- 创建：`apps/admin/src/modules/platform-tenants/PlatformTenantDialog.vue`
- 创建：`apps/admin/src/modules/platform-tenants/usePlatformTenantsModule.ts`
- 创建：`apps/admin/src/modules/platform-tenants/platformTenants.types.ts`
- 创建：`apps/admin/src/modules/platform-tenants/platformTenants.test.ts`
- 修改：`apps/admin/src/layouts/AdminLayout.vue`，如果需要在侧边栏补平台入口
- 修改：`apps/admin/src/modules/platform/PlatformOverviewPage.vue`，如果平台入口页需要跳转或占位说明

---

### 任务 1：补平台租户 API 适配和参数映射

**文件：**
- 创建：`apps/admin/src/api/platformTenants.ts`
- 修改：`apps/admin/src/api/index.ts`
- 测试：`apps/admin/src/modules/platform-tenants/platformTenants.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { describe, expect, it } from 'vitest'

import { mapPlatformTenantListQuery } from '@/api/platformTenants'

describe('mapPlatformTenantListQuery', () => {
  it('maps pageNo and pageSize and omits empty filters', () => {
    expect(
      mapPlatformTenantListQuery({
        pageNo: 2,
        pageSize: 20,
        tenantName: 'Alpha',
        tenantCode: '',
        status: 'enabled'
      })
    ).toEqual({
      pageNo: 2,
      pageSize: 20,
      tenantName: 'Alpha',
      status: 'enabled'
    })
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin vitest run apps/admin/src/modules/platform-tenants/platformTenants.test.ts -t "maps pageNo and pageSize and omits empty filters"`
预期：失败，提示 `mapPlatformTenantListQuery` 尚未定义或导出。

- [ ] **步骤 3：编写最少实现代码**

```ts
import type { ApiRuntime, PageResponse } from '@saasbase/api-client'

import { createAdminHttpClient } from './http'

export interface PlatformTenantListQuery {
  pageNo: number
  pageSize: number
  tenantName?: string
  tenantCode?: string
  status?: 'enabled' | 'disabled'
}

export function mapPlatformTenantListQuery(query: PlatformTenantListQuery): Record<string, string | number | boolean> {
  return {
    pageNo: query.pageNo,
    pageSize: query.pageSize,
    tenantName: query.tenantName || undefined,
    tenantCode: query.tenantCode || undefined,
    status: query.status || undefined
  }
}

export function createPlatformTenantsApi(runtime?: ApiRuntime) {
  const http = createAdminHttpClient(runtime)

  return {
    list(query: PlatformTenantListQuery) {
      return http.get<PageResponse<unknown>>('/api/v1/platform/tenants', mapPlatformTenantListQuery(query))
    }
  }
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`pnpm --filter @saasbase/admin vitest run apps/admin/src/modules/platform-tenants/platformTenants.test.ts -t "maps pageNo and pageSize and omits empty filters"`
预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add apps/admin/src/api/platformTenants.ts apps/admin/src/api/index.ts apps/admin/src/modules/platform-tenants/platformTenants.test.ts
git commit -m "feat: add platform tenant api adapter"
```

---

### 任务 2：实现平台租户列表、弹窗和状态流转

**文件：**
- 创建：`apps/admin/src/modules/platform-tenants/platformTenants.types.ts`
- 创建：`apps/admin/src/modules/platform-tenants/usePlatformTenantsModule.ts`
- 创建：`apps/admin/src/modules/platform-tenants/PlatformTenantListView.vue`
- 创建：`apps/admin/src/modules/platform-tenants/PlatformTenantDialog.vue`
- 测试：`apps/admin/src/modules/platform-tenants/platformTenants.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { describe, expect, it, vi } from 'vitest'

import { usePlatformTenantsModule } from './usePlatformTenantsModule'

describe('usePlatformTenantsModule', () => {
  it('refreshes list after create and toggle actions', async () => {
    const module = usePlatformTenantsModule({
      api: {
        list: vi.fn().mockResolvedValue({
          items: [],
          total: 0,
          pageNo: 1,
          pageSize: 20
        }),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        enable: vi.fn().mockResolvedValue({}),
        disable: vi.fn().mockResolvedValue({})
      },
      getOperatorId: () => 'operator-1'
    })

    await module.loadList({ pageNo: 1, pageSize: 20 })
    await module.createTenant({ tenantName: 'Alpha', tenantCode: 'alpha' })
    await module.toggleTenantStatus('tenant-1', 'disabled')

    expect(module.state.items).toEqual([])
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin vitest run apps/admin/src/modules/platform-tenants/platformTenants.test.ts -t "refreshes list after create and toggle actions"`
预期：失败，提示 `usePlatformTenantsModule` 或其依赖方法尚未实现。

- [ ] **步骤 3：编写最少实现代码**

```ts
import { reactive } from 'vue'

import { createPlatformTenantsApi } from '@/api/platformTenants'

export function usePlatformTenantsModule(options?: {
  api?: ReturnType<typeof createPlatformTenantsApi>
  getOperatorId?: () => string
}) {
  const api = options?.api ?? createPlatformTenantsApi()

  const state = reactive({
    loading: false,
    error: null as string | null,
    query: {
      pageNo: 1,
      pageSize: 20,
      tenantName: '',
      tenantCode: '',
      status: undefined as 'enabled' | 'disabled' | undefined
    },
    items: [] as unknown[],
    total: 0,
    dialogOpen: false,
    dialogMode: 'create' as 'create' | 'edit',
    submitting: false
  })

  async function loadList(query?: Partial<typeof state.query>): Promise<void> {
    state.loading = true
    state.error = null
    state.query = { ...state.query, ...query }
    const result = await api.list(state.query)
    state.items = result.items
    state.total = result.total
    state.query.pageNo = result.pageNo
    state.query.pageSize = result.pageSize
    state.loading = false
  }

  async function createTenant(payload: { tenantName: string; tenantCode: string }): Promise<void> {
    state.submitting = true
    await api.create({ ...payload, operatorId: options?.getOperatorId?.() })
    state.submitting = false
    await loadList()
  }

  async function toggleTenantStatus(id: string, nextStatus: 'enabled' | 'disabled'): Promise<void> {
    if (nextStatus === 'enabled') {
      await api.enable(id, { operatorId: options?.getOperatorId?.() })
    } else {
      await api.disable(id, { operatorId: options?.getOperatorId?.() })
    }
    await loadList()
  }

  return { state, loadList, createTenant, toggleTenantStatus }
}
```

- [ ] **步骤 4：运行测试验证通过**

运行：`pnpm --filter @saasbase/admin vitest run apps/admin/src/modules/platform-tenants/platformTenants.test.ts -t "refreshes list after create and toggle actions"`
预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add apps/admin/src/modules/platform-tenants apps/admin/src/api/platformTenants.ts apps/admin/src/api/index.ts
git commit -m "feat: add platform tenant management module"
```

---

### 任务 3：接入路由和菜单，补浏览入口

**文件：**
- 修改：`apps/admin/src/router/routes.ts`
- 修改：`apps/admin/src/router/meta.d.ts`
- 修改：`apps/admin/src/layouts/AdminLayout.vue`
- 修改：`apps/admin/src/router/guard.test.ts` 或 `apps/admin/src/router/routeGuards.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { describe, expect, it } from 'vitest'

import { routes } from '@/router/routes'

describe('platform tenant route', () => {
  it('registers platform tenants page with platform permission', () => {
    const platformRoute = routes
      .flatMap(route => route.children ?? [])
      .find(route => route.path === 'platform/tenants')

    expect(platformRoute?.meta?.requiredPermission).toBe('platform:tenant:read')
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin vitest run apps/admin/src/router/guard.test.ts -t "registers platform tenants page with platform permission"`
预期：失败，提示路由尚未注册。

- [ ] **步骤 3：编写最少实现代码**

```ts
{
  path: 'platform/tenants',
  component: PlatformTenantListView,
  meta: { title: '平台租户管理', requiredPermission: 'platform:tenant:read' }
}
```

```vue
<RouterLink to="/platform/tenants">平台租户管理</RouterLink>
```

- [ ] **步骤 4：运行测试验证通过**

运行：`pnpm --filter @saasbase/admin vitest run apps/admin/src/router/guard.test.ts -t "registers platform tenants page with platform permission"`
预期：PASS。

- [ ] **步骤 5：Commit**

```bash
git add apps/admin/src/router/routes.ts apps/admin/src/layouts/AdminLayout.vue apps/admin/src/router/guard.test.ts apps/admin/src/router/meta.d.ts
git commit -m "feat: expose platform tenant route"
```

---

## 规格覆盖检查

- 平台租户列表页：任务 2、任务 3
- 平台租户创建弹窗：任务 2
- 平台租户编辑弹窗：任务 2
- 启用、停用确认动作：任务 2
- 平台租户 API 适配：任务 1
- 列表、表单和操作状态：任务 2
- 路由和权限入口：任务 3
- 列表失败、表单失败、启停用失败：任务 2

## 占位符检查

计划中未使用 `TODO`、`待定`、`后续实现`、`类似任务 N` 等占位表达。

## 类型一致性检查

- 列表查询统一使用 `pageNo`、`pageSize`
- 平台侧写操作统一注入 `operatorId`
- 页面层路由统一使用 `platform:tenant:read`
- 计划中所有后续任务都复用了同一组方法名和状态字段
