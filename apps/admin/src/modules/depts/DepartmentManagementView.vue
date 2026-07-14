<template>
  <section class="depts-page">
    <header class="page-header card">
      <div>
        <p class="eyebrow">Departments</p>
        <h2>部门管理</h2>
        <p class="lead">支持部门树、成员列表与最小成员动作，保持和管理端统一的克制风格。</p>
      </div>
      <div class="header-actions">
        <button class="secondary" type="button" @click="handleReload">刷新</button>
        <button class="primary" type="button" @click="handleCreateDepartment">新增部门</button>
      </div>
    </header>

    <div class="grid">
      <section class="card panel">
        <div class="panel-head">
          <strong>部门树</strong>
          <span>{{ state.tree.length }} 个根节点</span>
        </div>

        <p v-if="state.treeLoading" class="hint">正在加载部门树...</p>
        <p v-else-if="state.error" class="error">{{ state.error }}</p>
        <ul v-else class="tree">
          <li v-for="row in treeRows" :key="row.id" class="tree-item" :style="{ paddingLeft: `${row.level * 16}px` }">
            <button
              type="button"
              class="tree-button"
              :class="{ active: row.id === state.selectedDepartmentId }"
              @click="handleSelectDepartment(row)"
            >
              <span>{{ row.name }}</span>
              <span>{{ row.memberCount }}</span>
            </button>
          </li>
        </ul>
      </section>

      <section class="card panel">
        <div class="panel-head">
          <div>
            <strong>成员列表</strong>
            <p class="subtle">{{ state.selectedDepartmentName || '请选择一个部门' }}</p>
          </div>
          <span>{{ state.total }} 条记录</span>
        </div>

        <p v-if="state.memberLoading" class="hint">正在加载成员列表...</p>
        <p v-else-if="state.error" class="error">{{ state.error }}</p>
        <table v-else-if="state.members.length > 0">
          <thead>
            <tr>
              <th>姓名</th>
              <th>角色</th>
              <th>状态</th>
              <th>加入时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in state.members" :key="member.id">
              <td>{{ member.userName }}</td>
              <td>{{ member.roleName }}</td>
              <td>
                <span class="status" :data-status="member.status">
                  {{ member.status === 'disabled' ? '停用' : '启用' }}
                </span>
              </td>
              <td>{{ member.joinedAt }}</td>
              <td>
                <button type="button" class="ghost" @click="handleRemove(member)">移除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="hint">选择一个部门以查看成员。</p>

        <div class="member-actions">
          <label>
            添加成员 ID
            <textarea v-model="memberUserIdsText" rows="3" placeholder="user-1,user-2"></textarea>
          </label>
          <button class="primary" type="button" :disabled="state.actionLoading" @click="handleAddMembers">
            添加成员
          </button>
        </div>
      </section>

      <section class="card panel ops-panel">
        <div class="panel-head">
          <strong>组织操作</strong>
          <span>{{ state.actionLoading ? '正在处理...' : '基础组织维护' }}</span>
        </div>

        <p v-if="state.actionError" class="error">{{ state.actionError }}</p>

        <div class="ops-grid">
          <form class="op-card" @submit.prevent="handleCreateDepartment">
            <h3>新增部门</h3>
            <label>
              名称
              <input v-model="createForm.name" type="text" placeholder="新部门名称" />
            </label>
            <label>
              上级部门 ID
              <input v-model="createForm.parentId" type="text" placeholder="留空表示根节点" />
            </label>
            <label>
              编码
              <input v-model="createForm.code" type="text" placeholder="可选" />
            </label>
            <label>
              排序号
              <input v-model="createForm.orderNo" type="number" min="0" />
            </label>
            <button class="primary" type="submit" :disabled="state.actionLoading">创建</button>
          </form>

          <form class="op-card" @submit.prevent="handleUpdateDepartment">
            <h3>编辑当前部门</h3>
            <p class="hint">当前选中：{{ state.selectedDepartmentName || '未选择' }}</p>
            <label>
              名称
              <input v-model="updateForm.name" type="text" placeholder="部门名称" />
            </label>
            <label>
              编码
              <input v-model="updateForm.code" type="text" placeholder="部门编码" />
            </label>
            <label>
              排序号
              <input v-model="updateForm.orderNo" type="number" min="0" />
            </label>
            <button class="primary" type="submit" :disabled="state.actionLoading || !state.selectedDepartmentId">
              保存
            </button>
          </form>

          <form class="op-card" @submit.prevent="handleMoveDepartment">
            <h3>移动当前部门</h3>
            <label>
              新上级部门 ID
              <input v-model="moveForm.parentId" type="text" placeholder="留空表示根节点" />
            </label>
            <label>
              排序号
              <input v-model="moveForm.orderNo" type="number" min="0" />
            </label>
            <button class="primary" type="submit" :disabled="state.actionLoading || !state.selectedDepartmentId">
              移动
            </button>
          </form>
        </div>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import type { DepartmentNode } from '@/api'

