<template>
  <div class="shell">
    <aside class="sidebar">
      <div>
        <p class="brand">SaaSBase Admin</p>
        <p class="desc">租户后台工作台</p>
      </div>

      <nav class="nav">
        <RouterLink to="/dashboard">工作台</RouterLink>
        <RouterLink v-if="hasPermission('tenant:profile:read')" to="/tenant/profile">租户资料</RouterLink>
        <RouterLink to="/users">用户管理</RouterLink>
        <RouterLink to="/departments">部门管理</RouterLink>
        <RouterLink to="/files">文件管理</RouterLink>
        <RouterLink v-if="roleLabel === '平台管理员'" to="/platform/tenants">平台租户</RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span>当前会话</span>
        <strong>{{ sessionLabel }}</strong>
      </div>
    </aside>

    <main class="content">
      <header class="topbar card">
        <div>
          <p class="eyebrow">Tenant Control Center</p>
          <h1>{{ title }}</h1>
        </div>
        <div class="topbar-actions">
          <span class="badge">{{ roleLabel }}</span>
          <button type="button" @click="handleSignOut">退出登录</button>
        </div>
      </header>

      <section class="page">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuth } from '../modules/auth/useAuth'

const route = useRoute()
const router = useRouter()
const { session, signOut, hasPermission } = useAuth()

const title = computed(() => (route.meta.title as string | undefined) ?? '工作台')

const roleLabel = computed(() => {
  switch (session.value?.role) {
    case 'platform-admin':
      return '平台管理员'
    case 'tenant-admin':
      return '租户管理员'
    case 'tenant-member':
      return '租户成员'
    default:
      return '未登录'
  }
})

const sessionLabel = computed(() => session.value?.userId ?? 'guest')

function handleSignOut(): void {
  signOut()
  router.push('/login')
}
</script>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 260px minmax(0, 1fr);
  background:
    radial-gradient(circle at top left, rgba(63, 111, 224, 0.18), transparent 32%),
    radial-gradient(circle at bottom right, rgba(56, 193, 219, 0.08), transparent 26%),
    var(--color-bg);
}

.sidebar {
  display: grid;
  gap: 24px;
  align-content: space-between;
  padding: 28px;
  border-right: 1px solid var(--color-border);
  background: linear-gradient(180deg, rgba(14, 25, 44, 0.9), rgba(9, 16, 30, 0.88));
  backdrop-filter: blur(18px);
}

.brand {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #f7fbff;
}

.desc {
  margin: 8px 0 0;
  color: rgba(220, 231, 255, 0.7);
}

.nav {
  display: grid;
  gap: 10px;
}

.nav a {
  padding: 12px 14px;
  border-radius: 12px;
  color: rgba(235, 242, 255, 0.88);
  font-weight: 600;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.nav a.router-link-active {
  background: rgba(63, 111, 224, 0.14);
  border-color: rgba(127, 180, 255, 0.18);
  color: #f7fbff;
}

.sidebar-footer {
  display: grid;
  gap: 6px;
  color: rgba(175, 193, 223, 0.82);
}

.sidebar-footer strong {
  color: #f7fbff;
}

.content {
  display: grid;
  gap: 20px;
  padding: 28px;
}

.card {
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.94), rgba(9, 16, 30, 0.92));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
  backdrop-filter: blur(18px);
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 22px 24px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7fb4ff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 1.7rem;
  color: #f7fbff;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(127, 180, 255, 0.14);
  color: #7fb4ff;
  font-weight: 700;
}

.topbar-actions button {
  padding: 10px 14px;
  border: 1px solid rgba(159, 187, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #f7fbff;
  font-weight: 600;
  border-radius: 12px;
}

.page {
  min-width: 0;
}

@media (max-width: 1024px) {
  .shell {
    grid-template-columns: 1fr;
  }

  .sidebar {
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
