<template>
  <section class="login-page" aria-labelledby="login-title">
    <div class="login-shell">
      <aside class="brand-panel">
        <p class="login-eyebrow">SaaSBase Admin</p>
        <h1 id="login-title">统一管理租户、部门和用户权限</h1>
        <p class="brand-copy">
          真实后端接入，登录后直接进入管理工作台。深色主题更适合长时间操作和高密度信息处理。
        </p>

        <ul class="feature-list" aria-label="页面特性">
          <li>
            <strong>实时接口</strong>
            <span>直连 `localhost:8080`，无演示兜底数据</span>
          </li>
          <li>
            <strong>权限控制</strong>
            <span>按后端权限码控制菜单与页面入口</span>
          </li>
          <li>
            <strong>操作清晰</strong>
            <span>登录、刷新与退出统一走认证模块</span>
          </li>
        </ul>
      </aside>

      <div class="login-card">
        <div class="card-header">
          <p class="card-kicker">Admin Console</p>
          <h2>登录到管理控制台</h2>
          <p class="login-hint">请输入真实租户编码、用户名和密码。</p>
        </div>

        <form class="login-form" @submit.prevent="handleSubmit">
          <label class="field">
            <span>租户编码</span>
            <input v-model="tenantCode" autocomplete="organization" name="tenantCode" type="text" />
          </label>

          <label class="field">
            <span>用户名</span>
            <input v-model="username" autocomplete="username" name="username" type="text" />
          </label>

          <label class="field">
            <span>密码</span>
            <input v-model="password" autocomplete="current-password" name="password" type="password" />
          </label>

          <p v-if="errorMessage" role="alert" class="error-text">{{ errorMessage }}</p>

          <button type="submit" :disabled="loading">{{ loading ? '登录中...' : '进入控制台' }}</button>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from './auth.store'
import type { AuthSession } from '@saasbase/shared'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const tenantCode = ref('tenant-a')
const username = ref('alice')
const password = ref('pass123')
const errorMessage = ref('')
const loading = ref(false)

function resolveDefaultRedirect(session: AuthSession): string {
  return session.role === 'platform-admin' ? '/platform/tenants' : '/dashboard'
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  loading.value = true

  try {
    const session = await authStore.login(tenantCode.value, username.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : resolveDefaultRedirect(session)
    await router.replace(redirect)
    ElMessage.success('登录成功')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at top left, rgba(77, 126, 255, 0.32), transparent 36%),
    radial-gradient(circle at bottom right, rgba(56, 193, 219, 0.16), transparent 30%),
    linear-gradient(160deg, #07111f 0%, #091423 52%, #0b1729 100%);
  color: #e8efff;
}

.login-shell {
  width: min(1180px, 100%);
  min-height: 680px;
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 28px;
}

.brand-panel,
.login-card {
  border: 1px solid rgba(159, 187, 255, 0.16);
  border-radius: 28px;
  backdrop-filter: blur(24px);
  box-shadow: 0 24px 80px rgba(2, 8, 20, 0.42);
}

.brand-panel {
  padding: 56px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(180deg, rgba(14, 25, 44, 0.76), rgba(9, 16, 30, 0.54));
}

.login-card {
  align-self: center;
  padding: 42px;
  background: rgba(11, 19, 34, 0.82);
}

.login-eyebrow,
.card-kicker {
  margin: 0 0 14px;
  text-transform: uppercase;
  letter-spacing: 0.22em;
  font-size: 0.75rem;
  color: #7fb4ff;
  font-weight: 700;
}

h1,
h2 {
  margin: 0;
  line-height: 1.06;
}

h1 {
  max-width: 10ch;
  font-size: clamp(2.8rem, 6vw, 4.9rem);
}

h2 {
  font-size: clamp(1.6rem, 2vw, 2.2rem);
}

.brand-copy,
.login-hint {
  margin: 18px 0 0;
  color: rgba(220, 231, 255, 0.76);
  line-height: 1.7;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 36px 0 0;
  display: grid;
  gap: 16px;
}

.feature-list li {
  padding: 18px 20px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(159, 187, 255, 0.12);
}

.feature-list strong {
  display: block;
  margin-bottom: 6px;
  color: #f2f6ff;
}

.feature-list span {
  color: rgba(220, 231, 255, 0.72);
  line-height: 1.6;
}

.card-header {
  margin-bottom: 28px;
}

.login-form {
  display: grid;
  gap: 18px;
}

.field {
  display: grid;
  gap: 10px;
  color: rgba(235, 242, 255, 0.88);
  font-size: 0.95rem;
}

.field input {
  min-height: 48px;
  border: 1px solid rgba(159, 187, 255, 0.18);
  border-radius: 16px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.04);
  color: #f7fbff;
  outline: none;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.field input:focus {
  border-color: rgba(109, 169, 255, 0.88);
  box-shadow: 0 0 0 4px rgba(63, 111, 224, 0.24);
}

.error-text {
  margin: 0;
  color: #ffb4b4;
}

button {
  min-height: 50px;
  border: 0;
  border-radius: 16px;
  background: linear-gradient(135deg, #4f7df3 0%, #2f5fd0 100%);
  color: #f7fbff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
  box-shadow: 0 14px 28px rgba(47, 95, 208, 0.32);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

button:disabled {
  opacity: 0.72;
  cursor: wait;
}

@media (max-width: 960px) {
  .login-shell {
    grid-template-columns: 1fr;
    min-height: auto;
  }

  .brand-panel,
  .login-card {
    padding: 28px;
  }

  .brand-panel {
    order: 2;
  }

  .login-card {
    order: 1;
  }
}
</style>
