<script setup lang="ts">
defineOptions({
  name: 'ClientHomePage',
})

import { computed, onMounted } from 'vue'

import { clearSession, getSession } from '../../auth/auth.adapter'
import { ensureClientSession, navigateToPage, redirectToLogin } from '../../auth/auth.guard'
import {
  buildHomeNotices,
  buildHomeShortcuts,
  buildHomeSummary,
  buildHomeTasks,
  resolveRoleLabel
} from './home.view-model'

if (!ensureClientSession()) {
  redirectToLogin()
}

onMounted(() => {
  if (!ensureClientSession()) {
    redirectToLogin()
  }
})

const session = computed(() => getSession())
const summaryItems = computed(() => buildHomeSummary(session.value))
const shortcutItems = computed(() => buildHomeShortcuts(session.value))
const taskItems = computed(() => buildHomeTasks(session.value))
const noticeItems = computed(() => buildHomeNotices())
const roleLabel = computed(() => resolveRoleLabel(session.value))

function handleRefresh(): void {
  if (!ensureClientSession()) {
    redirectToLogin()
  }
}

function handleShortcut(path: string): void {
  if (!ensureClientSession()) {
    redirectToLogin()
    return
  }

  if (path === '/pages/home/index') {
    return
  }

  navigateToPage(path)
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
        <text class="label">
          当前用户
        </text>
        <text class="value">
          {{ session?.displayName ?? '未登录' }}
        </text>
      </view>

      <view class="summary">
        <view
          v-for="item in summaryItems"
          :key="item.label"
          class="summary-item"
        >
          <text class="summary-label">
            {{ item.label }}
          </text>
          <text class="summary-value">
            {{ item.value }}
          </text>
        </view>
      </view>

      <view class="section">
        <text class="section-title">
          快捷入口
        </text>
        <view class="shortcut-grid">
          <view
            v-for="item in shortcutItems"
            :key="item.title"
            class="shortcut-item"
            @click="handleShortcut(item.path)"
          >
            <text class="shortcut-title">
              {{ item.title }}
            </text>
            <text class="shortcut-desc">
              {{ item.description }}
            </text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">
          待办事项
        </text>
        <view class="list">
          <view
            v-for="item in taskItems"
            :key="item.title"
            class="list-item"
          >
            <view class="list-head">
              <text class="list-title">
                {{ item.title }}
              </text>
              <text class="list-status">
                {{ item.status }}
              </text>
            </view>
            <text class="list-note">
              {{ item.note }}
            </text>
          </view>
        </view>
      </view>

      <view class="section">
        <text class="section-title">
          公告消息
        </text>
        <view class="list">
          <view
            v-for="item in noticeItems"
            :key="item.title"
            class="list-item"
          >
            <view class="list-head">
              <text class="list-title">
                {{ item.title }}
              </text>
              <text class="list-status">
                {{ item.time }}
              </text>
            </view>
            <text class="list-note">
              {{ item.content }}
            </text>
          </view>
        </view>
      </view>

      <view class="notes">
        <text class="message">
          当前角色：{{ roleLabel }}
        </text>
        <text class="message">
          首页已切换为真实会话展示，不再提供演示状态按钮。
        </text>
      </view>

      <view class="actions">
        <button @click="handleRefresh">
          刷新
        </button>
        <button @click="handleLogout">
          退出
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

.summary {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 24px;
}

.summary-item {
  display: grid;
  gap: 6px;
  padding: 16px;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.05);
}

.summary-label {
  color: rgba(220, 231, 255, 0.72);
}

.summary-value {
  color: #f7fbff;
  font-weight: 700;
}

.section {
  margin-top: 28px;
  display: grid;
  gap: 14px;
}

.section-title {
  color: #f7fbff;
  font-weight: 700;
  font-size: 30rpx;
}

.shortcut-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.shortcut-item,
.list-item {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.05);
}

.shortcut-item {
  cursor: pointer;
}

.shortcut-title,
.list-title {
  color: #f7fbff;
  font-weight: 700;
}

.shortcut-desc,
.list-note {
  color: rgba(220, 231, 255, 0.8);
  line-height: 1.6;
}

.list {
  display: grid;
  gap: 12px;
}

.list-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.list-status {
  color: #7fb4ff;
  font-weight: 700;
}

.notes {
  margin-top: 24px;
  display: grid;
  gap: 10px;
}

.actions {
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
