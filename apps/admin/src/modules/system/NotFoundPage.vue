<template>
  <div class="status-card card">
    <p class="eyebrow">404 Not Found</p>
    <h2>页面不存在</h2>
    <p>你访问的路由没有被配置，或者已被迁移到新的位置。</p>
    <button type="button" @click="$router.push('/dashboard')">回到工作台</button>
  </div>
</template>

<style scoped>
.card {
  max-width: 560px;
  margin: 56px auto;
  padding: 32px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}

.eyebrow {
  margin: 0 0 10px;
  color: var(--color-brand-500);
  font-weight: 700;
}

h2,
p {
  margin: 0;
}

p {
  margin-top: 12px;
  color: var(--color-text-weak);
}

button {
  margin-top: 24px;
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: var(--color-brand-500);
  color: white;
  font-weight: 700;
}
</style>
