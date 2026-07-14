<template>
  <section class="depts-page">
    <el-card>
      <template #header>
        <div class="hero">
          <div>
            <p class="eyebrow">Departments</p>
            <h2>部门管理</h2>
            <p class="lead">支持部门树、成员列表与最小成员动作，所有交互都直接走真实后端。</p>
          </div>
          <div class="header-actions">
            <el-button @click="handleReload">刷新</el-button>
            <el-button type="primary" @click="handleCreateDepartment">新增部门</el-button>
          </div>
        </div>
      </template>

      <el-row :gutter="16">
        <el-col :xs="24" :md="8">
          <el-card shadow="never">
            <template #header>
              <div class="panel-head">
                <div>
                  <strong>部门树</strong>
                  <p class="subtle">{{ state.tree.length }} 个根节点</p>
                </div>
                <el-tag>当前层级</el-tag>
              </div>
            </template>

            <el-alert v-if="state.treeLoading" title="正在加载部门树..." type="info" :closable="false" />
            <el-alert v-else-if="state.error" :title="state.error" type="error" :closable="false" />
            <el-tree
              v-else
              :data="state.tree"
              node-key="id"
              :props="{ label: 'name', children: 'children' }"
              @node-click="handleSelectDepartment"
            />
          </el-card>
        </el-col>

        <el-col :xs="24" :md="16">
          <el-card shadow="never">
            <template #header>
              <div class="panel-head">
                <div>
                  <strong>成员列表</strong>
                  <p class="subtle">{{ state.selectedDepartmentName || '请选择一个部门' }}</p>
                </div>
                <el-tag>{{ state.total }} 条记录</el-tag>
              </div>
            </template>

            <el-alert v-if="state.memberLoading" title="正在加载成员列表..." type="info" :closable="false" />
            <el-alert v-else-if="state.error" :title="state.error" type="error" :closable="false" />
            <el-table v-else-if="state.members.length > 0" :data="state.members" stripe>
              <el-table-column prop="userName" label="姓名" />
              <el-table-column prop="roleName" label="角色" />
              <el-table-column label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'disabled' ? 'info' : 'success'">
                    {{ row.status === 'disabled' ? '停用' : '启用' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="joinedAt" label="加入时间" />
              <el-table-column label="操作" width="100">
                <template #default="{ row }">
                  <el-button link type="danger" @click="handleRemove(row)">移除</el-button>
                </template>
              </el-table-column>
            </el-table>
            <el-empty v-else description="选择一个部门以查看成员。" />

            <el-divider />

            <el-space direction="vertical" fill>
              <el-input
                v-model="memberUserIdsText"
                type="textarea"
                :rows="3"
                placeholder="user-1,user-2"
              />
              <el-button type="primary" :disabled="state.actionLoading" @click="handleAddMembers">添加成员</el-button>
            </el-space>
          </el-card>
        </el-col>

        <el-col :span="24">
          <el-card shadow="never">
            <template #header>
              <div class="panel-head">
                <div>
                  <strong>组织操作</strong>
                  <p class="subtle">基础组织维护</p>
                </div>
                <el-tag :type="state.actionLoading ? 'warning' : 'success'">
                  {{ state.actionLoading ? '正在处理...' : '可编辑' }}
                </el-tag>
              </div>
            </template>

            <el-alert v-if="state.actionError" :title="state.actionError" type="error" :closable="false" />

            <el-row :gutter="16">
              <el-col :xs="24" :md="8">
                <el-card shadow="never">
                  <h3>新增部门</h3>
                  <el-form label-position="top">
                    <el-form-item label="名称">
                      <el-input v-model="createForm.name" placeholder="新部门名称" />
                    </el-form-item>
                    <el-form-item label="上级部门 ID">
                      <el-input v-model="createForm.parentId" placeholder="留空表示根节点" />
                    </el-form-item>
                    <el-form-item label="编码">
                      <el-input v-model="createForm.code" placeholder="可选" />
                    </el-form-item>
                    <el-form-item label="排序号">
                      <el-input-number v-model="createForm.orderNo" :min="0" />
                    </el-form-item>
                    <el-button type="primary" :disabled="state.actionLoading" @click="handleCreateDepartment">创建</el-button>
                  </el-form>
                </el-card>
              </el-col>

              <el-col :xs="24" :md="8">
                <el-card shadow="never">
                  <h3>编辑当前部门</h3>
                  <el-text type="info">当前选中：{{ state.selectedDepartmentName || '未选择' }}</el-text>
                  <el-form label-position="top">
                    <el-form-item label="名称">
                      <el-input v-model="updateForm.name" placeholder="部门名称" />
                    </el-form-item>
                    <el-form-item label="编码">
                      <el-input v-model="updateForm.code" placeholder="部门编码" />
                    </el-form-item>
                    <el-form-item label="排序号">
                      <el-input-number v-model="updateForm.orderNo" :min="0" />
                    </el-form-item>
                    <el-button type="primary" :disabled="state.actionLoading || !state.selectedDepartmentId" @click="handleUpdateDepartment">
                      保存
                    </el-button>
                  </el-form>
                </el-card>
              </el-col>

              <el-col :xs="24" :md="8">
                <el-card shadow="never">
                  <h3>移动当前部门</h3>
                  <el-form label-position="top">
                    <el-form-item label="新上级部门 ID">
                      <el-input v-model="moveForm.parentId" placeholder="留空表示根节点" />
                    </el-form-item>
                    <el-form-item label="排序号">
                      <el-input-number v-model="moveForm.orderNo" :min="0" />
                    </el-form-item>
                    <el-button type="primary" :disabled="state.actionLoading || !state.selectedDepartmentId" @click="handleMoveDepartment">
                      移动
                    </el-button>
                  </el-form>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>
    </el-card>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import type { DepartmentNode } from '@/api'

import { useDepartmentsModule } from './useDepartmentsModule'

const {
  state,
  selectedDepartment,
  loadTree,
  loadMembers,
  createDepartment,
  updateDepartment,
  moveDepartment,
  addMembers,
  removeMember,
  selectDepartment
} = useDepartmentsModule()

const createForm = reactive({ name: '', parentId: '', code: '', orderNo: 0 })
const updateForm = reactive({ name: '', code: '', orderNo: 0 })
const moveForm = reactive({ parentId: '', orderNo: 0 })
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
</script>

<style scoped>
.depts-page {
  display: grid;
  gap: 22px;
}

.hero,
.panel-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
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

.lead,
.subtle {
  color: var(--color-text-weak);
  line-height: 1.7;
}
</style>
