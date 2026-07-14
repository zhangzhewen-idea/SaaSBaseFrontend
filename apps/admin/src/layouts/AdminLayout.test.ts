import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
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
        plugins: [pinia, router]
      }
    })

    expect(wrapper.html()).toContain('租户资料')
  })
})
