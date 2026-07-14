import type { AuthSession } from '@saasbase/shared'

type LoginInput = {
  username: string
  password: string
}

const ACCOUNTS: Record<string, AuthSession & { password: string }> = {
  platform: {
    userId: 'platform-admin',
    displayName: '平台管理员',
    role: 'platform-admin',
    permissions: ['platform:read'],
    password: 'demo123',
  },
  tenant: {
    userId: 'tenant-admin',
    displayName: '租户管理员',
    role: 'tenant-admin',
    permissions: ['tenant:read'],
    password: 'demo123',
  },
}

export async function login({ username, password }: LoginInput): Promise<AuthSession> {
  const account = ACCOUNTS[username]

  if (account === undefined || account.password !== password) {
    throw new Error('登录名或密码错误')
  }

  return {
    userId: account.userId,
    displayName: account.displayName,
    role: account.role,
    permissions: account.permissions,
  }
}
