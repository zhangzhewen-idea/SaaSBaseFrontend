<template>
  <section class="users-page">
    <header class="page-header card">
      <div>
        <p class="eyebrow">Users</p>
        <h2>用户管理</h2>
        <p class="lead">支持按用户名、部门、状态和手机号筛选，详情通过弹窗查看。</p>
      </div>
      <div class="header-actions">
        <button class="secondary" type="button" @click="handleResetFilters">重置</button>
        <button class="primary" type="button" @click="handleReload">刷新列表</button>
      </div>
    </header>

    <div class="filters card">
      <label>
        用户名
        <input v-model="keyword" type="text" placeholder="用户名、姓名、手机号" />
      </label>
      <label>
        部门
        <input v-model="departmentId" type="text" placeholder="部门 ID" />
      </label>
      <label>
        状态
        <select v-model="status">
          <option value="">全部</option>
          <option value="active">启用</option>
          <option value="disabled">停用</option>
        </select>
      </label>
      <label>
        角色
        <select v-model="role">
          <option value="">全部</option>
          <option value="platform-admin">平台管理员</option>
          <option value="tenant-admin">租户管理员</option>
          <option value="tenant-member">租户成员</option>
        </select>
      </label>
      <button class="secondary" type="button" @click="handleSearch">查询</button>
    </div>

    <div class="card table-card">
      <div class="table-head">
        <strong>用户列表</strong>
        <span>{{ state.total }} 条记录</span>
      </div>

      <p v-if="state.loading" class="hint">正在加载用户列表...</p>
      <p v-else-if="state.error" class="error">{{ state.error }}</p>
      <p v-else-if="!hasResults" class="hint">当前没有可显示的用户数据。</p>

      <table v-else>
        <thead>
          <tr>
            <th>姓名</th>
            <th>账号</th>
            <th>角色</th>
            <th>状态</th>
            <th>部门</th>
            <th>更新时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in state.items" :key="item.id">
            <td>{{ item.name }}</td>
            <td>{{ item.username }}</td>
            <td>{{ roleLabel(item.role) }}</td>
            <td>{{ statusLabel(item.status) }}</td>
            <td>{{ item.departmentId ?? '-' }}</td>
            <td>{{ item.updatedAt }}</td>
            <td class="actions">
              <button type="button" @click="handleView(item.id)">详情</button>
              <button type="button" @click="handleToggleStatus(item)">
                {{ item.status === 'active' ? '停用' : '启用' }}
              </button>
              <button type="button" @click="handleResetPassword(item.id)">重置密码</button>
            </td>
          </tr>
        </tbody>
      </table>

      <footer class="pager">
        <button type="button" :disabled="state.query.page <= 1" @click="handlePrevPage">上一页</button>
        <span>第 {{ state.query.page }} / {{ totalPages }} 页</span>
        <button type="button" :disabled="state.query.page >= totalPages" @click="handleNextPage">下一页</button>
      </footer>
    </div>

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
import { computed, onMounted, ref } from 'vue'

import type { UserRole, UserStatus } from '@/api'
import { useUsersModule } from './useUsersModule'
import UserDetailDialog from './UserDetailDialog.vue'
import { createDefaultUserQuery } from './userQueries'

const { state, hasResults, loadList, loadDetail, changeStatus, resetPassword, clearDetail } =
  useUsersModule()

const keyword = ref('')
const departmentId = ref('')
const status = ref<UserStatus | ''>('')
const role = ref<UserRole | ''>('')

const totalPages = computed(() => Math.max(1, Math.ceil(state.total / state.query.pageSize)))

onMounted(() => {
  void loadList()
})

function handleSearch(): void {
  void loadList({
    page: 1,
    keyword: keyword.value,
    status: status.value || undefined,
    role: role.value || undefined,
    departmentId: departmentId.value
  })
}

function handleReload(): void {
  void loadList()
}

function handleResetFilters(): void {
  keyword.value = ''
  departmentId.value = ''
  status.value = ''
  role.value = ''
  void loadList(createDefaultUserQuery())
}

function handleView(id: string): void {
  clearDetail()
  void loadDetail(id)
}

function handleToggleStatus(item: { id: string; status: 'active' | 'disabled' }): void {
  const nextStatus = item.status === 'active' ? 'disabled' : 'active'
  void changeStatus(item.id, nextStatus)
}

function handleResetPassword(id: string): void {
  const password = window.prompt('请输入新密码', 'ChangeMe123!')
  if (!password) return
  void resetPassword(id, password)
}

function handlePrevPage(): void {
  if (state.query.page <= 1) return
  void loadList({ page: state.query.page - 1 })
}

function handleNextPage(): void {
  if (state.query.page >= totalPages.value) return
  void loadList({ page: state.query.page + 1 })
}

function handleCloseDetail(): void {
  clearDetail()
}

function roleLabel(value: string): string {
  switch (value) {
    case 'platform-admin':
      return '平台管理员'
    case 'tenant-admin':
      return '租户管理员'
    default:
      return '租户成员'
  }
}

function statusLabel(value: string): string {
  return value === 'active' ? '启用' : '停用'
}
</script>

<style scoped>
.users-page {
  display: grid;
  gap: 20px;
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(19, 32, 51, 0.06);
}

.page-header,
.filters,
.table-card {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.eyebrow {
  margin: 0 0 8px;
  color: var(--color-brand-500);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.lead,
.hint,
.error {
  margin: 8px 0 0;
  color: var(--color-text-weak);
}

.error {
  color: #b42318;
}

.filters {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
}

label {
  display: grid;
  gap: 8px;
  font-size: 0.92rem;
}

input,
select,
button {
  font: inherit;
}

input,
select {
  min-height: 42px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0 12px;
  background: white;
}

button {
  min-height: 42px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  padding: 0 14px;
}

.primary {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: white;
}

.secondary {
  background: #eef3fb;
  color: var(--color-brand-700);
}

.table-head {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--color-text-weak);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 10px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pager {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
