import type { AuthSession } from '@saasbase/shared'

import type { ClientTenantProfile } from './profile.api'

export interface ProfileFieldItem {
  label: string
  value: string
}

export function resolveProfileFieldItems(
  profile: ClientTenantProfile | null,
  session: AuthSession | null
): ProfileFieldItem[] {
  return [
    { label: '租户 ID', value: String(profile?.tenantId ?? session?.userId ?? '-') },
    { label: '租户编码', value: profile?.tenantCode ?? '-' },
    { label: '租户名称', value: profile?.tenantName ?? session?.displayName ?? '-' },
    { label: '管理员账号', value: profile?.adminUsername ?? session?.userId ?? '-' },
    { label: '管理员显示名', value: profile?.adminDisplayName ?? session?.displayName ?? '-' },
    { label: '权限数', value: `${profile?.permissions?.length ?? session?.permissions.length ?? 0} 项` }
  ]
}
