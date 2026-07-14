<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')">
    <section class="dialog" role="dialog" aria-modal="true" aria-label="用户详情">
      <header class="dialog__header">
        <div>
          <p class="eyebrow">User Detail</p>
          <h3>用户详情</h3>
        </div>
        <button type="button" @click="$emit('close')">关闭</button>
      </header>

      <p v-if="loading" class="state">正在加载用户详情...</p>
      <p v-else-if="error" class="state error">{{ error }}</p>
      <article v-else-if="user" class="detail">
        <dl>
          <dt>姓名</dt>
          <dd>{{ user.name }}</dd>

          <dt>账号</dt>
          <dd>{{ user.username }}</dd>

          <dt>角色</dt>
          <dd>{{ user.role }}</dd>

          <dt>状态</dt>
          <dd>{{ user.status }}</dd>

          <dt>部门</dt>
          <dd>{{ user.departmentId ?? '-' }}</dd>

          <dt>手机号</dt>
          <dd>{{ user.phone ?? '-' }}</dd>

          <dt>邮箱</dt>
          <dd>{{ user.email ?? '-' }}</dd>

          <dt>最近登录</dt>
          <dd>{{ user.lastLoginAt ?? '-' }}</dd>

          <dt>权限</dt>
          <dd>{{ user.permissionCodes.join('，') || '-' }}</dd>
        </dl>
      </article>
    </section>
  </div>
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
.overlay {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(1, 7, 18, 0.58);
  padding: 24px;
  backdrop-filter: blur(8px);
}

.dialog {
  width: min(720px, 100%);
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.98), rgba(9, 16, 30, 0.96));
  border-radius: 24px;
  border: 1px solid rgba(151, 180, 238, 0.14);
  box-shadow: 0 32px 72px rgba(2, 8, 20, 0.48);
  padding: 24px;
}

.dialog__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7fb4ff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h3 {
  margin: 0;
  font-size: 1.3rem;
}

.state {
  margin: 0;
  color: rgba(220, 231, 255, 0.72);
}

.state.error {
  color: #ffb4b4;
}

.detail dl {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 12px 16px;
  margin: 0;
}

dt {
  color: rgba(175, 193, 223, 0.9);
  font-weight: 600;
}

dd {
  margin: 0;
  color: #f7fbff;
}

button {
  border: 1px solid rgba(159, 187, 255, 0.16);
  background: rgba(255, 255, 255, 0.04);
  color: #e8efff;
  border-radius: 12px;
  min-height: 40px;
  padding: 0 14px;
}
</style>
