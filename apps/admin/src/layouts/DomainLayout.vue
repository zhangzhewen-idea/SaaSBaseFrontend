<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '../modules/auth/auth.store'

const authStore = useAuthStore()
const router = useRouter()

const displayName = computed(() => authStore.session?.displayName ?? '未登录')
const roleLabel = computed(() => authStore.session?.role === 'platform_admin' ? '平台管理员' : authStore.session?.role === 'tenant_admin' ? '租户管理员' : '访客')

function canShow(permission: 'platform:read' | 'tenant:read'): boolean {
  return authStore.session?.permissions.includes(permission) ?? false
}

function handleLogout(): void {
  authStore.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="domain-shell">
    <aside
      class="sidebar"
      aria-label="域导航"
    >
      <section>
        <h2>平台域</h2>
        <nav>
          <RouterLink
            v-if="canShow('platform:read')"
            to="/platform/overview"
          >
            平台概览
          </RouterLink>
        </nav>
      </section>

      <section>
        <h2>租户域</h2>
        <nav>
          <RouterLink
            v-if="canShow('tenant:read')"
            to="/tenant/workspace"
          >
            租户工作台
          </RouterLink>
        </nav>
      </section>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div>
          <strong>{{ displayName }}</strong>
          <span>{{ roleLabel }}</span>
        </div>
        <button
          aria-label="退出登录"
          @click="handleLogout"
        >
          退出
        </button>
      </header>

      <main class="content">
        <RouterView />
      </main>
    </div>
  </div>
</template>
