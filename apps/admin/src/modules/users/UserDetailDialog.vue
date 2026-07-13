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
  background: rgba(11, 31, 58, 0.32);
  padding: 24px;
}

.dialog {
  width: min(720px, 100%);
  background: white;
  border-radius: 24px;
  border: 1px solid var(--color-border);
  box-shadow: 0 32px 64px rgba(19, 32, 51, 0.18);
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
  color: var(--color-brand-500);
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
  color: var(--color-text-weak);
}

.state.error {
  color: #b42318;
}

.detail dl {
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 12px 16px;
  margin: 0;
}

dt {
  color: var(--color-text-weak);
  font-weight: 600;
}

dd {
  margin: 0;
}

button {
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 12px;
  min-height: 40px;
  padding: 0 14px;
}
</style>
