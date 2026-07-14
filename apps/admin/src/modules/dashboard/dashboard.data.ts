import { canAccess } from '@saasbase/shared'

import type { AuthSession, Permission } from '@saasbase/shared'

export interface DashboardStat {
  label: string
  value: string
  note: string
}

export interface DashboardSessionSummaryItem {
  label: string
  value: string
}

export interface DashboardShortcut {
  title: string
  description: string
  path: string
  permission: Permission
}

export interface DashboardStatusNote {
  title: string
  description: string
}

export const dashboardStats: DashboardStat[] = [
  { label: '当前租户', value: '来自后端资料', note: '管理员视图' },
  { label: '活跃用户', value: '实时查询', note: '以接口返回为准' },
  { label: '部门数量', value: '实时查询', note: '以接口返回为准' },
  { label: '最近同步', value: '登录后刷新', note: '认证态已更新' }
]

export const dashboardShortcuts: readonly DashboardShortcut[] = [
  { title: '用户管理', description: '查看、筛选、停用和恢复账号', path: '/users', permission: 'tenant:user:read' },
  { title: '部门管理', description: '维护组织结构和归属关系', path: '/departments', permission: 'tenant:dept:read' },
  { title: '文件管理', description: '上传、预览和删除文件', path: '/files', permission: 'tenant:file:read' },
  { title: '平台租户', description: '维护平台侧租户列表和状态', path: '/platform/tenants', permission: 'platform:tenant:read' }
]

export const dashboardStatusNotes: readonly DashboardStatusNote[] = [
  {
    title: '首页范围',
    description: '只保留会话摘要、当前可访问的主链路和状态说明。'
  },
  {
    title: '权限过滤',
    description: '快捷入口会根据当前会话权限收口，未授权入口不会显示。'
  },
  {
    title: '排除项',
    description: '平台侧总览和演示功能都不再放回首页。'
  }
]

function resolveRoleLabel(session: AuthSession | null): string {
  if (!session) {
    return '未登录'
  }

  switch (session.role) {
    case 'platform-admin':
      return '平台管理员'
    case 'tenant-admin':
      return '租户管理员'
    case 'tenant-member':
      return '租户成员'
    default:
      return '未登录'
  }
}

export function getDashboardSessionSummary(
  session: AuthSession | null,
  tenantName: string
): DashboardSessionSummaryItem[] {
  return [
    {
      label: '当前状态',
      value: session ? '已登录' : '未登录'
    },
    {
      label: '当前租户',
      value: tenantName
    },
    {
      label: '当前用户',
      value: session?.displayName ?? '未登录'
    },
    {
      label: '当前角色',
      value: resolveRoleLabel(session)
    },
    {
      label: '租户 ID',
      value: session?.tenantId ?? '未分配'
    },
    {
      label: '可用权限',
      value: `${session?.permissions.length ?? 0} 项`
    }
  ]
}

export function getVisibleDashboardShortcuts(
  sessionOrPermissions: AuthSession | readonly Permission[] | null | undefined
): DashboardShortcut[] {
  const session = Array.isArray(sessionOrPermissions)
    ? {
        permissions: sessionOrPermissions
      }
    : sessionOrPermissions

  return dashboardShortcuts.filter((shortcut) => canAccess(session as AuthSession | null | undefined, shortcut.permission))
}
