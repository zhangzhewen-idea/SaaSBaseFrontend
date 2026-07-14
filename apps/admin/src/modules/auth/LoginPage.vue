<template>
  <section class="login-page" aria-labelledby="login-title">
    <div class="login-card">
      <p class="login-eyebrow">SaaSBase 管理端</p>
      <h1 id="login-title">登录到管理后台</h1>
      <p class="login-hint">请输入真实租户编码、用户名和密码。</p>

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

        <button type="submit" :disabled="loading">登录</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import { useAuthStore } from './auth.store'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const tenantCode = ref('tenant-a')
const username = ref('alice')
const password = ref('pass123')
const errorMessage = ref('')
const loading = ref(false)

async function handleSubmit(): Promise<void> {
  errorMessage.value = ''
  loading.value = true

  try {
    await authStore.login(tenantCode.value, username.value, password.value)
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
    await router.replace(redirect)
    ElMessage.success('登录成功')
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '登录失败'
  } finally {
    loading.value = false
  }
}
</script>
