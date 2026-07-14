<template>
  <el-container class="admin-shell">
    <el-aside class="sidebar" width="260px">
      <div class="brand-block">
        <p class="brand">SaaSBase Admin</p>
        <p class="desc">Element Plus 工作台</p>
      </div>

      <el-menu
        class="nav"
        :default-active="activePath"
        :router="true"
      >
        <el-menu-item index="/dashboard">工作台</el-menu-item>
        <el-menu-item
          v-if="hasPermission('tenant:profile:read')"
          index="/tenant/profile"
        >
          租户资料
        </el-menu-item>
        <el-menu-item index="/users">用户管理</el-menu-item>
        <el-menu-item index="/departments">部门管理</el-menu-item>
        <el-menu-item index="/files">文件管理</el-menu-item>
        <el-menu-item
          v-if="roleLabel === '平台管理员'"
          index="/platform/tenants"
        >
          平台租户
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <span>当前会话</span>
        <strong>{{ sessionLabel }}</strong>
      </div>
    </el-aside>

    <el-container class="workspace">
      <el-header class="topbar">
        <div class="title-block">
          <p class="eyebrow">Tenant Control Center</p>
          <h1>{{ title }}</h1>
        </div>

        <div class="topbar-actions">
          <el-tag effect="light">{{ roleLabel }}</el-tag>
          <el-button type="primary" plain @click="handleSignOut">
            退出登录
          </el-button>
        </div>
      </el-header>

      <el-main class="content">
        <RouterView />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

import { useAuth } from '../modules/auth/useAuth'

const route = useRoute()
const router = useRouter()
const { session, signOut, hasPermission } = useAuth()

const title = computed(() => (route.meta.title as string | undefined) ?? '工作台')
const activePath = computed(() => route.path)

const roleLabel = computed(() => {
  switch (session.value?.role) {
    case 'platform-admin':
      return '平台管理员'
    case 'tenant-admin':
      return '租户管理员'
    case 'tenant-member':
      return '租户成员'
    default:
      return '未登录'
  }
})

const sessionLabel = computed(() => session.value?.userId ?? 'guest')

function handleSignOut(): void {
  signOut()
  router.push('/login')
}
</script>

<style scoped>
.admin-shell {
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
  font-size: 1.15rem;
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

.nav :deep(.el-menu-item) {
  border-radius: 12px;
  margin-bottom: 6px;
}

.nav :deep(.el-menu-item.is-active) {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.sidebar-footer {
  margin-top: auto;
  padding: 12px 10px 6px;
  display: grid;
  gap: 6px;
  color: var(--color-text-weak);
}

.sidebar-footer strong {
  color: var(--color-text);
}

.workspace {
  background:
    radial-gradient(circle at top left, rgba(63, 111, 224, 0.08), transparent 30%),
    radial-gradient(circle at bottom right, rgba(56, 193, 219, 0.06), transparent 24%);
}

.content {
  padding: 24px;
}

.topbar {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
  margin: 0 0 20px;
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

.eyebrow {
  margin: 0 0 8px;
  color: #7fb4ff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  font-size: 1.7rem;
  color: var(--color-text);
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page {
  min-width: 0;
}

@media (max-width: 1024px) {
  .admin-shell {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }

  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
