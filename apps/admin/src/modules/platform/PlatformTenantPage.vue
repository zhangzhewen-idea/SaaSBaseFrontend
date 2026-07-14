<template>
  <section class="page">
    <header class="hero card">
      <div>
        <p class="eyebrow">Platform Tenants</p>
        <h2>平台租户管理</h2>
        <p class="lead">维护平台侧租户列表、详情和启停状态，所有写操作都保留 operatorId。</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost" @click="handleReload">刷新</button>
        <button type="button" class="primary" @click="handleCreate">新增租户</button>
      </div>
    </header>

    <section class="filters card">
      <label>
        <span>关键字</span>
        <input v-model="keyword" type="text" placeholder="租户编码 / 租户名称" />
      </label>
      <label>
        <span>状态</span>
        <select v-model="status">
          <option value="">全部</option>
          <option value="active">启用</option>
          <option value="disabled">停用</option>
        </select>
      </label>
      <label>
        <span>操作员 ID</span>
        <input v-model="operatorId" type="text" placeholder="platform-admin" />
      </label>
      <div class="filter-actions">
        <button type="button" class="ghost" @click="handleReset">重置</button>
        <button type="button" class="primary" @click="handleSearch">查询</button>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-head">
        <div>
          <strong>租户列表</strong>
          <p>共 {{ state.total }} 条</p>
        </div>
        <span>第 {{ state.query.pageNo }} / {{ totalPages }} 页</span>
      </div>

      <p v-if="state.loading" class="state">正在加载平台租户列表...</p>
      <p v-else-if="state.error" class="state error">{{ state.error }}</p>
      <p v-else-if="!hasResults" class="state">暂无平台租户数据。</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>租户编码</th>
              <th>租户名称</th>
              <th>管理员账号</th>
              <th>状态</th>
              <th>更新时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in state.items" :key="item.id">
              <td>{{ item.tenantCode }}</td>
              <td>{{ item.tenantName }}</td>
              <td>{{ item.adminUsername }}</td>
              <td>{{ item.status === 'active' ? '启用' : '停用' }}</td>
              <td>{{ item.updatedAt }}</td>
              <td class="row-actions">
                <button type="button" @click="handleView(item.id)">详情</button>
                <button type="button" @click="handleEdit(item.id)">编辑</button>
                <button type="button" @click="handleToggle(item)">
                  {{ item.status === 'active' ? '停用' : '启用' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="pager">
        <button type="button" :disabled="state.query.pageNo <= 1" @click="handlePrevPage">上一页</button>
        <button type="button" :disabled="state.query.pageNo >= totalPages" @click="handleNextPage">下一页</button>
      </footer>
    </section>

    <section class="card detail-card">
      <div class="table-head">
        <div>
          <strong>{{ editor.id ? '编辑租户' : '新增租户' }}</strong>
          <p>{{ state.selectedTenant?.tenantCode || '选择一条记录可回填详情' }}</p>
        </div>
        <span v-if="state.actionLoading">处理中...</span>
      </div>

      <p v-if="state.detailLoading" class="state">正在加载租户详情...</p>
      <p v-else-if="state.detailError" class="state error">{{ state.detailError }}</p>

      <form class="editor" @submit.prevent="handleSave">
        <label>
          <span>租户编码</span>
          <input v-model="editor.tenantCode" type="text" />
        </label>
        <label>
          <span>租户名称</span>
          <input v-model="editor.tenantName" type="text" />
        </label>
        <label>
          <span>管理员账号</span>
          <input v-model="editor.adminUsername" type="text" />
        </label>
        <label>
          <span>管理员显示名</span>
          <input v-model="editor.adminDisplayName" type="text" />
        </label>
        <label>
          <span>联系人</span>
          <input v-model="editor.contactName" type="text" />
        </label>
        <label>
          <span>联系电话</span>
          <input v-model="editor.contactPhone" type="text" />
        </label>
        <label>
          <span>联系邮箱</span>
          <input v-model="editor.contactEmail" type="email" />
        </label>
        <label class="full">
          <span>备注</span>
          <textarea v-model="editor.remark" rows="3" />
        </label>
        <div class="full editor-actions">
          <button type="button" class="ghost" @click="handleClearEditor">清空</button>
          <button type="submit" class="primary" :disabled="state.actionLoading">
            {{ editor.id ? '保存修改' : '创建租户' }}
          </button>
        </div>
      </form>

      <p v-if="state.actionError" class="state error">{{ state.actionError }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'

import type { PlatformTenantDetail, PlatformTenantSummary } from '@/api/platform'

import { usePlatformTenantsModule } from './usePlatformTenantsModule'
import { createDefaultPlatformTenantQuery } from './platformQueries'

const { state, hasResults, loadList, loadDetail, saveTenant, updateStatus, clearDetail, validateTenant } =
  usePlatformTenantsModule()

const keyword = ref('')
const status = ref<'active' | 'disabled' | ''>('')
const operatorId = ref('platform-admin')

const editor = reactive({
  id: '' as string,
  tenantCode: '',
  tenantName: '',
  adminUsername: '',
  adminDisplayName: '',
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  remark: ''
})

const totalPages = computed(() => Math.max(1, Math.ceil(state.total / state.query.pageSize)))

onMounted(() => {
  void loadList()
})

function handleSearch(): void {
  void loadList({
    pageNo: 1,
    keyword: keyword.value,
    status: status.value || undefined
  })
}

function handleReload(): void {
  void loadList()
}

function handleReset(): void {
  keyword.value = ''
  status.value = ''
  void loadList(createDefaultPlatformTenantQuery())
}

function handleView(id: string): void {
  void loadDetail(id).then(() => {
    if (!state.selectedTenant) return
    fillEditor(state.selectedTenant)
  })
}

function handleEdit(id: string): void {
  void loadDetail(id).then(() => {
    if (!state.selectedTenant) return
    fillEditor(state.selectedTenant)
  })
}

function handleToggle(item: PlatformTenantSummary): void {
  void updateStatus(item.id, item.status !== 'active', operatorId.value)
}

function handleCreate(): void {
  clearEditor()
}

async function handleSave(): Promise<void> {
  const payload = {
    tenantCode: editor.tenantCode.trim(),
    tenantName: editor.tenantName.trim(),
    adminUsername: editor.adminUsername.trim(),
    adminDisplayName: editor.adminDisplayName.trim() || undefined,
    contactName: editor.contactName.trim() || undefined,
    contactPhone: editor.contactPhone.trim() || undefined,
    contactEmail: editor.contactEmail.trim() || undefined,
    remark: editor.remark.trim() || undefined
  }
  const validationError = validateTenant(payload, operatorId.value)
  if (validationError) {
    state.actionError = validationError
    return
  }

  await saveTenant(
    editor.id || null,
    payload,
    operatorId.value.trim()
  )
}

function handleClearEditor(): void {
  clearEditor()
}

function handlePrevPage(): void {
  if (state.query.pageNo <= 1) return
  void loadList({ pageNo: state.query.pageNo - 1 })
}

function handleNextPage(): void {
  if (state.query.pageNo >= totalPages.value) return
  void loadList({ pageNo: state.query.pageNo + 1 })
}

function fillEditor(detail: PlatformTenantDetail): void {
  editor.id = detail.id
  editor.tenantCode = detail.tenantCode
  editor.tenantName = detail.tenantName
  editor.adminUsername = detail.adminUsername
  editor.adminDisplayName = detail.adminDisplayName ?? ''
  editor.contactName = detail.contactName ?? ''
  editor.contactPhone = detail.contactPhone ?? ''
  editor.contactEmail = detail.contactEmail ?? ''
  editor.remark = detail.remark ?? ''
}

function clearEditor(): void {
  editor.id = ''
  editor.tenantCode = ''
  editor.tenantName = ''
  editor.adminUsername = ''
  editor.adminDisplayName = ''
  editor.contactName = ''
  editor.contactPhone = ''
  editor.contactEmail = ''
  editor.remark = ''
  clearDetail()
}
</script>
