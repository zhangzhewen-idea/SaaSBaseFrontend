<template>
  <section class="depts-page">
    <header class="page-header card">
      <div>
        <p class="eyebrow">Departments</p>
        <h2>部门管理</h2>
        <p class="lead">支持部门树、成员列表与成员动作占位，后续可以直接替换为真实后端接口数据。</p>
      </div>
      <button class="primary" type="button" @click="handleReload">刷新树</button>
    </header>

    <div class="grid">
      <section class="card panel">
        <div class="panel-head">
          <strong>部门树</strong>
          <span>{{ state.tree.length }} 个根节点</span>
        </div>

        <p v-if="state.loading" class="hint">正在加载部门树...</p>
        <p v-else-if="state.error" class="error">{{ state.error }}</p>
        <ul v-else class="tree">
          <li v-for="node in state.tree" :key="node.id">
            <button type="button" @click="handleLoadMembers(node.id)">
              {{ node.name }} <span>({{ node.memberCount }})</span>
            </button>
          </li>
        </ul>
      </section>

      <section class="card panel">
        <div class="panel-head">
          <strong>成员列表</strong>
          <span>{{ state.total }} 条记录</span>
        </div>

        <p v-if="state.loading" class="hint">正在加载成员列表...</p>
        <p v-else-if="state.error" class="error">{{ state.error }}</p>
        <table v-else-if="state.members.length > 0">
          <thead>
            <tr>
              <th>姓名</th>
              <th>角色</th>
              <th>加入时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="member in state.members" :key="member.id">
              <td>{{ member.userName }}</td>
              <td>{{ member.roleName }}</td>
              <td>{{ member.joinedAt }}</td>
              <td>
                <button type="button" @click="handleRemove(member)">移除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="hint">选择一个部门以查看成员。</p>
      </section>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'

import { useDepartmentsModule } from './useDepartmentsModule'

const { state, loadTree, loadMembers, removeMember } = useDepartmentsModule()

onMounted(() => {
  void loadTree()
})

function handleReload(): void {
  void loadTree()
}

function handleLoadMembers(id: string): void {
  void loadMembers(id)
}

function handleRemove(member: { departmentId: string; id: string }): void {
  void removeMember(member.departmentId, member.id)
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

.panel {
  display: grid;
  gap: 16px;
}

.panel-head {
  display: flex;
  justify-content: space-between;
  color: var(--color-text-weak);
}

.tree {
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.tree button,
button {
  min-height: 40px;
  border: 0;
  border-radius: 12px;
  cursor: pointer;
  padding: 0 14px;
  font: inherit;
}

.tree button {
  width: 100%;
  text-align: left;
  background: #f6f8fc;
}

.primary {
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: white;
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
  .page-header {
    grid-template-columns: 1fr;
  }

  .page-header {
    display: grid;
  }
}
</style>
