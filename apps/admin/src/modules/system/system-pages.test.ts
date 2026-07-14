import { mount } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import { describe, expect, it } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'

import ForbiddenPage from './ForbiddenPage.vue'
import NotFoundPage from './NotFoundPage.vue'

function createRouterFor(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path, component: { template: '<div />' } }]
  })

  return router
}

describe('system pages', () => {
  it('renders the forbidden page with return action', async () => {
    const router = createRouterFor('/forbidden')
    await router.push('/forbidden')
    await router.isReady()

    const wrapper = mount(ForbiddenPage, {
      global: {
        plugins: [ElementPlus, router]
      }
    })

    expect(wrapper.text()).toContain('没有权限访问当前页面')
    expect(wrapper.text()).toContain('返回工作台')
  })

  it('renders the not found page with return action', async () => {
    const router = createRouterFor('/missing')
    await router.push('/missing')
    await router.isReady()

    const wrapper = mount(NotFoundPage, {
      global: {
        plugins: [ElementPlus, router]
      }
    })

    expect(wrapper.text()).toContain('页面不存在')
    expect(wrapper.text()).toContain('回到工作台')
  })
})
