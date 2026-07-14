<template>
  <section class="depts-page">
    <header class="hero card">
      <div>
        <p class="eyebrow">Departments</p>
        <h2>部门管理</h2>
        <p class="lead">支持部门树、成员列表与最小成员动作，所有交互都直接走真实后端。</p>
      </div>
      <div class="header-actions">
        <button class="ghost" type="button" @click="handleReload">刷新</button>
        <button class="primary" type="button" @click="handleCreateDepartment">新增部门</button>
      </div>
    </header>

    <div class="grid">
      <section class="card panel">
        <div class="panel-head">
          <div>
            <strong>部门树</strong>
            <p class="subtle">{{ state.tree.length }} 个根节点</p>
          </div>
          <span class="page-tag">当前层级</span>
        </div>

        <p v-if="state.treeLoading" class="state">正在加载部门树...</p>
        <p v-else-if="state.error" class="state error">{{ state.error }}</p>
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
          <span class="page-tag">{{ state.total }} 条记录</span>
        </div>

        <p v-if="state.memberLoading" class="state">正在加载成员列表...</p>
        <p v-else-if="state.error" class="state error">{{ state.error }}</p>
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
        <p v-else class="state">选择一个部门以查看成员。</p>

        <div class="member-actions">
          <label>
            <span>添加成员 ID</span>
            <textarea v-model="memberUserIdsText" rows="3" placeholder="user-1,user-2"></textarea>
          </label>
          <button class="primary" type="button" :disabled="state.actionLoading" @click="handleAddMembers">
            添加成员
          </button>
        </div>
      </section>

      <section class="card panel ops-panel">
        <div class="panel-head">
          <div>
            <strong>组织操作</strong>
            <p class="subtle">基础组织维护</p>
          </div>
          <span class="page-tag">{{ state.actionLoading ? '正在处理...' : '可编辑' }}</span>
        </div>

        <p v-if="state.actionError" class="state error">{{ state.actionError }}</p>

        <div class="ops-grid">
          <form class="op-card" @submit.prevent="handleCreateDepartment">
            <h3>新增部门</h3>
            <label>
              <span>名称</span>
              <input v-model="createForm.name" type="text" placeholder="新部门名称" />
            </label>
            <label>
              <span>上级部门 ID</span>
              <input v-model="createForm.parentId" type="text" placeholder="留空表示根节点" />
            </label>
            <label>
              <span>编码</span>
              <input v-model="createForm.code" type="text" placeholder="可选" />
            </label>
            <label>
              <span>排序号</span>
              <input v-model="createForm.orderNo" type="number" min="0" />
            </label>
            <button class="primary" type="submit" :disabled="state.actionLoading">创建</button>
          </form>

          <form class="op-card" @submit.prevent="handleUpdateDepartment">
            <h3>编辑当前部门</h3>
            <p class="state">当前选中：{{ state.selectedDepartmentName || '未选择' }}</p>
            <label>
              <span>名称</span>
              <input v-model="updateForm.name" type="text" placeholder="部门名称" />
            </label>
            <label>
              <span>编码</span>
              <input v-model="updateForm.code" type="text" placeholder="部门编码" />
            </label>
            <label>
              <span>排序号</span>
              <input v-model="updateForm.orderNo" type="number" min="0" />
            </label>
            <button class="primary" type="submit" :disabled="state.actionLoading || !state.selectedDepartmentId">
              保存
            </button>
          </form>

          <form class="op-card" @submit.prevent="handleMoveDepartment">
            <h3>移动当前部门</h3>
            <label>
              <span>新上级部门 ID</span>
              <input v-model="moveForm.parentId" type="text" placeholder="留空表示根节点" />
            </label>
            <label>
              <span>排序号</span>
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
  gap: 22px;
}

.card {
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.94), rgba(9, 16, 30, 0.92));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
  backdrop-filter: blur(18px);
}

.hero,
.panel {
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
  align-items: flex-start;
}

.panel-head strong {
  color: #f7fbff;
  font-size: 1.05rem;
}

.subtle {
  margin: 4px 0 0;
  color: rgba(175, 193, 223, 0.78);
  font-size: 0.92rem;
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
  background: rgba(255, 255, 255, 0.04);
  color: rgba(235, 242, 255, 0.9);
  border: 1px solid rgba(159, 187, 255, 0.12);
}

.primary {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: #f7fbff;
  box-shadow: 0 14px 28px rgba(47, 95, 208, 0.24);
}

.ghost {
  background: rgba(255, 255, 255, 0.04);
  color: #e8efff;
  border: 1px solid rgba(159, 187, 255, 0.16);
}

.tree-button.active {
  background: rgba(63, 111, 224, 0.14);
  color: #f7fbff;
  font-weight: 600;
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
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(159, 187, 255, 0.1);
}

.op-card h3 {
  margin: 0;
  font-size: 1rem;
  color: #f7fbff;
}

.op-card label {
  display: grid;
  gap: 8px;
  color: rgba(235, 242, 255, 0.88);
}

input,
textarea {
  color: #f7fbff;
  background: rgba(255, 255, 255, 0.04);
}

input::placeholder,
textarea::placeholder {
  color: rgba(175, 193, 223, 0.62);
}

input:focus,
textarea:focus {
  border-color: rgba(109, 169, 255, 0.88);
  box-shadow: 0 0 0 4px rgba(63, 111, 224, 0.2);
}

textarea {
  resize: vertical;
  min-height: 88px;
  padding: 12px 14px;
  border: 1px solid rgba(159, 187, 255, 0.16);
  border-radius: 12px;
  font: inherit;
}

.status {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(63, 111, 224, 0.14);
  color: #7fb4ff;
  font-size: 0.85rem;
}

.status[data-status='disabled'] {
  background: rgba(255, 176, 176, 0.12);
  color: #ffb4b4;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 10px;
  border-bottom: 1px solid rgba(159, 187, 255, 0.1);
  text-align: left;
  color: rgba(235, 242, 255, 0.9);
}

@media (max-width: 1024px) {
  .grid,
  .ops-grid,
  .hero {
    grid-template-columns: 1fr;
  }

  .hero {
    display: grid;
  }
}
</style>
