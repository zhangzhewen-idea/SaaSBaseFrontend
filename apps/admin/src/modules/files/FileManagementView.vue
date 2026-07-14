<template>
  <section class="files-page">
    <header class="hero card">
      <div>
        <p class="eyebrow">Files</p>
        <h2>文件管理</h2>
        <p class="lead">支持上传、列表筛选、详情查看、预览和删除，内容接口仅通过统一入口访问。</p>
      </div>
      <div class="actions">
        <button type="button" class="ghost" @click="handleReload">刷新</button>
        <label class="upload">
          <input type="file" @change="handlePickFile" />
          <span>上传文件</span>
        </label>
      </div>
    </header>

    <section class="filters card">
      <label>
        <span>文件名</span>
        <input v-model="filename" type="text" placeholder="按文件名搜索" />
      </label>
      <label>
        <span>内容类型</span>
        <input v-model="contentType" type="text" placeholder="image/png" />
      </label>
      <label>
        <span>开始时间</span>
        <input v-model="uploadedFrom" type="date" />
      </label>
      <label>
        <span>结束时间</span>
        <input v-model="uploadedTo" type="date" />
      </label>
      <div class="filter-actions">
        <button type="button" class="ghost" @click="handleReset">重置</button>
        <button type="button" class="primary" @click="handleSearch">查询</button>
      </div>
    </section>

    <section class="card table-card">
      <div class="table-head">
        <div>
          <strong>文件列表</strong>
          <p>共 {{ state.total }} 条</p>
        </div>
        <span>第 {{ state.query.pageNo }} / {{ totalPages }} 页</span>
      </div>

      <p v-if="state.loading" class="state">正在加载文件列表...</p>
      <p v-else-if="state.error" class="state error">{{ state.error }}</p>
      <p v-else-if="!hasResults" class="state">暂无文件数据。</p>

      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>文件名</th>
              <th>类型</th>
              <th>大小</th>
              <th>上传时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in state.items" :key="item.id">
              <td>{{ item.filename }}</td>
              <td>{{ item.contentType }}</td>
              <td>{{ formatSize(item.size) }}</td>
              <td>{{ item.uploadedAt }}</td>
              <td class="row-actions">
                <button type="button" @click="handleView(item.id)">详情</button>
                <button type="button" @click="handlePreview(item)">预览</button>
                <button type="button" @click="handleDelete(item.id)">删除</button>
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
          <strong>文件详情</strong>
          <p>{{ state.detail?.filename || '选择一条文件查看详情' }}</p>
        </div>
      </div>

      <p v-if="state.detailLoading" class="state">正在加载文件详情...</p>
      <p v-else-if="state.detailError" class="state error">{{ state.detailError }}</p>
      <div v-else-if="state.detail" class="detail-grid">
        <div><span>文件名</span><strong>{{ state.detail.filename }}</strong></div>
        <div><span>内容类型</span><strong>{{ state.detail.contentType }}</strong></div>
        <div><span>大小</span><strong>{{ formatSize(state.detail.size) }}</strong></div>
        <div><span>上传时间</span><strong>{{ state.detail.uploadedAt }}</strong></div>
        <div><span>上传来源</span><strong>{{ state.detail.uploadedFrom || '-' }}</strong></div>
        <div><span>上传人</span><strong>{{ state.detail.uploadedBy || '-' }}</strong></div>
      </div>

      <p v-if="state.actionError" class="state error">{{ state.actionError }}</p>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import type { FileView } from '@/api'

import { useFilesModule } from './useFilesModule'
import { createDefaultFileQuery } from './fileQueries'

const { state, hasResults, loadList, loadDetail, upload, remove, clearDetail } = useFilesModule()

const filename = ref('')
const contentType = ref('')
const uploadedFrom = ref('')
const uploadedTo = ref('')

const totalPages = computed(() => Math.max(1, Math.ceil(state.total / state.query.pageSize)))

onMounted(() => {
  void loadList()
})

function handleSearch(): void {
  void loadList({
    pageNo: 1,
    filename: filename.value,
    contentType: contentType.value,
    uploadedFrom: uploadedFrom.value,
    uploadedTo: uploadedTo.value
  })
}

function handleReload(): void {
  void loadList()
}

function handleReset(): void {
  filename.value = ''
  contentType.value = ''
  uploadedFrom.value = ''
  uploadedTo.value = ''
  clearDetail()
  void loadList(createDefaultFileQuery())
}

function handleView(id: string): void {
  void loadDetail(id)
}

function handlePreview(item: FileView): void {
  const disposition = shouldInlinePreview(item.contentType) ? 'inline' : 'attachment'
  window.open(`/api/v1/admin/files/${item.id}/content?disposition=${disposition}`, '_blank', 'noopener,noreferrer')
}

function handleDelete(id: string): void {
  if (!window.confirm('确认删除该文件？')) return
  void remove(id)
}

function handlePrevPage(): void {
  if (state.query.pageNo <= 1) return
  void loadList({ pageNo: state.query.pageNo - 1 })
}

function handleNextPage(): void {
  if (state.query.pageNo >= totalPages.value) return
  void loadList({ pageNo: state.query.pageNo + 1 })
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

function shouldInlinePreview(contentTypeValue: string): boolean {
  return ['application/pdf', 'image/png', 'image/jpeg'].includes(contentTypeValue)
}

function formatSize(size: number): string {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}
</script>
