import { expect, test, type Page } from '@playwright/test'

async function setSession(page: Page, session: {
  userId: string
  displayName: string
  role: 'platform-admin' | 'tenant-admin' | 'tenant-member'
  tenantId: string
  permissions: string[]
}): Promise<void> {
  await page.addInitScript((nextSession) => {
    window.sessionStorage.setItem(
      'saasbase.admin.auth',
      JSON.stringify({
        session: nextSession,
        accessToken: 'access-token',
        refreshToken: 'refresh-token'
      })
    )
  }, session)
}

test('未登录访问平台概览直接看到迁移说明', async ({ page }) => {
  await page.goto('/platform/overview')

  await expect(page).toHaveURL(/\/platform\/overview/)
  await expect(page.locator('main').getByRole('heading', { name: '平台概览' })).toBeVisible()
  await expect(page.getByText('迁移说明')).toBeVisible()
})

test('平台账号进入平台租户管理', async ({ page }) => {
  await setSession(page, {
    userId: 'platform-admin',
    displayName: '平台管理员',
    role: 'platform-admin',
    tenantId: 'tenant-1',
    permissions: ['platform:tenant:read']
  })

  await page.goto('/platform/tenants')

  await expect(page).toHaveURL(/\/platform\/tenants/)
  await expect(page.locator('main h2')).toHaveText('平台租户管理')
})

test('租户账号访问平台页进入无权限页', async ({ page }) => {
  await setSession(page, {
    userId: 'tenant-admin',
    displayName: '租户管理员',
    role: 'tenant-admin',
    tenantId: 'tenant-1',
    permissions: ['tenant:profile:read']
  })

  await page.goto('/platform/tenants')

  await expect(page).toHaveURL(/\/forbidden/)
  await expect(page.getByText('没有权限访问当前页面')).toBeVisible()
})

test('退出后返回登录页', async ({ page }) => {
  await setSession(page, {
    userId: 'platform-admin',
    displayName: '平台管理员',
    role: 'platform-admin',
    tenantId: 'tenant-1',
    permissions: ['platform:tenant:read']
  })

  await page.goto('/platform/tenants')
  await page.getByRole('button', { name: '退出登录' }).click()

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: '登录到管理后台' })).toBeVisible()
})
