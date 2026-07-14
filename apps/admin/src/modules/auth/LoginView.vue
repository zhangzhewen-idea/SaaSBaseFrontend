<template>
  <section class="login-page" aria-labelledby="login-title">
    <el-card class="login-shell" shadow="always">
      <div class="brand-panel">
        <p class="login-eyebrow">SaaSBase Admin</p>
        <h1 id="login-title">登录到管理后台</h1>
        <p class="brand-copy">
          使用真实租户账号进入管理端，登录后根据权限进入对应工作区。
        </p>
      </div>

      <el-form
        class="login-form"
        label-position="top"
        :model="form"
        @submit.prevent
      >
        <el-form-item label="租户编码">
          <el-input v-model="form.tenantCode" autocomplete="organization" />
        </el-form-item>

        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>

        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" show-password autocomplete="current-password" />
        </el-form-item>

        <el-alert v-if="errorMessage" :title="errorMessage" type="error" :closable="false" />

        <el-button type="primary" :loading="loading" @click="handleSubmit">登录</el-button>
      </el-form>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from './auth.store'
import type { AuthSession } from '@saasbase/shared'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({
  tenantCode: 'tenant-a',
  username: 'alice',
  password: 'pass123'
})

const errorMessage = ref('')
const loading = ref(false)

function resolveDefaultRedirect(session: AuthSession): string {
  return session.role === 'platform-admin' ? '/platform/tenants' : '/dashboard'
}

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  loading.value = true

  try {
    const session = await authStore.login(form.tenantCode, form.username, form.password)
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
    radial-gradient(circle at top left, rgba(77, 126, 255, 0.18), transparent 34%),
    radial-gradient(circle at bottom right, rgba(56, 193, 219, 0.12), transparent 28%),
    var(--color-bg);
}

.login-shell {
  width: min(960px, 100%);
  display: grid;
  gap: 24px;
  grid-template-columns: minmax(0, 1fr) 360px;
  align-items: center;
  border-radius: 28px;
}

.brand-panel {
  padding: 12px 8px 12px 12px;
}

.login-eyebrow {
  margin: 0 0 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-brand-500);
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.06;
  color: var(--color-text);
}

.brand-copy {
  margin: 16px 0 0;
  color: var(--color-text-weak);
  line-height: 1.7;
}

.login-form {
  display: grid;
  gap: 16px;
  padding: 28px;
  border-left: 1px solid var(--color-border);
}

.login-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.login-form :deep(.el-button) {
  width: 100%;
}

@media (max-width: 900px) {
  .login-shell {
    grid-template-columns: 1fr;
  }

  .login-form {
    border-left: 0;
    border-top: 1px solid var(--color-border);
  }
}
</style>
