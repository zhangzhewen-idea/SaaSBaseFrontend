<template>
  <section class="tenant-profile-page">
    <el-card>
      <template #header>
        <div class="hero">
          <div>
            <p class="eyebrow">Tenant Profile</p>
            <h2>租户资料</h2>
            <p class="lead">展示当前租户基础信息、管理员账号和后端授予的权限范围。</p>
          </div>
          <el-button @click="handleReload">刷新</el-button>
        </div>
      </template>

      <el-alert v-if="state.loading" title="正在加载租户资料..." type="info" :closable="false" />
      <el-alert v-else-if="state.error" :title="state.error" type="error" :closable="false" />
      <el-empty v-else-if="!state.profile" description="暂无租户资料。" />
      <el-descriptions v-else :column="2" border>
        <el-descriptions-item label="租户 ID">{{ state.profile.tenantId ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="租户编码">{{ state.profile.tenantCode ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="租户名称">{{ state.profile.tenantName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="管理员账号">{{ state.profile.adminUsername ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="管理员显示名">{{ state.profile.adminDisplayName ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="可见权限">{{ state.profile.permissions?.length ?? 0 }} 项</el-descriptions-item>
      </el-descriptions>
    </el-card>
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

.hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
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

.lead {
  margin-top: 10px;
  color: var(--color-text-weak);
  line-height: 1.7;
}
</style>
