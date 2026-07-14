# admin 工作台收口实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `admin` 的 `/dashboard` 做成真实可用的工作台首页，并把 `/platform/overview` 收口为迁移说明页。

**架构：** 保持现有 `admin` 布局和认证守卫不动，只在 `dashboard` 模块内重新组织首页内容，在 `platform` 模块内替换演示型概览页。首页继续从 `auth` 会话读取角色、租户和权限，快捷入口只展示当前确实可访问的主链路。

**技术栈：** Vue 3、TypeScript、Vue Router、Pinia、Vitest

---

## 文件职责

- 修改 `apps/admin/src/modules/dashboard/DashboardHome.vue`：把首页改成会话摘要、快捷入口和状态说明三段式工作台。
- 修改 `apps/admin/src/modules/dashboard/dashboard.data.ts`：收敛首页文案与快捷入口定义，移除不再适合首页的占位描述。
- 修改 `apps/admin/src/modules/dashboard/index.ts`：保持模块导出与页面结构一致。
- 修改 `apps/admin/src/modules/platform/PlatformOverviewPage.vue`：替换演示按钮为迁移说明页。
- 修改 `apps/admin/src/router/routes.ts`：确保 `/dashboard` 仍是默认落点，`/platform/overview` 保留为兼容路由且文案一致。
- 修改 `apps/admin/src/modules/dashboard/DashboardHome.vue` 的测试文件：覆盖渲染、权限入口显示和空状态说明。
- 修改 `apps/admin/src/modules/platform/platform.test.ts`：覆盖迁移说明页文案和入口行为。

## 任务 1：重做工作台首页结构

**文件：**
- 修改：`apps/admin/src/modules/dashboard/DashboardHome.vue`
- 修改：`apps/admin/src/modules/dashboard/dashboard.data.ts`
- 测试：`apps/admin/src/modules/dashboard/dashboard.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { describe, expect, it } from 'vitest'

import { dashboardShortcuts } from './dashboard.data'

describe('dashboard data', () => {
  it('only exposes the usable primary shortcuts', () => {
    expect(dashboardShortcuts.map(item => item.title)).toEqual(['用户管理', '部门管理', '文件管理'])
  })
})
```

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import DashboardHome from './DashboardHome.vue'

