<script setup lang="ts">
defineOptions({
  name: 'ClientProfilePage',
})

import { computed, onMounted, ref } from 'vue'

import { clearSession, getSession } from '../../auth/auth.adapter'
import { ensureClientSession, redirectToLogin } from '../../auth/auth.guard'
import { resolveRoleLabel } from '../home/home.view-model'
import { fetchTenantProfile, type ClientTenantProfile } from './profile.api'
import { resolveProfileFieldItems } from './profile.view-model'

if (!ensureClientSession()) {
  redirectToLogin()
}

const session = computed(() => getSession())
const roleLabel = computed(() => resolveRoleLabel(session.value))
const profile = ref<ClientTenantProfile | null>(null)
const loading = ref(false)
const errorText = ref('')
const fieldItems = computed(() => resolveProfileFieldItems(profile.value, session.value))

onMounted(() => {
  void loadProfile()
})

async function loadProfile(): Promise<void> {
  loading.value = true
  errorText.value = ''

  try {
    profile.value = await fetchTenantProfile()
  } catch (error) {
    errorText.value = error instanceof Error ? error.message : '租户资料加载失败'
  } finally {
    loading.value = false
  }
}

function handleLogout(): void {
  clearSession()
  redirectToLogin()
}

function handleBackHome(): void {
  globalThis.uni?.reLaunch?.({ url: '/pages/home/index' })
}
</script>

<template>
  <view class="page">
    <view class="card">
      <text class="title">
        个人资料
      </text>
      <text class="hint">
        展示当前登录账号的基础信息和权限概况。
      </text>

      <view
        v-if="loading"
        class="state"
      >
        正在加载资料...
      </view>
      <view
        v-else-if="errorText"
        class="state error"
      >
        {{ errorText }}
      </view>

      <view class="profile-grid">
        <view class="profile-item">
          <text class="label">
            显示名
          </text>
          <text class="value">
            {{ session?.displayName ?? '-' }}
          </text>
        </view>
        <view class="profile-item">
          <text class="label">
            用户 ID
          </text>
          <text class="value">
            {{ session?.userId ?? '-' }}
          </text>
        </view>
        <view class="profile-item">
          <text class="label">
            角色
          </text>
          <text class="value">
            {{ roleLabel }}
          </text>
        </view>
        <view class="profile-item">
          <text class="label">
            权限数
          </text>
          <text class="value">
            {{ session?.permissions.length ?? 0 }} 项
          </text>
        </view>
      </view>

      <view class="permissions">
        <text class="section-title">
          服务端资料
        </text>
        <view class="permission-list">
          <view
            v-for="item in fieldItems"
            :key="item.label"
            class="permission-item"
          >
            <text class="label">
              {{ item.label }}
            </text>
            <text class="value">
              {{ item.value }}
            </text>
          </view>
        </view>
      </view>

      <view class="permissions">
        <text class="section-title">
          权限列表
        </text>
        <view
          v-if="session?.permissions?.length"
          class="permission-list"
        >
          <text
            v-for="permission in session.permissions"
            :key="permission"
            class="permission-item"
          >
            {{ permission }}
          </text>
        </view>
        <text
          v-else
          class="empty"
        >
          当前没有可展示的权限。
        </text>
      </view>

      <view class="actions">
        <button @click="handleBackHome">
          返回首页
        </button>
        <button @click="handleLogout">
          退出登录
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

.hint,
.empty {
  display: block;
  margin-top: 12px;
  color: rgba(220, 231, 255, 0.72);
}

.state {
  margin-top: 16px;
  padding: 16px;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(220, 231, 255, 0.82);
}

.state.error {
  color: #fca5a5;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 24px;
}

.profile-item,
.permission-item {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 22rpx;
  background: rgba(255, 255, 255, 0.05);
}

.label {
  color: rgba(220, 231, 255, 0.72);
}

.value {
  color: #f7fbff;
  font-weight: 700;
}

.permissions {
  margin-top: 24px;
}

.section-title {
  display: block;
  color: #f7fbff;
  font-weight: 700;
}

.permission-list {
  margin-top: 12px;
  display: grid;
  gap: 10px;
}

.permission-item {
  color: rgba(235, 242, 255, 0.9);
}

.actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 24px;
}

button {
  min-height: 88rpx;
  border-radius: 999rpx;
  border: 0;
  color: #f7fbff;
  background: rgba(255, 255, 255, 0.08);
}
</style>
