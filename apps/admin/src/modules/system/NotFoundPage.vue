<template>
  <section class="system-page">
    <el-result icon="error" title="页面不存在" sub-title="你访问的路由没有被配置，或者已被迁移到新的位置。">
      <template #extra>
        <el-button type="primary" @click="$router.push('/dashboard')">回到工作台</el-button>
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
