export interface DashboardStat {
  label: string
  value: string
  note: string
}

export const dashboardStats: DashboardStat[] = [
  { label: '当前租户', value: 'SaaSBase Demo', note: '试运行环境' },
  { label: '活跃用户', value: '128', note: '近 7 天' },
  { label: '部门数量', value: '12', note: '含 3 个一级部门' },
  { label: '最近同步', value: '2 分钟前', note: '认证态已刷新' }
]

export const dashboardShortcuts = [
  { title: '用户管理', description: '查看、筛选、停用和恢复账号', path: '/users', permission: 'tenant-user:view' },
  { title: '部门管理', description: '维护组织结构和归属关系', path: '/departments', permission: 'tenant-department:view' },
  { title: '权限概览', description: '快速确认当前会话权限范围', path: '/dashboard', permission: 'tenant-dashboard:view' }
] as const
