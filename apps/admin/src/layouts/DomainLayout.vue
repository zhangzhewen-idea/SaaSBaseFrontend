<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '../modules/auth/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const { session, tenantName } = storeToRefs(authStore)

const displayName = computed(() => session.value?.displayName ?? '未登录')
const roleLabel = computed(() =>
  session.value?.role === 'platform-admin'
    ? '平台管理员'
    : session.value?.role === 'tenant-admin'
      ? '租户管理员'
      : '访客'
)

function canShow(permission: 'tenant:profile:read' | 'tenant:user:read' | 'tenant:dept:read'): boolean {
  return session.value?.permissions.includes(permission) ?? false
}

function handleLogout(): void {
  void authStore.logout().then(() => router.replace('/login'))
}
</script>

<template>
  <div class="domain-shell">
    <aside
      class="sidebar"
      aria-label="域导航"
    >
      <section>
        <h2>管理员</h2>
        <nav>
          <RouterLink to="/dashboard">工作台</RouterLink>
          <RouterLink v-if="canShow('tenant:user:read')" to="/users">用户管理</RouterLink>
          <RouterLink v-if="canShow('tenant:dept:read')" to="/departments">部门管理</RouterLink>
        </nav>
      </section>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div>
          <strong>{{ displayName }}</strong>
          <span>{{ roleLabel }} · {{ tenantName || '未获取租户资料' }}</span>
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

<style scoped>
.domain-shell {
  min-height: 100vh;
  display: flex;
  background:
    radial-gradient(circle at top left, rgba(63, 111, 224, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(56, 193, 219, 0.08), transparent 26%),
    var(--color-bg);
  color: var(--color-text);
}

.sidebar {
  width: 220px;
  background: linear-gradient(180deg, rgba(14, 25, 44, 0.9), rgba(9, 16, 30, 0.88));
  border-right: 1px solid var(--color-border);
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(18px);
}

.sidebar h2 {
  margin: 0 0 16px;
  color: #f7fbff;
}

.sidebar nav {
  display: grid;
  gap: 8px;
}

.sidebar a {
  padding: 12px 14px;
  border-radius: 12px;
  color: rgba(235, 242, 255, 0.88);
  border: 1px solid transparent;
}

.sidebar a.router-link-active {
  background: rgba(63, 111, 224, 0.14);
  color: #f7fbff;
  border-color: rgba(127, 180, 255, 0.18);
}

.workspace {
  flex: 1;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.topbar {
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.94), rgba(9, 16, 30, 0.92));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  padding: 18px 20px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
}

.topbar strong {
  display: block;
  color: #f7fbff;
}

.topbar span {
  font-size: 0.92rem;
  color: rgba(175, 193, 223, 0.82);
}

.topbar button {
  border: 1px solid rgba(159, 187, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #f7fbff;
  border-radius: 12px;
  min-height: 40px;
  padding: 0 14px;
}

.content {
  flex: 1;
  min-width: 0;
}

@media (max-width: 960px) {
  .domain-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
