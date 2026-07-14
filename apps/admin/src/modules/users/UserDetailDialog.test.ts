import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import UserDetailDialog from './UserDetailDialog.vue'

describe('UserDetailDialog', () => {
  it('shows user detail fields and emits close', async () => {
    const wrapper = mount(UserDetailDialog, {
      props: {
        open: true,
        loading: false,
        error: null,
        user: {
          id: 'u-1',
          name: 'Alice',
          username: 'alice',
          phone: '13800000000',
          status: 'active',
          role: 'tenant-admin',
          departmentId: 'dept-1',
          updatedAt: '2026-07-14 09:00:00',
          email: 'alice@example.com',
          lastLoginAt: '2026-07-14 10:00:00',
          permissionCodes: ['user:read', 'user:update']
        }
      }
    })

    expect(wrapper.text()).toContain('Alice')
    expect(wrapper.text()).toContain('alice@example.com')
    expect(wrapper.text()).toContain('user:read，user:update')

    await wrapper.get('button').trigger('click')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
