<script setup lang="ts">
defineOptions({
  name: 'ClientHomePage',
})

import { ref } from 'vue'

import { clearSession, getSession } from '../../auth/auth.adapter'
import { ensureClientSession, redirectToLogin } from '../../auth/auth.guard'

type DemoState = 'loading' | 'empty' | 'error' | 'success'

if (!ensureClientSession()) {
  redirectToLogin()
}

const demoState = ref<DemoState>('success')
const message = ref('首页已加载')

async function loadDemoState(state: DemoState): Promise<void> {
  demoState.value = state
  await Promise.resolve()
  if (state === 'loading') message.value = '正在加载首页'
  else if (state === 'empty') message.value = '暂无首页内容'
  else if (state === 'error') message.value = '首页加载失败'
  else message.value = '首页已加载'
}

function handleLogout(): void {
  clearSession()
  redirectToLogin()
}
</script>

<template>
  <view class="page">
    <view class="card">
      <text class="title">
        首页
      </text>

      <view class="profile">
        <text class="label">当前用户</text>
        <text class="value">{{ getSession()?.displayName ?? '未登录' }}</text>
      </view>

      <view class="controls">
        <button @click="loadDemoState('loading')">
          加载中
        </button>
        <button @click="loadDemoState('empty')">
          空状态
        </button>
        <button @click="loadDemoState('error')">
          错误
        </button>
        <button @click="loadDemoState('success')">
          正常
        </button>
      </view>

      <view v-if="demoState === 'loading'">
        <text class="message">
          {{ message }}
        </text>
      </view>
      <view v-else-if="demoState === 'empty'">
        <text class="message">
          {{ message }}
        </text>
      </view>
      <view v-else-if="demoState === 'error'">
        <text class="message">
          {{ message }}
        </text>
      </view>
      <view v-else>
        <text class="message">
          {{ message }}
        </text>
      </view>

      <button @click="handleLogout">
        退出
      </button>
    </view>
  </view>
</template>

<style scoped>

.page {
  min-height: 100vh;
  padding: 32px 16px;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 30%),
    radial-gradient(circle at bottom right, rgba(14, 165, 233, 0.1), transparent 28%),
    linear-gradient(160deg, #07111f 0%, #0b1729 100%);
}

.card {
  max-width: 900rpx;
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

.profile {
  margin-top: 16px;
  padding: 16px;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.05);
}

.label {
  display: block;
  color: rgba(220, 231, 255, 0.72);
}

.value {
  display: block;
  margin-top: 8px;
  color: #f7fbff;
  font-weight: 700;
}

.controls {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 24px;
}

.message {
  display: block;
  margin: 24px 0;
  color: rgba(220, 231, 255, 0.88);
}

button {
  min-height: 80rpx;
  border-radius: 999rpx;
  border: 0;
  color: #f7fbff;
  background: rgba(255, 255, 255, 0.08);
}
</style>
