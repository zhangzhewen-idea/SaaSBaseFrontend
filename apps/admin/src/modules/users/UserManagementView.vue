<template>
  <section class="users-page">
    <header class="hero card">
      <div>
        <p class="eyebrow">Users</p>
        <h2>用户管理</h2>
        <p class="lead">按真实后端数据查询、筛选、启停和重置密码，所有操作直接反馈给接口。</p>
      </div>
      <div class="header-actions">
        <button class="ghost" type="button" @click="handleResetFilters">重置</button>
        <button class="primary" type="button" @click="handleReload">刷新列表</button>
      </div>
    </header>

    <section class="filters card" aria-label="用户筛选">
      <label>
        <span>用户名</span>
        <input v-model="username" type="text" placeholder="按用户名搜索" />
      </label>
      <label>
        <span>部门 ID</span>
        <input v-model="departmentId" type="text" placeholder="例如 dept-root" />
      </label>
      <label>
        <span>手机号</span>
        <input v-model="phone" type="text" placeholder="按手机号搜索" />
      </label>
      <label>
        <span>状态</span>
        <select v-model="status">
          <option value="">全部</option>
          <option value="active">启用</option>
          <option value="disabled">停用</option>
        </select>
      </label>
      <div class="filter-actions">
        <button class="ghost" type="button" @click="handleResetFilters">清空</button>
        <button class="primary" type="button" @click="handleSearch">查询</button>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-head">
        <div>
          <strong>用户列表</strong>
          <p>当前共 {{ state.total }} 条记录</p>
        </div>
        <span class="page-tag">第 {{ state.query.page }} / {{ totalPages }} 页</span>
      </div>

      <p v-if="state.loading" class="state">正在加载用户列表...</p>
      <p v-else-if="state.error" class="state error">{{ state.error }}</p>
      <p v-else-if="!hasResults" class="state">当前没有可显示的用户数据。</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>用户名</th>
              <th>姓名</th>
              <th>手机号</th>
              <th>状态</th>
              <th>部门</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in state.items" :key="item.id">
              <td>
                <div class="user-cell">
                  <strong>{{ item.username }}</strong>
                  <span>ID {{ item.id }}</span>
                </div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.phone ?? '-' }}</td>
              <td>
                <span class="status-pill" :data-status="item.status">{{ statusLabel(item.status) }}</span>
              </td>
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
      </div>

      <footer class="pager">
        <button type="button" :disabled="state.query.page <= 1" @click="handlePrevPage">上一页</button>
        <button type="button" :disabled="state.query.page >= totalPages" @click="handleNextPage">下一页</button>
      </footer>
    </section>

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

import type { UserStatus } from '@/api'
import { useUsersModule } from './useUsersModule'
import UserDetailDialog from './UserDetailDialog.vue'
import { createDefaultUserQuery } from './userQueries'

const { state, hasResults, loadList, loadDetail, changeStatus, resetPassword, clearDetail } =
  useUsersModule()

const username = ref('')
const departmentId = ref('')
const phone = ref('')
const status = ref<UserStatus | ''>('')

const totalPages = computed(() => Math.max(1, Math.ceil(state.total / state.query.pageSize)))

onMounted(() => {
  void loadList()
})

function handleSearch(): void {
  void loadList({
    page: 1,
    username: username.value,
    status: status.value || undefined,
    departmentId: departmentId.value,
    phone: phone.value
  })
}

function handleReload(): void {
  void loadList()
}

function handleResetFilters(): void {
  username.value = ''
  departmentId.value = ''
  phone.value = ''
  status.value = ''
  void loadList(createDefaultUserQuery())
}

function handleView(id: string): void {
  clearDetail()
  void loadDetail(id)
}

function handleToggleStatus(item: { id: string; status: 'active' | 'disabled'; version?: number }): void {
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

function statusLabel(value: string): string {
  return value === 'active' ? '启用' : '停用'
}
</script>

<style scoped>
.users-page {
  display: grid;
  gap: 22px;
}

.card {
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.92), rgba(9, 16, 30, 0.9));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
  backdrop-filter: blur(18px);
}

.hero,
.filters,
.table-card {
  padding: 24px;
}

.hero {
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
  color: #7fb4ff;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.lead {
  margin: 10px 0 0;
  color: rgba(220, 231, 255, 0.74);
  line-height: 1.7;
}

.filters {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: end;
}

label {
  display: grid;
  gap: 10px;
  color: rgba(235, 242, 255, 0.88);
  font-size: 0.92rem;
}

.filter-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  align-self: end;
}

input,
select,
button {
  font: inherit;
}

input,
select {
  min-height: 46px;
  border: 1px solid rgba(159, 187, 255, 0.16);
  border-radius: 14px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.04);
  color: #f7fbff;
  outline: none;
}

input::placeholder {
  color: rgba(175, 193, 223, 0.62);
}

input:focus,
select:focus {
  border-color: rgba(109, 169, 255, 0.88);
  box-shadow: 0 0 0 4px rgba(63, 111, 224, 0.2);
}

select option {
  color: #132033;
}

button {
  min-height: 44px;
  border: 0;
  border-radius: 14px;
  cursor: pointer;
  padding: 0 14px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.primary {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: #f7fbff;
  box-shadow: 0 14px 28px rgba(47, 95, 208, 0.26);
}

.ghost {
  background: rgba(255, 255, 255, 0.04);
  color: #e8efff;
  border: 1px solid rgba(159, 187, 255, 0.16);
}

button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.table-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  color: rgba(220, 231, 255, 0.78);
}

.table-head strong {
  display: block;
  color: #f7fbff;
  font-size: 1.08rem;
}

.table-head p {
  margin: 6px 0 0;
}

.page-tag {
  align-self: flex-start;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(127, 180, 255, 0.12);
  color: #7fb4ff;
  font-weight: 700;
}

.state {
  margin: 0;
  color: rgba(220, 231, 255, 0.72);
}

.state.error {
  color: #ffb4b4;
}

.table-wrap {
  overflow-x: auto;
  border-radius: 18px;
  border: 1px solid rgba(159, 187, 255, 0.12);
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 980px;
}

thead {
  background: rgba(255, 255, 255, 0.03);
}

th,
td {
  padding: 14px 10px;
  border-bottom: 1px solid rgba(159, 187, 255, 0.1);
  text-align: left;
  color: rgba(235, 242, 255, 0.9);
}

th {
  color: rgba(175, 193, 223, 0.92);
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

tbody tr:hover {
  background: rgba(127, 180, 255, 0.05);
}

.user-cell {
  display: grid;
  gap: 4px;
}

.user-cell span {
  color: rgba(175, 193, 223, 0.76);
  font-size: 0.82rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(235, 242, 255, 0.92);
}

.status-pill[data-status='active'] {
  background: rgba(41, 200, 164, 0.14);
  color: #66e3c5;
}

.status-pill[data-status='disabled'] {
  background: rgba(255, 176, 176, 0.14);
  color: #ffb4b4;
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

.pager button {
  min-width: 96px;
}

@media (max-width: 1024px) {
  .filters {
    grid-template-columns: 1fr;
  }

  .hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .filter-actions {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
