<template>
  <div class="shell">
    <aside class="sidebar">
      <div>
        <p class="brand">SaaSBase Admin</p>
        <p class="desc">租户后台工作台</p>
      </div>

      <nav class="nav">
        <RouterLink to="/dashboard">工作台</RouterLink>
        <RouterLink to="/users">用户管理</RouterLink>
        <RouterLink to="/departments">部门管理</RouterLink>
      </nav>

      <div class="sidebar-footer">
        <span>Demo Session</span>
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
const { session, signOut } = useAuth()

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
    radial-gradient(circle at top left, rgba(63, 111, 224, 0.12), transparent 30%),
    var(--color-bg);
}

.sidebar {
  display: grid;
  gap: 24px;
  align-content: space-between;
  padding: 28px;
  border-right: 1px solid var(--color-border);
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
}

.brand {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
}

.desc {
  margin: 8px 0 0;
  color: var(--color-text-weak);
}

.nav {
  display: grid;
  gap: 10px;
}

.nav a {
  padding: 12px 14px;
  border-radius: 12px;
  color: var(--color-text);
  font-weight: 600;
}

.nav a.router-link-active {
  background: rgba(63, 111, 224, 0.12);
  color: var(--color-brand-700);
}

.sidebar-footer {
  display: grid;
  gap: 6px;
  color: var(--color-text-weak);
}

.sidebar-footer strong {
  color: var(--color-text);
}

.content {
  display: grid;
  gap: 20px;
  padding: 28px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(19, 32, 51, 0.06);
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
  color: var(--color-brand-500);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 1.7rem;
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.badge {
  padding: 8px 12px;
  border-radius: 999px;
  background: #eef3fb;
  color: var(--color-brand-700);
  font-weight: 700;
}

.topbar-actions button {
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  background: white;
  font-weight: 600;
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
