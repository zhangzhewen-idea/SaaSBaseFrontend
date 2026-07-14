export interface DashboardStat {
  label: string
  value: string
  note: string
}

export const dashboardStats: DashboardStat[] = [
  { label: '当前租户', value: '来自后端资料', note: '管理员视图' },
  { label: '活跃用户', value: '实时查询', note: '以接口返回为准' },
  { label: '部门数量', value: '实时查询', note: '以接口返回为准' },
  { label: '最近同步', value: '登录后刷新', note: '认证态已更新' }
]

export const dashboardShortcuts = [
  { title: '用户管理', description: '查看、筛选、停用和恢复账号', path: '/users', permission: 'tenant:user:read' },
  { title: '部门管理', description: '维护组织结构和归属关系', path: '/departments', permission: 'tenant:dept:read' },
  { title: '租户资料', description: '查看当前租户的基础信息', path: '/dashboard', permission: 'tenant:profile:read' }
] as const
