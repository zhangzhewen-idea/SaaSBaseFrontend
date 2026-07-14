import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn()
  })
}))

import DashboardHome from './DashboardHome.vue'
import {
  dashboardStatusNotes,
  getDashboardSessionSummary,
  getVisibleDashboardShortcuts
} from './dashboard.data'
import { clearCurrentSession, setCurrentSession } from '../auth/session'

describe('dashboard home', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    clearCurrentSession()
  })

  it('只展示会话摘要、快捷入口和状态说明三段式内容', () => {
    setCurrentSession({
      userId: 'u-1',
      displayName: '租户管理员',
      role: 'tenant-admin',
      tenantId: 'tenant-1',
      permissions: ['tenant:user:read', 'tenant:file:read']
    })

    const routerPush = vi.fn()
    const wrapper = mount(DashboardHome, {
      global: {
        mocks: {
          $router: {
            push: routerPush
          }
        }
      }
    })

    expect(wrapper.text()).toContain('会话摘要')
    expect(wrapper.text()).toContain('快捷入口')
    expect(wrapper.text()).toContain('状态说明')
    expect(wrapper.text()).toContain('SaaSBase')
    expect(wrapper.text()).toContain('租户管理员')
    expect(wrapper.text()).toContain('tenant-1')
    expect(wrapper.text()).toContain('2 项')
    expect(wrapper.text()).not.toContain('平台概览')
    expect(wrapper.text()).not.toContain('演示切换')

    const shortcutTitles = wrapper.findAll('.shortcut strong').map((node) => node.text())
    expect(shortcutTitles).toEqual(['用户管理', '文件管理'])

    expect(
      wrapper.findAll('.summary-item').map((node) => node.text().replace(/\s+/g, ''))
    ).toEqual([
      '当前状态已登录',
      '当前租户SaaSBase',
      '当前用户租户管理员',
      '当前角色租户管理员',
      '租户IDtenant-1',
      '可用权限2项'
    ])

    expect(
      wrapper.findAll('.status-note').map((node) => node.text().replace(/\s+/g, ''))
    ).toEqual(
      dashboardStatusNotes.map((note) => `${note.title}${note.description}`.replace(/\s+/g, ''))
    )

    expect(routerPush).not.toHaveBeenCalled()
  })

  it('按权限过滤快捷入口', () => {
    setCurrentSession({
      userId: 'u-2',
      displayName: '租户成员',
      role: 'tenant-member',
      tenantId: 'tenant-2',
      permissions: ['tenant:dept:read']
    })

    expect(
      getVisibleDashboardShortcuts([
        'tenant:dept:read'
      ])
    ).toEqual([
      {
        title: '部门管理',
        description: '维护组织结构和归属关系',
        path: '/departments',
        permission: 'tenant:dept:read'
      }
    ])

    expect(
      getDashboardSessionSummary({
        userId: 'u-2',
        displayName: '租户成员',
        role: 'tenant-member',
        tenantId: 'tenant-2',
        permissions: ['tenant:dept:read']
      }, 'SaaSBase')
    ).toEqual([
      { label: '当前状态', value: '已登录' },
      { label: '当前租户', value: 'SaaSBase' },
      { label: '当前用户', value: '租户成员' },
      { label: '当前角色', value: '租户成员' },
      { label: '租户 ID', value: 'tenant-2' },
      { label: '可用权限', value: '1 项' }
    ])
  })
})
