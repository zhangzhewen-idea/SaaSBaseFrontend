<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '../modules/auth/auth.store'

const authStore = useAuthStore()
const router = useRouter()
const { session, tenantName } = storeToRefs(authStore)

const displayName = computed(() => session.value?.displayName ?? '未登录')
const roleLabel = computed(() =>
  session.value?.role === 'platform-admin'
    ? '平台管理员'
    : session.value?.role === 'tenant-admin'
      ? '租户管理员'
      : '访客'
)

function canShow(permission: 'tenant:profile:read' | 'tenant:user:read' | 'tenant:dept:read'): boolean {
  return session.value?.permissions.includes(permission) ?? false
}

function handleLogout(): void {
  void authStore.logout().then(() => router.replace('/login'))
}
</script>

<template>
  <el-container class="domain-shell">
    <el-aside class="sidebar" width="240px">
      <div class="brand-block">
        <p class="brand">SaaSBase Admin</p>
        <p class="desc">租户工作区</p>
      </div>

      <el-menu
        class="nav"
        :default-active="$route.path"
        :router="true"
      >
        <el-menu-item index="/dashboard">工作台</el-menu-item>
        <el-menu-item
          v-if="canShow('tenant:profile:read')"
          index="/tenant/profile"
        >
          租户资料
        </el-menu-item>
        <el-menu-item
          v-if="canShow('tenant:user:read')"
          index="/users"
        >
          用户管理
        </el-menu-item>
        <el-menu-item
          v-if="canShow('tenant:dept:read')"
          index="/departments"
        >
          部门管理
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container class="workspace">
      <el-header class="topbar">
        <div class="title-block">
          <strong>{{ displayName }}</strong>
          <span>{{ roleLabel }} · {{ tenantName || '未获取租户资料' }}</span>
        </div>
        <el-button
          aria-label="退出登录"
          plain
          @click="handleLogout"
        >
          退出
        </el-button>
      </el-header>

      <el-main class="content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.domain-shell {
  min-height: 100vh;
  background: var(--color-bg);
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 24px 18px;
  border-right: 1px solid var(--color-border);
  background: linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%);
}

.brand-block {
  padding: 8px 10px 2px;
}

.brand {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--color-brand-700);
}

.desc {
  margin: 8px 0 0;
  color: var(--color-text-weak);
}

.nav {
  border-right: 0;
  background: transparent;
}

.workspace {
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, rgba(63, 111, 224, 0.08), transparent 30%),
    radial-gradient(circle at bottom right, rgba(56, 193, 219, 0.06), transparent 24%);
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin: 24px 24px 20px;
  padding: 18px 22px;
  border: 1px solid var(--color-border);
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 16px 48px rgba(32, 58, 108, 0.08);
  backdrop-filter: blur(14px);
}

.title-block {
  min-width: 0;
}

.topbar strong {
  display: block;
  color: var(--color-text);
}

.topbar span {
  font-size: 0.92rem;
  color: var(--color-text-weak);
}

.content {
  min-width: 0;
  padding: 0 24px 24px;
}

@media (max-width: 960px) {
  .domain-shell,
  .workspace {
    flex-direction: column;
  }

  .sidebar {
    width: 100% !important;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .topbar {
    margin: 16px 16px 12px;
    flex-direction: column;
    align-items: flex-start;
  }

  .content {
    padding: 0 16px 16px;
  }
}
</style>
