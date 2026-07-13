<script setup lang="ts">
import { ref } from 'vue'

type DemoState = 'loading' | 'error' | 'empty' | 'success'

const demoState = ref<DemoState>('success')
const viewText = ref('租户工作台已加载')

async function loadDemoState(state: DemoState): Promise<void> {
  demoState.value = state
  await Promise.resolve()
  if (state === 'loading') viewText.value = '正在加载租户工作台'
  else if (state === 'error') viewText.value = '租户工作台加载失败'
  else if (state === 'empty') viewText.value = '暂无租户内容'
  else viewText.value = '租户工作台已加载'
}
</script>

<template>
  <section>
    <h1>租户工作台</h1>

    <div class="demo-switch">
      <button @click="loadDemoState('loading')">
        Loading
      </button>
      <button @click="loadDemoState('error')">
        Error
      </button>
      <button @click="loadDemoState('empty')">
        Empty
      </button>
      <button @click="loadDemoState('success')">
        Success
      </button>
    </div>

    <p>{{ viewText }}</p>
  </section>
</template>
