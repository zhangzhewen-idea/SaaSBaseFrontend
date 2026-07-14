<template>
  <section class="system-page">
    <el-result icon="warning" title="没有权限访问当前页面" sub-title="当前会话没有匹配的权限，或者租户范围不允许进入此模块。">
      <template #extra>
        <el-button type="primary" @click="$router.push('/dashboard')">返回工作台</el-button>
      </template>
    </el-result>
  </section>
</template>

<style scoped>
.system-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
}
</style>
