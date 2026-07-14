<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from './auth.store'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('platform')
const password = ref('demo123')
const errorMessage = ref('')
const loading = ref(false)

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  loading.value = true

  try {
    const session = await authStore.login(username.value, password.value)
    const targetPath = session.role === 'platform-admin' ? '/platform/overview' : '/tenant/workspace'

    await router.push(targetPath)
    ElMessage.success('登录成功')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录名或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section
    class="login-page"
    aria-labelledby="login-title"
  >
    <div class="login-card">
      <p class="login-eyebrow">
        SaaSBase 管理端
      </p>
      <h1 id="login-title">
        登录到管理控制台
      </h1>
      <p class="login-hint">
        支持两个模拟账号：`platform / demo123` 和 `tenant / demo123`。
      </p>

      <form
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <label class="field">
          <span>用户名</span>
          <input
            v-model="username"
            autocomplete="username"
            name="username"
            type="text"
          >
        </label>

        <label class="field">
          <span>密码</span>
          <input
            v-model="password"
            autocomplete="current-password"
            name="password"
            type="password"
          >
        </label>

        <p
          v-if="errorMessage"
          role="alert"
          class="error-text"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="loading"
        >
          登录
        </button>
      </form>
    </div>
  </section>
</template>
