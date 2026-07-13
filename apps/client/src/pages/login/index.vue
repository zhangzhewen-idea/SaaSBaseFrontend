<script setup lang="ts">
defineOptions({
  name: 'ClientLoginPage',
})

import { ref } from 'vue'

import { login } from '../../auth/auth.adapter'

const username = ref('tenant')
const password = ref('demo123')
const loading = ref(false)
const errorText = ref('')

async function handleSubmit(): Promise<void> {
  errorText.value = ''
  loading.value = true

  try {
    await login(username.value, password.value)
    globalThis.uni.reLaunch({ url: '/pages/home/index' })
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
          登录
        </button>
      </view>
    </view>
  </view>
</template>
