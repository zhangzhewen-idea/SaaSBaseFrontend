import type { AuthSession } from '@saasbase/shared'

const STORAGE_KEY = 'saasbase.client.session'
type UniStorageBridge = {
  getStorageSync(key: string): unknown
  setStorageSync(key: string, value: unknown): void
  removeStorageSync(key: string): void
}

function getUniStorage(): UniStorageBridge | null {
  const bridge = (globalThis as typeof globalThis & { uni?: Partial<UniStorageBridge> }).uni
  if (!bridge?.getStorageSync || !bridge?.setStorageSync || !bridge?.removeStorageSync) {
    return null
  }

  return bridge as UniStorageBridge
}

let currentSession: AuthSession | null = null

function isStorageAvailable(): boolean {
  return getUniStorage() !== null
}

function readStoredSession(): AuthSession | null {
  const storage = getUniStorage()
  if (!storage) {
    return null
  }

  const raw = storage.getStorageSync(STORAGE_KEY)
  if (!raw || typeof raw !== 'object') {
    return null
  }

  const session = raw as AuthSession
  return typeof session.userId === 'string' ? session : null
}

function writeStoredSession(session: AuthSession | null): void {
  const storage = getUniStorage()
  if (!storage) {
    return
  }

  if (session === null) {
    storage.removeStorageSync(STORAGE_KEY)
    return
  }

  storage.setStorageSync(STORAGE_KEY, session)
}

currentSession = readStoredSession()

export async function login(username: string, password: string): Promise<AuthSession> {
  if (username !== 'tenant' || password !== 'demo123') {
    throw new Error('登录名或密码错误')
  }

  currentSession = {
    userId: 'tenant-demo',
    displayName: '租户用户',
    role: 'tenant-admin',
    permissions: ['tenant:read']
  }

  writeStoredSession(currentSession)
  return currentSession
}

export function getSession(): AuthSession | null {
  return currentSession
}

export function clearSession(): void {
  currentSession = null
  writeStoredSession(null)
}
