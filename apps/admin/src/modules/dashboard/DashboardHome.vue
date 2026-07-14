<template>
  <section class="dashboard-home">
    <section class="panel summary-panel card">
      <header class="panel-head">
        <div>
          <p class="eyebrow">Session Summary</p>
          <h1>会话摘要</h1>
        </div>
        <p class="lead">先确认当前身份、租户和权限，再进入后续操作。</p>
      </header>

      <div class="summary-grid">
        <article v-for="item in sessionSummary" :key="item.label" class="summary-item">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </article>
      </div>
    </section>

    <section class="panel shortcut-panel card">
      <header class="panel-head">
        <div>
          <p class="eyebrow">Quick Links</p>
          <h2>快捷入口</h2>
        </div>
        <p class="lead">只展示当前会话可访问的主链路，未授权入口不会出现。</p>
      </header>

      <div v-if="visibleShortcuts.length" class="shortcut-grid">
        <button
          v-for="item in visibleShortcuts"
          :key="item.title"
          class="shortcut"
          type="button"
          @click="handleNavigate(item.path)"
        >
          <strong>{{ item.title }}</strong>
          <span>{{ item.description }}</span>
        </button>
      </div>

      <p v-else class="empty-state">当前会话没有可用入口。</p>
    </section>

    <section class="panel status-panel card">
      <header class="panel-head">
        <div>
          <p class="eyebrow">Status Notes</p>
          <h2>状态说明</h2>
        </div>
        <p class="lead">首页只保留必要信息，避免把平台侧总览和演示功能塞回入口页。</p>
      </header>

      <div class="status-list">
        <article v-for="note in dashboardStatusNotes" :key="note.title" class="status-note">
          <strong>{{ note.title }}</strong>
          <p>{{ note.description }}</p>
        </article>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '../auth/useAuth'
import {
  dashboardStatusNotes,
  getDashboardSessionSummary,
  getVisibleDashboardShortcuts
} from './dashboard.data'

const router = useRouter()
const { session, tenantName } = useAuth()

const sessionSummary = computed(() => getDashboardSessionSummary(session.value, tenantName.value))
const visibleShortcuts = computed(() => getVisibleDashboardShortcuts(session.value))

function handleNavigate(path: string): void {
  void router.push(path)
}
</script>

<style scoped>
.dashboard-home {
  display: grid;
  gap: 20px;
}

.card {
  background:
    radial-gradient(circle at top right, rgba(79, 128, 255, 0.12), transparent 28%),
    linear-gradient(180deg, rgba(16, 26, 44, 0.94), rgba(9, 16, 30, 0.92));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
  backdrop-filter: blur(18px);
}

.panel {
  display: grid;
  gap: 20px;
  padding: 28px;
}

.panel-head {
  display: grid;
  gap: 10px;
}

.eyebrow {
  margin: 0;
  color: #7fb4ff;
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
  font-size: clamp(2rem, 4vw, 3.3rem);
  line-height: 1.05;
  color: #f7fbff;
}

h2 {
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  color: #f7fbff;
}

.lead {
  max-width: 62ch;
  color: rgba(220, 231, 255, 0.74);
  line-height: 1.7;
}

.summary-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-item {
  display: grid;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(159, 187, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.summary-item span {
  color: rgba(220, 231, 255, 0.68);
  font-size: 0.92rem;
}

.summary-item strong {
  color: #f7fbff;
  font-size: 1.06rem;
  line-height: 1.4;
}

.shortcut-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.shortcut {
  display: grid;
  gap: 8px;
  padding: 18px;
  text-align: left;
  border-radius: 18px;
  border: 1px solid rgba(159, 187, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f7fbff;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.shortcut strong {
  font-size: 1rem;
}

.shortcut span {
  color: rgba(220, 231, 255, 0.72);
  line-height: 1.6;
}

.shortcut:hover {
  border-color: rgba(127, 180, 255, 0.3);
  background: rgba(63, 111, 224, 0.12);
  transform: translateY(-1px);
}

.status-list {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.status-note {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(159, 187, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.status-note strong {
  color: #f7fbff;
}

.status-note p,
.empty-state {
  color: rgba(220, 231, 255, 0.72);
  line-height: 1.7;
}

.empty-state {
  padding: 6px 2px 0;
}

button {
  border: 0;
  font: inherit;
  cursor: pointer;
}
</style>
