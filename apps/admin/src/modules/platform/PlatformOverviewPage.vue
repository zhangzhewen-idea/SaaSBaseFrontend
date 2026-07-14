<script setup lang="ts">
import { ref } from 'vue'

type DemoState = 'loading' | 'error' | 'empty' | 'success'

const demoState = ref<DemoState>('success')
const viewText = ref('平台概览已加载')

async function loadDemoState(state: DemoState): Promise<void> {
  demoState.value = state
  await Promise.resolve()
  if (state === 'loading') viewText.value = '正在加载平台概览'
  else if (state === 'error') viewText.value = '平台概览加载失败'
  else if (state === 'empty') viewText.value = '暂无平台数据'
  else viewText.value = '平台概览已加载'
}
</script>

<template>
  <section>
    <h1>平台概览</h1>

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
