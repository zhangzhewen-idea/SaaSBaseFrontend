<script setup lang="ts">
defineOptions({
  name: 'ClientHomePage',
})

import { ref } from 'vue'

import { clearSession } from '../../auth/auth.adapter'

type DemoState = 'loading' | 'empty' | 'error' | 'success'

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
  globalThis.uni.reLaunch({ url: '/pages/login/index' })
}
</script>

<template>
  <view class="page">
    <view class="card">
      <text class="title">
        首页
      </text>

      <view class="controls">
        <button @click="loadDemoState('loading')">
          Loading
        </button>
        <button @click="loadDemoState('empty')">
          Empty
        </button>
        <button @click="loadDemoState('error')">
          Error
        </button>
        <button @click="loadDemoState('success')">
          Success
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
