import { getSession } from './auth.adapter'

function resolveUniApp(): { reLaunch: (options: { url: string }) => void } {
  const bridge = (globalThis as typeof globalThis & {
    uni?: { reLaunch?: (options: { url: string }) => void }
  }).uni

  return {
    reLaunch(options) {
      bridge?.reLaunch?.(options)
    }
  }
}

export function ensureClientSession(): boolean {
  return getSession() !== null
}

export function redirectToLogin(): void {
  resolveUniApp().reLaunch({ url: '/pages/login/index' })
}

export function redirectToHome(): void {
  resolveUniApp().reLaunch({ url: '/pages/home/index' })
}

export function navigateToPage(url: string): void {
  const bridge = (globalThis as typeof globalThis & {
    uni?: { navigateTo?: (options: { url: string }) => void }
  }).uni

  bridge?.navigateTo?.({ url })
}
