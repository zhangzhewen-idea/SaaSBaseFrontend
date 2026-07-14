import { describe, expect, it } from 'vitest'

import type { AuthSession } from '@saasbase/shared'

import {
  buildHomeNotices,
  buildHomeShortcuts,
  buildHomeSummary,
  buildHomeTasks,
  resolveRoleLabel
} from './home.view-model'

const session: AuthSession = {
  userId: 'tenant-demo',
  displayName: '租户用户',
  role: 'tenant-admin',
  permissions: ['tenant:read']
}

describe('home view model', () => {
  it('resolves the role label from the session', () => {
    expect(resolveRoleLabel(session)).toBe('租户管理员')
    expect(resolveRoleLabel(null)).toBe('未登录')
  })

  it('builds a summary from the current session', () => {
    expect(buildHomeSummary(session)).toEqual([
      { label: '登录状态', value: '已登录' },
      { label: '当前用户', value: '租户用户' },
      { label: '用户 ID', value: 'tenant-demo' },
      { label: '当前角色', value: '租户管理员' },
      { label: '权限数量', value: '1 项' }
    ])
  })

  it('builds shortcuts and home sections', () => {
    expect(buildHomeShortcuts(session)).toEqual([
      { title: '我的资料', description: '查看当前账号、角色与权限范围', path: '/pages/profile/index' },
      { title: '租户工作台', description: '进入租户日常操作中心', path: '/pages/home/index' },
      { title: '帮助中心', description: '查看常见问题与操作说明', path: '/pages/messages/index' },
      { title: '反馈建议', description: '提交使用反馈和优化建议', path: '/pages/messages/index' }
    ])
    expect(buildHomeTasks(session)).toEqual([
      { title: '确认当前会话', status: '已完成', note: '已登录为 租户用户' },
      { title: '检查可用权限', status: '受限', note: '当前只保留基础浏览能力' },
      { title: '处理待办', status: '待跟进', note: '暂无服务端待办接口，先展示本地占位卡片' }
    ])
    expect(buildHomeNotices()).toEqual([
      { title: '系统公告', time: '今天', content: '客户端首页已切换为真实会话版布局。' },
      { title: '使用提示', time: '今天', content: '后续接入真实业务路由时，可直接把快捷入口切换成页面跳转。' },
      { title: '同步状态', time: '今天', content: '当前页面不再使用演示按钮，所有内容均来自会话态和本地结构。' }
    ])
  })
})
