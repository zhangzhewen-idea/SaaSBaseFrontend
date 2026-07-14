<template>
  <section class="files-page">
    <el-card shadow="never" class="hero-card">
      <template #header>
        <div class="hero">
          <div>
            <p class="eyebrow">文件管理</p>
            <h2>文件管理</h2>
            <p class="lead">支持上传、列表筛选、详情查看、预览和删除，内容接口仅通过统一入口访问。</p>
          </div>
          <div class="actions">
            <el-button @click="handleReload">刷新</el-button>
            <el-button type="primary" @click="handlePickUpload">上传文件</el-button>
            <input ref="fileInput" class="hidden-input" type="file" @change="handlePickFile" />
          </div>
        </div>
      </template>

      <el-form :model="filters" inline label-position="top" class="filters">
        <el-form-item label="文件名">
          <el-input v-model="filters.filename" placeholder="按文件名搜索" clearable />
        </el-form-item>
        <el-form-item label="内容类型">
          <el-input v-model="filters.contentType" placeholder="image/png" clearable />
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker v-model="filters.uploadedFrom" type="date" value-format="YYYY-MM-DD" placeholder="开始时间" />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker v-model="filters.uploadedTo" type="date" value-format="YYYY-MM-DD" placeholder="结束时间" />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="primary" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="state.items" border stripe v-loading="state.loading" class="table">
        <el-table-column prop="filename" label="文件名" min-width="180" />
        <el-table-column prop="contentType" label="类型" min-width="160" />
        <el-table-column label="大小" min-width="120">
          <template #default="{ row }">{{ formatSize(row.size) }}</template>
        </el-table-column>
        <el-table-column prop="uploadedAt" label="上传时间" min-width="180" />
        <el-table-column label="操作" min-width="220" fixed="right">
          <template #default="{ row }">
            <el-space wrap>
              <el-button link type="primary" @click="handleView(row.id)">详情</el-button>
              <el-button link type="success" @click="handlePreview(row)">预览</el-button>
              <el-button link type="danger" @click="handleDelete(row.id)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="!state.loading && !state.error && !hasResults" description="暂无文件数据。" />
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
          <strong>文件详情</strong>
          <span>{{ state.detail?.filename || '选择一条文件查看详情' }}</span>
        </div>
      </template>

      <el-skeleton v-if="state.detailLoading" animated :rows="4" />
      <el-alert v-else-if="state.detailError" :title="state.detailError" type="error" show-icon :closable="false" />
      <el-descriptions v-else-if="state.detail" :column="2" border>
        <el-descriptions-item label="文件名">{{ state.detail.filename }}</el-descriptions-item>
        <el-descriptions-item label="内容类型">{{ state.detail.contentType }}</el-descriptions-item>
        <el-descriptions-item label="大小">{{ formatSize(state.detail.size) }}</el-descriptions-item>
        <el-descriptions-item label="上传时间">{{ state.detail.uploadedAt }}</el-descriptions-item>
        <el-descriptions-item label="上传来源">{{ state.detail.uploadedFrom || '-' }}</el-descriptions-item>
        <el-descriptions-item label="上传人">{{ state.detail.uploadedBy || '-' }}</el-descriptions-item>
      </el-descriptions>
      <el-empty v-else description="暂无文件详情。" />

      <el-alert v-if="state.actionError" :title="state.actionError" type="error" show-icon :closable="false" class="state" />
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'

import type { FileView } from '@/api'
import { createFilesApi, resolveFileDisposition } from '@/api'
import { createAdminApiRuntime } from '@/api/runtime'

import { useFilesModule } from './useFilesModule'
import { createDefaultFileQuery } from './fileQueries'

const { state, hasResults, loadList, loadDetail, upload, remove, clearDetail } = useFilesModule()
const filesApi = createFilesApi(createAdminApiRuntime())

const filters = reactive({
  filename: '',
  contentType: '',
  uploadedFrom: '',
  uploadedTo: ''
})
const fileInput = ref<HTMLInputElement | null>(null)

const totalPages = computed(() => Math.max(1, Math.ceil(state.total / state.query.pageSize)))

onMounted(() => {
  void loadList()
})

function handleSearch(): void {
  void loadList({
    pageNo: 1,
    filename: filters.filename,
    contentType: filters.contentType,
    uploadedFrom: filters.uploadedFrom,
    uploadedTo: filters.uploadedTo
  })
}

function handleReload(): void {
  void loadList()
}

function handleReset(): void {
  filters.filename = ''
  filters.contentType = ''
  filters.uploadedFrom = ''
  filters.uploadedTo = ''
  clearDetail()
  void loadList(createDefaultFileQuery())
}

function handleView(id: string): void {
  void loadDetail(id)
}

function handlePreview(item: FileView): void {
  const disposition = resolveFileDisposition(item.contentType)
  window.open(filesApi.contentUrl(item.id, disposition), '_blank', 'noopener,noreferrer')
}

function handleDelete(id: string): void {
  void ElMessageBox.confirm('确认删除该文件？', '删除文件', { type: 'warning' }).then(() => remove(id))
}

function handlePageChange(pageNo: number): void {
  void loadList({ pageNo })
}

function handlePickUpload(): void {
  fileInput.value?.click()
}

async function handlePickFile(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement | null
  const file = target?.files?.[0]
  if (!file) return
  await upload(file)
  if (target) {
    target.value = ''
  }
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>

<style scoped>
.files-page {
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

.hidden-input {
  display: none;
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
}
</style>
