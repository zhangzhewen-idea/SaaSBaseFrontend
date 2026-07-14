<script setup lang="ts">
defineOptions({
  name: 'ClientLoginPage',
})

import { ref } from 'vue'

import { login } from '../../auth/auth.adapter'
import { redirectToHome } from '../../auth/auth.guard'

const username = ref('tenant')
const password = ref('demo123')
const loading = ref(false)
const errorText = ref('')

async function handleSubmit(): Promise<void> {
  errorText.value = ''
  loading.value = true

  try {
    await login(username.value, password.value)
    redirectToHome()
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : '登录名或密码错误'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <view class="page">
    <view class="card">
      <text class="title">
        用户端登录
      </text>
      <text class="hint">
        仅演示 `tenant / demo123`。
      </text>

      <view class="form">
        <view class="field">
          <text>用户名</text>
          <input v-model="username">
        </view>
        <view class="field">
          <text>密码</text>
          <input
            v-model="password"
            password
          >
        </view>

        <text
          v-if="errorText"
          class="error"
        >
          {{ errorText }}
        </text>

        <button
          :disabled="loading"
          @click="handleSubmit"
        >
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </view>
    </view>
  </view>
</template>

<style scoped>

.page {
  min-height: 100vh;
  padding: 32px 16px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.18), transparent 30%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.14), transparent 28%),
    linear-gradient(160deg, #07111f 0%, #0b1729 100%);
}

.card {
  max-width: 720rpx;
  margin: 0 auto;
  padding: 32px;
  border-radius: 28rpx;
  background: rgba(10, 18, 31, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 24rpx 80rpx rgba(2, 8, 20, 0.42);
}

.title {
  display: block;
  font-size: 40rpx;
  font-weight: 700;
  color: #f7fbff;
}

.hint {
  display: block;
  margin-top: 12px;
  color: rgba(220, 231, 255, 0.72);
}

.form {
  margin-top: 24px;
  display: grid;
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
  color: rgba(235, 242, 255, 0.88);
}

.field input {
  min-height: 88rpx;
  padding: 0 16px;
  border-radius: 20rpx;
  background: rgba(255, 255, 255, 0.05);
  color: #f7fbff;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.error {
  color: #fca5a5;
}

button {
  margin-top: 8px;
  min-height: 88rpx;
  border-radius: 999rpx;
  border: 0;
  color: #f7fbff;
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
}
</style>