import { useDepartmentsModule } from './useDepartmentsModule'

const { state, selectedDepartment, loadTree, loadMembers, createDepartment, updateDepartment, moveDepartment, addMembers, removeMember, selectDepartment } =
  useDepartmentsModule()

const treeRows = computed(() => flattenDepartmentTree(state.tree))
const createForm = reactive({
  name: '',
  parentId: '',
  code: '',
  orderNo: 0
})
const updateForm = reactive({
  name: '',
  code: '',
  orderNo: 0
})
const moveForm = reactive({
  parentId: '',
  orderNo: 0
})
const memberUserIdsText = ref('')

onMounted(() => {
  void loadTree()
})

watch(
  selectedDepartment,
  node => {
    if (!node) return

    updateForm.name = node.name
    updateForm.code = node.code
    updateForm.orderNo = node.orderNo
    moveForm.parentId = node.parentId ?? ''
    moveForm.orderNo = node.orderNo
  },
  { immediate: true }
)

function handleReload(): void {
  void loadTree()
}

function handleSelectDepartment(node: DepartmentNode): void {
  selectDepartment(node)
  void loadMembers(node.id)
}

function handleRemove(member: { departmentId: string; id: string }): void {
  void removeMember(member.departmentId, member.id)
}

function handleCreateDepartment(): void {
  if (!createForm.name.trim()) return

  void createDepartment({
    name: createForm.name.trim(),
    parentId: createForm.parentId.trim() || null,
    code: createForm.code.trim() || undefined,
    orderNo: createForm.orderNo
  })
}

function handleUpdateDepartment(): void {
  if (!state.selectedDepartmentId || !updateForm.name.trim()) return

  void updateDepartment(state.selectedDepartmentId, {
    name: updateForm.name.trim(),
    parentId: state.selectedDepartmentParentId,
    code: updateForm.code.trim() || undefined,
    orderNo: updateForm.orderNo
  })
}

function handleMoveDepartment(): void {
  if (!state.selectedDepartmentId) return

  void moveDepartment(state.selectedDepartmentId, {
    parentId: moveForm.parentId.trim() || null,
    orderNo: moveForm.orderNo
  })
}

function handleAddMembers(): void {
  if (!state.selectedDepartmentId) return

  const userIds = memberUserIdsText.value
    .split(/[\s,]+/)
    .map(value => value.trim())
    .filter(Boolean)

  if (userIds.length === 0) return

  void addMembers(state.selectedDepartmentId, userIds)
  memberUserIdsText.value = ''
}

function flattenDepartmentTree(nodes: DepartmentNode[], level = 0): Array<DepartmentNode & { level: number }> {
  return nodes.flatMap(node => [
    { ...node, level },
    ...flattenDepartmentTree(node.children ?? [], level + 1)
  ])
}
</script>

<style scoped>
.depts-page {
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
.panel {
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

.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.1fr);
}

.ops-panel {
  grid-column: 1 / -1;
}

.panel {
  display: grid;
  gap: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: var(--color-text-weak);
}

.subtle {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 0.92rem;
}

.tree {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tree-item {
  display: block;
}

.tree-button,
button {
  min-height: 40px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  padding: 0 14px;
  font: inherit;
}

.tree-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f6f8fc;
  color: var(--color-text);
}

.primary {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: white;
}

.tree-button.active {
  background: rgba(58, 92, 255, 0.12);
  color: var(--color-brand-700);
  font-weight: 600;
}

.ghost {
  background: #f6f8fc;
  color: var(--color-text);
}

.member-actions {
  display: grid;
  gap: 12px;
}

.ops-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.op-card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 16px;
  background: #f8fafc;
}

.op-card h3 {
  margin: 0;
  font-size: 1rem;
}

textarea {
  resize: vertical;
  min-height: 88px;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font: inherit;
}

.status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: #eef4ff;
  color: #2450d4;
  font-size: 0.85rem;
}

.status[data-status='disabled'] {
  background: #f2f4f7;
  color: #667085;
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

@media (max-width: 1024px) {
  .grid,
  .ops-grid,
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-header {
    display: grid;
  }
}
</style>
