import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import ElementPlus from 'element-plus'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useAuthStore } from '../modules/auth/auth.store'
import AdminLayout from './AdminLayout.vue'

describe('AdminLayout', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('shows the tenant profile navigation when the session has permission', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/dashboard',
          component: { template: '<div />' },
          meta: { title: '租户工作台' }
        }
      ]
    })
    await router.push('/dashboard')
    await router.isReady()

    const store = useAuthStore()
    store.session = {
      userId: 'u1',
      displayName: '租户管理员',
      role: 'tenant-admin',
      tenantId: 'tenant-1',
      permissions: ['tenant:profile:read']
    }

    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [pinia, router, ElementPlus]
      }
    })

    expect(wrapper.html()).toContain('工作台')
    expect(wrapper.html()).toContain('租户资料')
    expect(wrapper.html()).toContain('退出登录')
  })

  it('shows the platform tenant entry when the session is platform admin', async () => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/platform/tenants',
          component: { template: '<div />' },
          meta: { title: '平台租户管理' }
        }
      ]
    })
    await router.push('/platform/tenants')
    await router.isReady()

    const store = useAuthStore()
    store.session = {
      userId: 'u1',
      displayName: '平台管理员',
      role: 'platform-admin',
      tenantId: 'tenant-1',
      permissions: []
    }

    const wrapper = mount(AdminLayout, {
      global: {
        plugins: [pinia, router, ElementPlus]
      }
    })

    expect(wrapper.html()).toContain('平台租户')
  })
})
