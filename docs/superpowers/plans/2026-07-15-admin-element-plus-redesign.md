# SaaSBase 前端 admin Element Plus 全量改造实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将 `apps/admin` 的整体 UI 统一改造成 `Element Plus` 风格，保留现有路由、权限、API 契约和业务行为，只替换页面表达层与交互组件。

**架构：** `apps/admin` 仍按 `main.ts`、`styles`、`layouts`、`router`、`modules/*` 分层。先在入口层完成 `Element Plus` 全局注册和主题接管，再统一布局壳与系统页，最后按业务页批量替换表单、表格、弹窗、分页和反馈组件。路由、认证、权限和请求数据流不改。

**技术栈：** Vue 3、TypeScript、Vite、Vue Router、Pinia、Element Plus、`@saasbase/api-client`、`@saasbase/shared`、Vitest、Playwright。

---

## 文件结构

先把会动到的文件和职责锁定，避免把视觉、数据和路由混在一个文件里。

- 修改：`apps/admin/src/main.ts` - 注册 `Element Plus`、图标、消息服务和全局样式入口。
- 修改：`apps/admin/src/styles/global.css` - 基础 reset、字号、背景和可访问性基础样式。
- 修改：`apps/admin/src/styles/tokens.css` - 收敛品牌色、背景色、文本色与圆角变量。
- 修改：`apps/admin/src/layouts/AdminLayout.vue` - 统一管理端壳、导航、顶部栏和退出入口。
- 修改：`apps/admin/src/layouts/DomainLayout.vue` - 与 `AdminLayout` 统一视觉语言，避免双套布局。
- 修改：`apps/admin/src/modules/auth/LoginView.vue` - 登录页改造成 `Element Plus` 表单页。
- 修改：`apps/admin/src/modules/system/ForbiddenPage.vue` - 无权限页改造成 `Element Plus` 结果页。
- 修改：`apps/admin/src/modules/system/NotFoundPage.vue` - 404 页改造成 `Element Plus` 结果页。
- 修改：`apps/admin/src/modules/dashboard/DashboardHome.vue` - 工作台首页改造成信息卡片和快捷入口。
- 修改：`apps/admin/src/modules/users/UserManagementView.vue` - 用户列表页重做为 `el-form + el-table + el-pagination`。
- 修改：`apps/admin/src/modules/users/UserDetailDialog.vue` - 用户详情弹窗改造成 `Element Plus` 对话框。
- 修改：`apps/admin/src/modules/depts/DepartmentManagementView.vue` - 部门页重做为树、列表和操作面板。
- 修改：`apps/admin/src/modules/files/FileManagementView.vue` - 文件页重做为列表、筛选和上传/删除交互。
- 修改：`apps/admin/src/modules/platform/PlatformTenantPage.vue` - 平台租户页重做为表格与表单。
- 修改：`apps/admin/src/modules/tenant/TenantProfilePage.vue` - 租户资料页重做为描述列表和表单。
- 修改：`apps/admin/src/modules/**.test.ts` - 更新布局、登录页、系统页和业务页的渲染测试。
- 修改：`apps/admin/e2e/auth.spec.ts` - 登录、退出、权限页和路由跳转的 E2E。
- 新增或修改：`apps/admin/e2e/*.spec.ts` - 关键业务页的 UI 断言回归。

## 任务 1：建立 Element Plus 全局接入和统一布局壳

**文件：**
- 修改：`apps/admin/src/main.ts`
- 修改：`apps/admin/src/styles/global.css`
- 修改：`apps/admin/src/styles/tokens.css`
- 修改：`apps/admin/src/layouts/AdminLayout.vue`
- 修改：`apps/admin/src/layouts/DomainLayout.vue`
- 修改：`apps/admin/src/layouts/AdminLayout.test.ts`

- [ ] **步骤 1：先写布局壳渲染测试，锁定菜单、标题和退出入口**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import AdminLayout from './AdminLayout.vue'

describe('AdminLayout', () => {
  it('renders the element-plus shell with navigation and sign out entry', () => {
    const wrapper = mount(AdminLayout, {
      global: {
        stubs: {
          RouterLink: true,
          RouterView: true
        }
      }
    })

    expect(wrapper.text()).toContain('工作台')
    expect(wrapper.text()).toContain('退出登录')
  })
})
```

- [ ] **步骤 2：运行布局测试确认失败**

运行：`pnpm --filter @saasbase/admin test -- --runInBand apps/admin/src/layouts/AdminLayout.test.ts`

预期：在 `Element Plus` 布局和文案尚未接管前，测试应失败或断言不成立。

- [ ] **步骤 3：实现最小全局接入和布局替换**

```ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

createApp(App).use(createPinia()).use(router).use(ElementPlus).mount('#app')
```

```vue
<template>
  <el-container class="admin-shell">
    <el-aside class="admin-aside" width="260px">
      <el-menu :default-active="activePath" router>
        <el-menu-item index="/dashboard">工作台</el-menu-item>
        <el-menu-item index="/users">用户管理</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">SaaSBase Admin</el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>
