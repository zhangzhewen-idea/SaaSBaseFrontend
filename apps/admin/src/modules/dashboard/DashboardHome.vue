<template>
  <section class="dashboard-home">
    <el-card>
      <template #header>
        <div class="card-head">
          <div>
            <p class="eyebrow">Session Summary</p>
            <h1>会话摘要</h1>
          </div>
          <p class="lead">先确认当前身份、租户和权限，再进入后续操作。</p>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col v-for="item in sessionSummary" :key="item.label" :xs="24" :sm="12" :md="8">
          <el-card shadow="never" class="summary-card">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-head">
          <div>
            <p class="eyebrow">Quick Links</p>
            <h2>快捷入口</h2>
          </div>
          <p class="lead">只展示当前会话可访问的主链路，未授权入口不会出现。</p>
        </div>
      </template>

      <el-space wrap v-if="visibleShortcuts.length" :size="16">
        <el-card
          v-for="item in visibleShortcuts"
          :key="item.title"
          class="shortcut-card"
          shadow="hover"
          @click="handleNavigate(item.path)"
        >
          <strong>{{ item.title }}</strong>
          <p>{{ item.description }}</p>
        </el-card>
      </el-space>

      <el-empty v-else description="当前会话没有可用入口。"/>
    </el-card>

    <el-card>
      <template #header>
        <div class="card-head">
          <div>
            <p class="eyebrow">Status Notes</p>
            <h2>状态说明</h2>
          </div>
          <p class="lead">首页只保留必要信息，避免把平台侧总览和演示功能塞回入口页。</p>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col v-for="note in dashboardStatusNotes" :key="note.title" :xs="24" :sm="12" :md="8">
          <el-card shadow="never" class="status-card">
            <strong>{{ note.title }}</strong>
            <p>{{ note.description }}</p>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
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

.card-head {
  display: grid;
  gap: 10px;
}

.eyebrow {
  margin: 0;
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
  font-size: clamp(2rem, 4vw, 3rem);
}

.lead {
  color: var(--color-text-weak);
  line-height: 1.7;
}

.summary-card,
.shortcut-card,
.status-card {
  height: 100%;
}

.summary-card span,
.status-card p,
.shortcut-card p {
  color: var(--color-text-weak);
}

.summary-card strong {
  display: block;
  margin-top: 10px;
  color: var(--color-text);
}

.shortcut-card {
  width: 280px;
  cursor: pointer;
}

.shortcut-card strong {
  display: block;
}

.shortcut-card p {
  margin-top: 8px;
  line-height: 1.6;
}
</style>
