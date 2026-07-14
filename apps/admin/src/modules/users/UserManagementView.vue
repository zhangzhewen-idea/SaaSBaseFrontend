<template>
  <section class="users-page">
    <el-card shadow="never" class="hero-card">
      <template #header>
        <div class="hero">
          <div>
            <p class="eyebrow">Users</p>
            <h2>用户管理</h2>
            <p class="lead">按真实后端数据查询、筛选、启停和重置密码，所有操作直接反馈给接口。</p>
          </div>
          <div class="header-actions">
            <el-button @click="handleResetFilters">重置</el-button>
            <el-button type="primary" @click="handleReload">刷新列表</el-button>
          </div>
        </div>
      </template>

      <el-form :model="filters" inline class="filters" label-position="top">
        <el-form-item label="用户名">
          <el-input v-model="filters.username" placeholder="按用户名搜索" clearable />
        </el-form-item>
        <el-form-item label="部门 ID">
          <el-input v-model="filters.departmentId" placeholder="例如 dept-root" clearable />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="filters.phone" placeholder="按手机号搜索" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button @click="handleResetFilters">清空</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="state.items" stripe border class="table" v-loading="state.loading">
        <el-table-column prop="username" label="用户名" min-width="160">
          <template #default="{ row }">
            <div class="user-cell">
              <strong>{{ row.username }}</strong>
              <span>ID {{ row.id }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" min-width="120" />
        <el-table-column prop="phone" label="手机号" min-width="140">
          <template #default="{ row }">{{ row.phone ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ statusLabel(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="departmentId" label="部门" min-width="120">
          <template #default="{ row }">{{ row.departmentId ?? '-' }}</template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" min-width="240" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="handleView(row.id)">详情</el-button>
              <el-button link type="warning" @click="handleToggleStatus(row)">
                {{ row.status === 'active' ? '停用' : '启用' }}
              </el-button>
              <el-button link type="danger" @click="handleResetPassword(row.id)">重置密码</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!state.loading && !state.error && !hasResults" description="当前没有可显示的用户数据。" />
      <el-alert v-if="state.error" :title="state.error" type="error" show-icon :closable="false" class="state" />

      <div class="footer">
        <span>当前共 {{ state.total }} 条记录</span>
        <span>第 {{ state.query.page }} / {{ totalPages }} 页</span>
      </div>

      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="state.query.page"
        :page-size="state.query.pageSize"
        :total="state.total"
        @current-change="handlePageChange"
      />
    </el-card>

    <UserDetailDialog
      :open="state.selectedUser !== null"
      :loading="state.detailLoading"
      :error="state.detailError"
      :user="state.selectedUser"
      @close="handleCloseDetail"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

import type { UserStatus } from '@/api'

import UserDetailDialog from './UserDetailDialog.vue'
import { useUsersModule } from './useUsersModule'
import { createDefaultUserQuery } from './userQueries'

const { state, hasResults, loadList, loadDetail, changeStatus, resetPassword, clearDetail } = useUsersModule()

const filters = reactive({
  username: '',
  departmentId: '',
  phone: '',
  status: '' as UserStatus | ''
})

const totalPages = computed(() => Math.max(1, Math.ceil(state.total / state.query.pageSize)))

onMounted(() => {
  void loadList()
})

function handleSearch(): void {
  void loadList({
    page: 1,
    username: filters.username,
    status: filters.status || undefined,
    departmentId: filters.departmentId,
    phone: filters.phone
  })
}

function handleReload(): void {
  void loadList()
}

function handleResetFilters(): void {
  filters.username = ''
  filters.departmentId = ''
  filters.phone = ''
  filters.status = ''
  void loadList(createDefaultUserQuery())
}

function handleView(id: string): void {
  clearDetail()
  void loadDetail(id)
}

async function handleToggleStatus(item: { id: string; status: 'active' | 'disabled'; version?: number }): Promise<void> {
  const nextStatus = item.status === 'active' ? 'disabled' : 'active'
  try {
    await ElMessageBox.confirm(`确认${nextStatus === 'active' ? '启用' : '停用'}该用户？`, '用户状态', {
      type: 'warning'
    })
    await changeStatus(item.id, nextStatus)
    ElMessage.success('状态已更新')
  } catch {
    return
  }
}

async function handleResetPassword(id: string): Promise<void> {
  try {
    const { value } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: 'ChangeMe123!'
    })
    if (!value) return
    await resetPassword(id, value)
    ElMessage.success('密码已重置')
  } catch {
    return
  }
}

function handlePageChange(page: number): void {
  void loadList({ page })
}

function handleCloseDetail(): void {
  clearDetail()
}

function statusLabel(value: string): string {
  return value === 'active' ? '启用' : '停用'
}
</script>

<style scoped>
.users-page {
  display: grid;
  gap: 22px;
}

.hero-card {
  border-radius: 20px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-brand-500);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.lead {
  margin-top: 10px;
  color: var(--color-text-weak);
  line-height: 1.7;
}

.filters {
  width: 100%;
}

.filter-actions {
  align-self: end;
}

.table {
  margin-top: 12px;
}

.user-cell {
  display: grid;
  gap: 4px;
}

.user-cell span,
.footer {
  color: var(--color-text-weak);
}

.footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 8px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
  margin-bottom: 12px;
}

@media (max-width: 960px) {
  .hero {
    display: grid;
  }
}
</style>