```

```css
body {
  margin: 0;
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：布局测试通过，`Element Plus` 入口和样式依赖能被 TypeScript 正确解析。

- [ ] **步骤 5：提交全局接入和布局壳**

```bash
git add apps/admin/src/main.ts apps/admin/src/styles/global.css apps/admin/src/styles/tokens.css apps/admin/src/layouts/AdminLayout.vue apps/admin/src/layouts/DomainLayout.vue apps/admin/src/layouts/AdminLayout.test.ts
git commit -m "feat: 接入 element plus 布局壳"
```

## 任务 2：重做登录页与系统页

**文件：**
- 修改：`apps/admin/src/modules/auth/LoginView.vue`
- 修改：`apps/admin/src/modules/system/ForbiddenPage.vue`
- 修改：`apps/admin/src/modules/system/NotFoundPage.vue`
- 修改：`apps/admin/src/modules/system/index.ts`
- 修改：`apps/admin/src/modules/auth/login.test.ts`
- 修改：`apps/admin/src/modules/system/system-pages.test.ts`

- [ ] **步骤 1：先写登录页渲染测试，锁定表单字段和提交入口**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import LoginView from './LoginView.vue'

describe('LoginView', () => {
  it('renders tenant code, username, password and submit button', () => {
    const wrapper = mount(LoginView)

    expect(wrapper.text()).toContain('租户编码')
    expect(wrapper.text()).toContain('用户名')
    expect(wrapper.text()).toContain('密码')
    expect(wrapper.text()).toContain('登录')
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test -- --runInBand apps/admin/src/modules/auth/login.test.ts`

预期：在登录页尚未替换为 `Element Plus` 表单时，测试会因为文案、结构或组件树不匹配而失败。

- [ ] **步骤 3：实现登录、403 和 404 的最小 `Element Plus` 版本**

```vue
<template>
  <el-card class="login-card">
    <el-form :model="form" label-width="88px">
      <el-form-item label="租户编码">
        <el-input v-model="form.tenantCode" />
      </el-form-item>
      <el-form-item label="用户名">
        <el-input v-model="form.username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="form.password" type="password" show-password />
      </el-form-item>
      <el-button type="primary" :loading="loading" @click="handleSubmit">登录</el-button>
    </el-form>
  </el-card>
</template>
```

```vue
<template>
  <el-result icon="warning" title="没有权限" sub-title="当前账号无法访问该页面">
    <template #extra>
      <el-button type="primary" @click="$router.push('/dashboard')">返回工作台</el-button>
    </template>
  </el-result>
</template>
```

```vue
<template>
  <el-result icon="error" title="页面不存在" sub-title="请检查地址是否正确">
    <template #extra>
      <el-button type="primary" @click="$router.push('/dashboard')">返回首页</el-button>
    </template>
  </el-result>
</template>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：登录页与系统页可以正常渲染，相关测试通过。

- [ ] **步骤 5：提交登录页与系统页改造**

```bash
git add apps/admin/src/modules/auth/LoginView.vue apps/admin/src/modules/system/ForbiddenPage.vue apps/admin/src/modules/system/NotFoundPage.vue apps/admin/src/modules/system/index.ts apps/admin/src/modules/auth/login.test.ts apps/admin/src/modules/system/system-pages.test.ts
git commit -m "feat: 重做登录与系统页"
```

## 任务 3：重做工作台与用户、部门、文件、平台租户、租户资料业务页

**文件：**
- 修改：`apps/admin/src/modules/dashboard/DashboardHome.vue`
- 修改：`apps/admin/src/modules/users/UserManagementView.vue`
- 修改：`apps/admin/src/modules/users/UserDetailDialog.vue`
- 修改：`apps/admin/src/modules/users/useUsersModule.ts`
- 修改：`apps/admin/src/modules/depts/DepartmentManagementView.vue`
- 修改：`apps/admin/src/modules/depts/useDepartmentsModule.ts`
- 修改：`apps/admin/src/modules/files/FileManagementView.vue`
- 修改：`apps/admin/src/modules/platform/PlatformTenantPage.vue`
- 修改：`apps/admin/src/modules/tenant/TenantProfilePage.vue`
- 修改：`apps/admin/src/modules/dashboard/dashboard.test.ts`
- 修改：`apps/admin/src/modules/users/users.test.ts`
- 修改：`apps/admin/src/modules/depts/depts.test.ts`
- 修改：`apps/admin/src/modules/files/files.test.ts`
- 修改：`apps/admin/src/modules/platform/platform.test.ts`
- 修改：`apps/admin/src/modules/tenant/tenant.test.ts`

- [ ] **步骤 1：先写用户列表页渲染测试，锁定筛选、表格和操作区**

```ts
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import UserManagementView from './UserManagementView.vue'

describe('UserManagementView', () => {
  it('renders the search form and table actions', () => {
    const wrapper = mount(UserManagementView, {
      global: {
        stubs: {
          RouterLink: true
        }
      }
    })

    expect(wrapper.text()).toContain('用户管理')
    expect(wrapper.text()).toContain('查询')
    expect(wrapper.text()).toContain('重置')
  })
})
```

- [ ] **步骤 2：运行测试确认失败**

运行：`pnpm --filter @saasbase/admin test -- --runInBand apps/admin/src/modules/users/users.test.ts`

预期：在列表页还未切换到 `Element Plus` 搜索表单和表格前，测试不应通过。

- [ ] **步骤 3：把业务页替换成 `Element Plus` 组件组合**

```vue
<template>
  <section class="page">
    <el-form :inline="true" :model="filters">
      <el-form-item label="用户名">
        <el-input v-model="filters.username" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="state.items" v-loading="state.loading">
      <el-table-column prop="username" label="用户名" />
    </el-table>

    <el-pagination :total="state.total" :page-size="state.query.pageSize" />
  </section>
</template>
```

```vue
<template>
  <el-dialog v-model="open" title="用户详情">
    <el-descriptions :column="2" border>
      <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
    </el-descriptions>
  </el-dialog>
</template>
```

```vue
<template>
  <el-tree :data="departments" node-key="id" />
</template>
```

```vue
<template>
  <el-upload :auto-upload="false">
    <el-button type="primary">上传文件</el-button>
  </el-upload>
</template>
```

```vue
<template>
  <el-descriptions border>
    <el-descriptions-item label="租户名称">{{ tenantName }}</el-descriptions-item>
  </el-descriptions>
</template>
```

- [ ] **步骤 4：运行测试和类型检查确认通过**

运行：`pnpm --filter @saasbase/admin test && pnpm --filter @saasbase/admin typecheck`

预期：各业务页能在 `Element Plus` 组件树下正常渲染，列表查询和详情交互不被破坏。

- [ ] **步骤 5：提交业务页批量改造**

```bash
git add apps/admin/src/modules/dashboard apps/admin/src/modules/users apps/admin/src/modules/depts apps/admin/src/modules/files apps/admin/src/modules/platform apps/admin/src/modules/tenant
git commit -m "feat: 重做管理端业务页"
```

## 任务 4：更新 E2E、回归断言并收尾校验

**文件：**
- 修改：`apps/admin/e2e/auth.spec.ts`
- 新增或修改：`apps/admin/e2e/users.spec.ts`
- 新增或修改：`apps/admin/e2e/depts.spec.ts`
- 新增或修改：`apps/admin/e2e/files.spec.ts`
- 新增或修改：`apps/admin/e2e/platform.spec.ts`
- 修改：`apps/admin/src/**.test.ts`

- [ ] **步骤 1：先写登录和权限 E2E 断言**

```ts
import { expect, test } from '@playwright/test'

test('redirects unauthenticated users to login', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
```

- [ ] **步骤 2：运行 E2E 确认失败**

运行：`pnpm --filter @saasbase/admin test:e2e`

预期：在页面结构切换后，现有 `E2E` 断言需要更新，否则会因为按钮文本、表单结构和路由布局变化失败。

- [ ] **步骤 3：更新断言并补齐关键路径**

```ts
import { expect, test } from '@playwright/test'

test('shows the element-plus login form', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByText('租户编码')).toBeVisible()
  await expect(page.getByRole('button', { name: '登录' })).toBeVisible()
})
```

```ts
import { expect, test } from '@playwright/test'

test('shows users page table actions', async ({ page }) => {
  await page.goto('/users')
  await expect(page.getByText('用户管理')).toBeVisible()
  await expect(page.getByRole('button', { name: '查询' })).toBeVisible()
})
```

- [ ] **步骤 4：运行验证命令确认通过**

运行：

```bash
pnpm lint
pnpm --filter @saasbase/admin typecheck
pnpm --filter @saasbase/admin test
pnpm --filter @saasbase/admin test:e2e
pnpm --filter @saasbase/admin build
```

预期：所有受影响检查通过；如果某个页面因组件迁移出现失败，继续回到对应任务修复后重跑。

- [ ] **步骤 5：提交收尾改造**

```bash
git add apps/admin/e2e apps/admin/src
git commit -m "feat: 完成管理端 element plus 改造"
```

## 自检

### 1. 规格覆盖度

- `main.ts`、`styles` 和 `layouts`：由任务 1 覆盖。
- `login`、`403`、`404`：由任务 2 覆盖。
- `dashboard`、`users`、`depts`、`files`、`platform/tenants`、`tenant/profile`：由任务 3 覆盖。
- `E2E` 和关键单测回归：由任务 4 覆盖。

### 2. 占位符扫描

已检查计划正文，不包含 `TODO`、`待定`、`TBD`、`后续实现`、`xxx` 等占位内容。

### 3. 类型一致性

- 计划里使用的路径和模块名与当前仓库中的 `apps/admin/src/...` 结构一致。
- 任务内引用的组件名和测试文件名都在对应任务的文件列表中定义。
- E2E 和单测步骤只引用已经在任务文件列表中出现的页面和测试文件。

## 执行交接

计划已完成并保存到 `docs/superpowers/plans/2026-07-15-admin-element-plus-redesign.md`。两种执行方式：

1. 子代理驱动（推荐） - 每个任务调度一个新的子代理，任务间进行审查，快速迭代
2. 内联执行 - 在当前会话中使用 executing-plans 执行任务，批量执行并设有检查点

选哪种方式？
