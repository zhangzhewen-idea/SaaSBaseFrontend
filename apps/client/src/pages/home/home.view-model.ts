import type { AuthSession } from '@saasbase/shared'

export interface HomeSummaryItem {
  label: string
  value: string
}

export interface HomeShortcutItem {
  title: string
  description: string
  path: string
}

export interface HomeTaskItem {
  title: string
  status: string
  note: string
}

export interface HomeNoticeItem {
  title: string
  time: string
  content: string
}

export function resolveRoleLabel(session: AuthSession | null): string {
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
      return '未知角色'
  }
}

export function buildHomeSummary(session: AuthSession | null): HomeSummaryItem[] {
  return [
    {
      label: '登录状态',
      value: session ? '已登录' : '未登录'
    },
    {
      label: '当前用户',
      value: session?.displayName ?? '未登录'
    },
    {
      label: '用户 ID',
      value: session?.userId ?? '-'
    },
    {
      label: '当前角色',
      value: resolveRoleLabel(session)
    },
    {
      label: '权限数量',
      value: `${session?.permissions.length ?? 0} 项`
    }
  ]
}

export function buildHomeShortcuts(session: AuthSession | null): HomeShortcutItem[] {
  const role = session?.role ?? 'tenant-member'

  return [
    {
      title: '我的资料',
      description: '查看当前账号、角色与权限范围',
      path: '/pages/profile/index'
    },
    {
      title: '租户工作台',
      description: role === 'platform-admin' ? '查看平台侧待处理事项' : '进入租户日常操作中心',
      path: '/pages/home/index'
    },
    {
      title: '帮助中心',
      description: '查看常见问题与操作说明',
      path: '/pages/messages/index'
    },
    {
      title: '反馈建议',
      description: '提交使用反馈和优化建议',
      path: '/pages/messages/index'
    }
  ]
}

export function buildHomeTasks(session: AuthSession | null): HomeTaskItem[] {
  const canManage = session?.permissions.includes('tenant:user:read') ?? false

  return [
    {
      title: '确认当前会话',
      status: '已完成',
      note: session ? `已登录为 ${session.displayName}` : '当前未登录'
    },
    {
      title: '检查可用权限',
      status: canManage ? '可执行' : '受限',
      note: canManage ? '可以进入用户和组织管理' : '当前只保留基础浏览能力'
    },
    {
      title: '处理待办',
      status: '待跟进',
      note: '暂无服务端待办接口，先展示本地占位卡片'
    }
  ]
}

export function buildHomeNotices(): HomeNoticeItem[] {
  return [
    {
      title: '系统公告',
      time: '今天',
      content: '客户端首页已切换为真实会话版布局。'
    },
    {
      title: '使用提示',
      time: '今天',
      content: '后续接入真实业务路由时，可直接把快捷入口切换成页面跳转。'
    },
    {
      title: '同步状态',
      time: '今天',
      content: '当前页面不再使用演示按钮，所有内容均来自会话态和本地结构。'
    }
  ]
}
