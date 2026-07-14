<script setup lang="ts">
defineOptions({
  name: 'ClientMessagesPage',
})

import { computed } from 'vue'

import { getSession } from '../../auth/auth.adapter'

interface MessageItem {
  title: string
  time: string
  content: string
}

const session = computed(() => getSession())

const messages: MessageItem[] = [
  {
    title: '欢迎使用',
    time: '刚刚',
    content: '你已经登录到客户端首页，可以从这里进入个人资料或继续浏览功能入口。'
  },
  {
    title: '权限提示',
    time: '今天',
    content: '当前会话权限决定你能看到的入口，后续接入服务端消息后可以替换为真实数据。'
  },
  {
    title: '系统状态',
    time: '今天',
    content: '现在的消息中心是轻量本地版本，用于承接首页的公告和消息入口。'
  }
]

function handleBackHome(): void {
  globalThis.uni?.reLaunch?.({ url: '/pages/home/index' })
}
</script>

<template>
  <view class="page">
    <view class="card">
      <text class="title">
        消息中心
      </text>
      <text class="hint">
        当前用户：{{ session?.displayName ?? '未登录' }}
      </text>

      <view class="message-list">
        <view
          v-for="item in messages"
          :key="item.title"
          class="message-item"
        >
          <view class="message-head">
            <text class="message-title">
              {{ item.title }}
            </text>
            <text class="message-time">
              {{ item.time }}
            </text>
          </view>
          <text class="message-content">
            {{ item.content }}
          </text>
        </view>
      </view>

      <view class="actions">
        <button @click="handleBackHome">
          返回首页
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
  max-width: 820rpx;
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

.message-list {
  display: grid;
  gap: 12px;
  margin-top: 24px;
}

.message-item {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.05);
}

.message-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.message-title {
  color: #f7fbff;
  font-weight: 700;
}

.message-time,
.message-content {
  color: rgba(220, 231, 255, 0.76);
}

.actions {
  margin-top: 24px;
}

button {
  min-height: 88rpx;
  width: 100%;
  border-radius: 999rpx;
  border: 0;
  color: #f7fbff;
  background: rgba(255, 255, 255, 0.08);
}
</style>