describe('DashboardHome', () => {
  it('renders a session summary and shortcut section', () => {
    const wrapper = mount(DashboardHome)

    expect(wrapper.text()).toContain('租户工作台')
    expect(wrapper.text()).toContain('快捷入口')
    expect(wrapper.text()).toContain('工作台首页')
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin test -- dashboard.test.ts`
预期：失败，原因是首页仍然保留旧的占位叙事或测试文件未通过。

- [ ] **步骤 3：编写最少实现代码**

```vue
<template>
  <section class="dashboard">
    <div class="hero card">
      <div class="hero-copy">
        <p class="eyebrow">租户工作台</p>
        <h1>管理入口已经就绪</h1>
        <p class="lead">这里展示当前会话、当前租户和可访问模块，后续只补真实数据，不再堆演示内容。</p>
      </div>

      <aside class="session card">
        <div class="session-row">
          <span>当前租户</span>
          <strong>{{ tenantName }}</strong>
        </div>
        <div class="session-row">
          <span>当前角色</span>
          <strong>{{ roleLabel }}</strong>
        </div>
        <div class="session-row">
          <span>当前用户</span>
          <strong>{{ session?.userId ?? '未登录' }}</strong>
        </div>
        <div class="session-row">
          <span>权限数量</span>
          <strong>{{ session?.permissions.length ?? 0 }}</strong>
        </div>
      </aside>
    </div>

    <div class="shortcuts card">
      <div class="section-title">
        <h2>快捷入口</h2>
        <p>仅显示当前可访问的主链路。</p>
      </div>

      <div class="shortcut-grid">
        <button
          v-for="item in visibleShortcuts"
          :key="item.title"
          class="shortcut"
          type="button"
          @click="$router.push(item.path)"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </button>
      </div>
    </div>

    <div class="card note">
      <p>工作台首页不再承担平台概览或演示切换功能。</p>
    </div>
  </section>
</template>
```

```ts
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { dashboardShortcuts } from './dashboard.data'
import { useAuthStore } from '../auth/auth.store'

const authStore = useAuthStore()
const { session, tenantName } = storeToRefs(authStore)

const roleLabel = computed(() => {
  switch (session.value?.role) {
    case 'platform-admin':
      return '平台管理员'
    case 'tenant-admin':
      return '租户管理员'
    case 'tenant-member':
      return '租户成员'
    default:
      return '未登录'
  }
})

const visibleShortcuts = computed(() =>
  dashboardShortcuts.filter(item => {
    if (!session.value) return false
    return session.value.permissions.includes(item.permission)
  })
)
```

- [ ] **步骤 4：运行测试验证通过**

运行：`pnpm --filter @saasbase/admin test -- dashboard.test.ts`
预期：PASS，首页文本、快捷入口和权限过滤都符合预期。

- [ ] **步骤 5：Commit**

```bash
git add apps/admin/src/modules/dashboard/DashboardHome.vue apps/admin/src/modules/dashboard/dashboard.data.ts apps/admin/src/modules/dashboard/dashboard.test.ts
git commit -m "feat: 收口工作台首页"
```

## 任务 2：迁移平台概览页

**文件：**
- 修改：`apps/admin/src/modules/platform/PlatformOverviewPage.vue`
- 测试：`apps/admin/src/modules/platform/platform.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import PlatformOverviewPage from './PlatformOverviewPage.vue'

describe('PlatformOverviewPage', () => {
  it('shows migration copy instead of demo toggles', () => {
    const wrapper = mount(PlatformOverviewPage)

    expect(wrapper.text()).toContain('平台概览已收口到平台租户管理')
    expect(wrapper.text()).not.toContain('重新检查')
    expect(wrapper.text()).not.toContain('提示')
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin test -- platform.test.ts`
预期：失败，因为页面仍然存在演示切换按钮。

- [ ] **步骤 3：编写最少实现代码**

```vue
<template>
  <section class="platform-overview">
    <h1>平台概览</h1>
    <p>平台概览已收口到平台租户管理，请直接从侧边栏进入平台租户页面。</p>
  </section>
</template>
```

- [ ] **步骤 4：运行测试验证通过**

运行：`pnpm --filter @saasbase/admin test -- platform.test.ts`
预期：PASS，页面只保留迁移说明文本。

- [ ] **步骤 5：Commit**

```bash
git add apps/admin/src/modules/platform/PlatformOverviewPage.vue apps/admin/src/modules/platform/platform.test.ts
git commit -m "feat: 收口平台概览页"
```

## 任务 3：对齐路由与默认落点

**文件：**
- 修改：`apps/admin/src/router/routes.ts`
- 测试：`apps/admin/src/router/guard.test.ts`

- [ ] **步骤 1：编写失败的测试**

```ts
import { describe, expect, it } from 'vitest'

import { routes } from './routes'

describe('routes', () => {
  it('keeps dashboard as the default landing page', () => {
    expect(routes[0].redirect).toBe('/dashboard')
  })
})
```

- [ ] **步骤 2：运行测试验证失败**

运行：`pnpm --filter @saasbase/admin test -- guard.test.ts`
预期：失败或未覆盖默认落点断言。

- [ ] **步骤 3：编写最少实现代码**

```ts
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: 'dashboard',
        component: DashboardHome,
        meta: { title: '租户工作台', requiredPermission: 'tenant:profile:read' }
      },
      {
        path: 'platform/overview',
        component: PlatformOverviewPage,
        meta: { title: '平台概览', publicAccess: true }
      }
    ]
  }
]
```

- [ ] **步骤 4：运行测试验证通过**

运行：`pnpm --filter @saasbase/admin test -- guard.test.ts`
预期：PASS，默认落点仍然是 `/dashboard`。

- [ ] **步骤 5：Commit**

```bash
git add apps/admin/src/router/routes.ts apps/admin/src/router/guard.test.ts
git commit -m "feat: 对齐工作台路由"
```

## 任务 4：回归验证

**文件：**
- 无新增文件

- [ ] **步骤 1：运行受影响测试**

运行：

```bash
pnpm --filter @saasbase/admin test
pnpm --filter @saasbase/admin typecheck
```

预期：`dashboard`、`platform`、`router` 相关测试全部通过，类型检查无新增错误。

- [ ] **步骤 2：人工检查首页文本**

运行应用后确认：

- `/dashboard` 首屏能说明当前会话、当前租户和快捷入口
- `/platform/overview` 只显示迁移说明
- 侧边栏和顶部栏不需要因为这次变更改造

- [ ] **步骤 3：Commit**

```bash
git add docs/superpowers/plans/2026-07-14-admin-dashboard-retirement.md
git commit -m "docs: 补充工作台收口计划"
```

## 自检

- 覆盖度：规格中的首页收口、迁移说明、路由默认落点和测试要求都对应到任务 1-4。
- 占位符扫描：未使用“待定”“TODO”“后续实现”等占位说法。
- 类型一致性：计划中引用的 `dashboardShortcuts`、`session`、`tenantName`、`routes`、`PlatformOverviewPage` 与现有代码命名保持一致。
- 范围检查：计划没有把布局重构、权限守卫或其他业务页混进来，仍可由一条实现计划完成。
