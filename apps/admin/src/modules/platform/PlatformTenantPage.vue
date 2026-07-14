<template>
  <section class="page">
    <el-card shadow="never" class="hero-card">
      <template #header>
        <div class="hero">
          <div>
            <p class="eyebrow">Platform Tenants</p>
            <h2>平台租户管理</h2>
            <p class="lead">维护平台侧租户列表、详情和启停状态，所有写操作都保留 operatorId。</p>
          </div>
          <div class="actions">
            <el-button @click="handleReload">刷新</el-button>
            <el-button type="primary" @click="handleCreate">新增租户</el-button>
          </div>
        </div>
      </template>

      <el-form :model="filters" inline label-position="top" class="filters">
        <el-form-item label="关键字">
          <el-input v-model="filters.keyword" placeholder="租户编码 / 租户名称" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="全部" clearable>
            <el-option label="启用" value="active" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作员 ID">
          <el-input v-model="operatorId" placeholder="platform-admin" />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="state.items" border stripe v-loading="state.loading" class="table">
        <el-table-column prop="tenantCode" label="租户编码" min-width="180" />
        <el-table-column prop="tenantName" label="租户名称" min-width="180" />
        <el-table-column prop="adminUsername" label="管理员账号" min-width="160" />
        <el-table-column label="状态" min-width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'info'">
              {{ row.status === 'active' ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="handleView(row.id)">详情</el-button>
              <el-button link type="warning" @click="handleEdit(row.id)">编辑</el-button>
              <el-button link type="danger" @click="handleToggle(row)">
                {{ row.status === 'active' ? '停用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!state.loading && !state.error && !hasResults" description="暂无平台租户数据。" />
      <el-alert v-if="state.error" :title="state.error" type="error" show-icon :closable="false" class="state" />

      <div class="footer">
        <span>共 {{ state.total }} 条</span>
        <span>第 {{ state.query.pageNo }} / {{ totalPages }} 页</span>
      </div>
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="state.query.pageNo"
        :page-size="state.query.pageSize"
        :total="state.total"
        @current-change="handlePageChange"
      />
    </el-card>

    <el-card shadow="never" class="detail-card">
      <template #header>
        <div class="detail-head">
          <strong>{{ editor.id ? '编辑租户' : '新增租户' }}</strong>
          <span>{{ state.selectedTenant?.tenantCode || '选择一条记录可回填详情' }}</span>
        </div>
      </template>

      <el-skeleton v-if="state.detailLoading" animated :rows="4" />
      <el-alert v-else-if="state.detailError" :title="state.detailError" type="error" show-icon :closable="false" />

      <el-form :model="editor" label-position="top" class="editor" @submit.prevent>
        <el-form-item label="租户编码">
          <el-input v-model="editor.tenantCode" />
        </el-form-item>
        <el-form-item label="租户名称">
          <el-input v-model="editor.tenantName" />
        </el-form-item>
        <el-form-item label="管理员账号">
          <el-input v-model="editor.adminUsername" />
        </el-form-item>
        <el-form-item label="管理员显示名">
          <el-input v-model="editor.adminDisplayName" />
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="editor.contactName" />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="editor.contactPhone" />
        </el-form-item>
        <el-form-item label="联系邮箱">
          <el-input v-model="editor.contactEmail" />
        </el-form-item>
        <el-form-item label="备注" class="full">
          <el-input v-model="editor.remark" type="textarea" :rows="3" />
        </el-form-item>
        <div class="full editor-actions">
          <el-button @click="handleClearEditor">清空</el-button>
          <el-button type="primary" :disabled="state.actionLoading" @click="handleSave">
            {{ editor.id ? '保存修改' : '创建租户' }}
          </el-button>
        </div>
      </el-form>

      <el-alert v-if="state.actionError" :title="state.actionError" type="error" show-icon :closable="false" class="state" />
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'

import type { PlatformTenantDetail, PlatformTenantSummary } from '@/api/platform'

import { usePlatformTenantsModule } from './usePlatformTenantsModule'
import { createDefaultPlatformTenantQuery } from './platformQueries'

const { state, hasResults, loadList, loadDetail, saveTenant, updateStatus, clearDetail, validateTenant } =
  usePlatformTenantsModule()

const filters = reactive({
  keyword: '',
  status: '' as 'active' | 'disabled' | ''
})
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
    keyword: filters.keyword,
    status: filters.status || undefined
  })
}

function handleReload(): void {
  void loadList()
}

function handleReset(): void {
  filters.keyword = ''
  filters.status = ''
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
    .then(() => ElMessage.success('状态已更新'))
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

  await saveTenant(editor.id || null, payload, operatorId.value.trim())
  ElMessage.success('租户已保存')
}

function handleClearEditor(): void {
  clearEditor()
}

function handlePageChange(pageNo: number): void {
  void loadList({ pageNo })
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

<style scoped>
.page {
  display: grid;
  gap: 22px;
}

.hero-card,
.detail-card {
  border-radius: 20px;
}

.hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: center;
}

.actions {
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

.lead {
  margin-top: 10px;
  color: var(--color-text-weak);
  line-height: 1.7;
}

.filters {
  width: 100%;
}

.table {
  margin-top: 12px;
}

.footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 16px 0 8px;
  color: var(--color-text-weak);
}

.detail-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.editor {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.full {
  grid-column: 1 / -1;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 16px;
  margin-bottom: 12px;
}

@media (max-width: 960px) {
  .hero,
  .actions,
  .detail-head {
    display: grid;
  }

  .editor {
    grid-template-columns: 1fr;
  }
}
</style>
