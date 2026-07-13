import { expect, test, type Page } from '@playwright/test'

async function login(page: Page, username: string) {
  await page.goto('/login')
  await page.getByLabel('用户名').fill(username)
  await page.getByLabel('密码').fill('demo123')
  await page.getByRole('button', { name: '登录' }).click()
  await page.waitForURL(username === 'platform' ? /\/platform\/overview/ : /\/tenant\/workspace/)
}

async function navigateSpa(page: Page, path: string) {
  await page.evaluate((nextPath) => {
    window.history.pushState({}, '', nextPath)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }, path)
}

test('未登录访问平台页跳转登录', async ({ page }) => {
  await page.goto('/platform/overview')

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: '登录到管理控制台' })).toBeVisible()
})

test('平台账号进入平台概览', async ({ page }) => {
  await login(page, 'platform')

  await expect(page).toHaveURL(/\/platform\/overview/)
  await expect(page.getByRole('heading', { name: '平台概览' })).toBeVisible()
})

test('租户账号访问平台页进入无权限页', async ({ page }) => {
  await login(page, 'tenant')

  await navigateSpa(page, '/platform/overview')

  await expect(page).toHaveURL(/\/forbidden/)
  await expect(page.getByRole('heading', { name: '无权限访问' })).toBeVisible()
})

test('退出后返回登录页', async ({ page }) => {
  await login(page, 'platform')

  await page.getByRole('button', { name: '退出登录' }).click()

  await expect(page).toHaveURL(/\/login/)
  await expect(page.getByRole('heading', { name: '登录到管理控制台' })).toBeVisible()
})
