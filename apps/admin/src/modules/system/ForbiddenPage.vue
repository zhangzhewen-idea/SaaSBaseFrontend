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
  background: linear-gradient(180deg, rgba(16, 26, 44, 0.94), rgba(9, 16, 30, 0.92));
  border: 1px solid rgba(151, 180, 238, 0.14);
  border-radius: 24px;
  box-shadow: 0 24px 72px rgba(2, 8, 20, 0.34);
  color: #f7fbff;
}

.eyebrow {
  margin: 0 0 10px;
  color: #7fb4ff;
  font-weight: 700;
}

h2,
p {
  margin: 0;
}

p {
  margin-top: 12px;
  color: rgba(220, 231, 255, 0.72);
}

button {
  margin-top: 24px;
  padding: 12px 18px;
  border: 0;
  border-radius: 999px;
  background: linear-gradient(135deg, var(--color-brand-500), var(--color-brand-700));
  color: #f7fbff;
  font-weight: 700;
}
</style>
