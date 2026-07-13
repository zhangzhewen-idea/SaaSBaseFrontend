<template>
  <div class="status-card card">
    <p class="eyebrow">403 Forbidden</p>
    <h2>没有权限访问当前页面</h2>
    <p>当前会话没有匹配的权限，或者租户范围不允许进入此模块。</p>
    <button type="button" @click="$router.push('/dashboard')">返回工作台</button>
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
