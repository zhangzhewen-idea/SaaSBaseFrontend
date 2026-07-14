<template>
  <section v-if="open" class="detail-panel">
    <el-card>
      <template #header>
        <div class="header">
          <div>
            <p class="eyebrow">User Detail</p>
            <h3>用户详情</h3>
          </div>
          <el-button @click="$emit('close')">关闭</el-button>
        </div>
      </template>

      <el-skeleton v-if="loading" :rows="6" animated />
      <el-alert v-else-if="error" :title="error" type="error" :closable="false" />
      <el-descriptions v-else-if="user" :column="2" border>
        <el-descriptions-item label="姓名">{{ user.name }}</el-descriptions-item>
        <el-descriptions-item label="账号">{{ user.username }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ user.role }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ user.status }}</el-descriptions-item>
        <el-descriptions-item label="部门">{{ user.departmentId ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ user.phone ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ user.email ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="最近登录">{{ user.lastLoginAt ?? '-' }}</el-descriptions-item>
        <el-descriptions-item label="权限" :span="2">{{ user.permissionCodes.join('，') || '-' }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import type { UserDetail } from './users.types'

defineProps<{
  open: boolean
  loading: boolean
  error: string | null
  user: UserDetail | null
}>()

defineEmits<{
  close: []
}>()
</script>

<style scoped>
.detail-panel {
  margin-top: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
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

h3 {
  margin: 0;
}
</style>
