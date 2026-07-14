import { getSession } from './auth.adapter'

export function ensureClientSession(): boolean {
  return getSession() !== null
}

export function redirectToLogin(): void {
  globalThis.uni.reLaunch({ url: '/pages/login/index' })
}

export function redirectToHome(): void {
  globalThis.uni.reLaunch({ url: '/pages/home/index' })
}
