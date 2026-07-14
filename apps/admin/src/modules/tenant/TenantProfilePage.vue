<template>
  <section class="tenant-profile-page">
    <header class="hero card">
      <div>
        <p class="eyebrow">Tenant Profile</p>
        <h2>租户资料</h2>
        <p class="lead">展示当前租户基础信息、管理员账号和后端授予的权限范围。</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost" @click="handleReload">刷新</button>
      </div>
    </header>

    <section class="card profile-card">
      <div class="table-head">
        <div>
          <strong>当前租户</strong>
          <p>{{ state.profile?.tenantName || '尚未加载租户资料' }}</p>
        </div>
        <span>{{ state.loading ? '加载中' : '已加载' }}</span>
      </div>

      <p v-if="state.loading" class="state">正在加载租户资料...</p>
      <p v-else-if="state.error" class="state error">{{ state.error }}</p>
      <div v-else-if="state.profile" class="detail-grid">
        <div>
          <span>租户 ID</span>
          <strong>{{ state.profile.tenantId ?? '-' }}</strong>
        </div>
        <div>
          <span>租户编码</span>
          <strong>{{ state.profile.tenantCode ?? '-' }}</strong>
        </div>
        <div>
          <span>租户名称</span>
          <strong>{{ state.profile.tenantName ?? '-' }}</strong>
        </div>
        <div>
          <span>管理员账号</span>
          <strong>{{ state.profile.adminUsername ?? '-' }}</strong>
        </div>
        <div>
          <span>管理员显示名</span>
          <strong>{{ state.profile.adminDisplayName ?? '-' }}</strong>
        </div>
        <div>
          <span>可见权限</span>
          <strong>{{ state.profile.permissions?.length ?? 0 }} 项</strong>
        </div>
      </div>

      <p v-else class="state">暂无租户资料。</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useTenantProfileModule } from './useTenantProfileModule'

const { state, loadProfile } = useTenantProfileModule()

onMounted(() => {
  void loadProfile()
})

function handleReload(): void {
  void loadProfile()
}
</script>

<style scoped>
.tenant-profile-page {
  display: grid;
  gap: 22px;
}

.card {
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.94), rgba(9, 16, 30, 0.92));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
  backdrop-filter: blur(18px);
}

.hero,
.profile-card {
  padding: 24px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

h2,
p {
  margin: 0;
}

.lead {
  margin-top: 10px;
  color: rgba(220, 231, 255, 0.74);
  line-height: 1.7;
}

.table-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;
}

.table-head strong {
  color: #f7fbff;
}

.table-head p,
.state {
  color: rgba(220, 231, 255, 0.72);
}

.state.error {
  color: #fca5a5;
}

.detail-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.detail-grid div {
  display: grid;
  gap: 8px;
  padding: 18px 20px;
  border-radius: 18px;
  border: 1px solid rgba(159, 187, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
}

.detail-grid span {
  color: rgba(220, 231, 255, 0.68);
}

.detail-grid strong {
  color: #f7fbff;
}

button {
  border: 0;
  font: inherit;
  cursor: pointer;
}
</style>
