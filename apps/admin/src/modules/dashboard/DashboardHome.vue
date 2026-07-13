<template>
  <section class="dashboard">
    <div class="hero card">
      <div class="hero-copy">
        <p class="eyebrow">Tenant Workbench</p>
        <h1>把租户管理放在同一个工作台里</h1>
        <p class="lead">
          这里是混合式首页，先看租户状态，再进入用户和部门的日常操作。当前页面使用 demo session 演示完整路由与权限链路。
        </p>

        <div class="hero-actions">
          <button class="primary" type="button" @click="$router.push('/users')">进入用户管理</button>
          <button class="secondary" type="button" @click="$router.push('/departments')">进入部门管理</button>
        </div>
      </div>

      <aside class="session card">
        <div class="session-row">
          <span>当前角色</span>
          <strong>{{ roleLabel }}</strong>
        </div>
        <div class="session-row">
          <span>租户 ID</span>
          <strong>{{ session?.tenantId ?? '未分配' }}</strong>
        </div>
        <div class="session-row">
          <span>权限数量</span>
          <strong>{{ session?.permissions.length ?? 0 }}</strong>
        </div>
      </aside>
    </div>

    <div class="stats">
      <article v-for="stat in dashboardStats" :key="stat.label" class="card stat-card">
        <p>{{ stat.label }}</p>
        <strong>{{ stat.value }}</strong>
        <span>{{ stat.note }}</span>
      </article>
    </div>

    <div class="shortcuts card">
      <div class="section-title">
        <h2>快捷入口</h2>
        <p>所有入口都绑定了权限判断，未登录会跳到登录页，缺权限会进入无权限页。</p>
      </div>

      <div class="shortcut-grid">
        <button
          v-for="item in dashboardShortcuts"
          :key="item.title"
          class="shortcut"
          type="button"
          @click="$router.push(item.path)"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { dashboardShortcuts, dashboardStats } from './dashboard.data'
import { useAuth } from '../auth/useAuth'

const { session } = useAuth()

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
</script>

<style scoped>
.dashboard {
  display: grid;
  gap: 24px;
}

.hero {
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  align-items: stretch;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(19, 32, 51, 0.06);
}

.hero-copy,
.session,
.shortcuts {
  padding: 28px;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--color-brand-500);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1 {
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
  max-width: 12ch;
}

.lead {
  margin-top: 16px;
  max-width: 60ch;
  color: var(--color-text-weak);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}

button {
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  font: inherit;
}

.primary,
.secondary {
  padding: 12px 18px;
  font-weight: 700;
}

.primary {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: white;
}

.secondary {
  background: #eef3fb;
  color: var(--color-brand-700);
}

.session {
  display: grid;
  gap: 16px;
  align-content: center;
}

.session-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  color: var(--color-text-weak);
}

.session-row strong {
  color: var(--color-text);
}

.stats {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  padding: 22px;
}

.stat-card p,
.shortcut span {
  color: var(--color-text-weak);
}

.stat-card strong {
  display: block;
  margin: 12px 0 8px;
  font-size: 1.6rem;
}

.shortcuts {
  display: grid;
  gap: 20px;
}

.section-title {
  display: grid;
  gap: 6px;
}

.section-title p {
  color: var(--color-text-weak);
}

.shortcut-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.shortcut {
  display: grid;
  gap: 8px;
  padding: 18px;
  text-align: left;
  background: #f6f8fc;
  border: 1px solid transparent;
}

.shortcut:hover {
  border-color: var(--color-brand-500);
  background: #eef3fb;
}

@media (max-width: 1024px) {
  .hero,
  .stats,
  .shortcut-grid {
    grid-template-columns: 1fr;
  }
}
</style>
