---
title: Vue 3 组合式 API
description: Vue 3 Composition API 核心概念与最佳实践
---

## 响应式基础

### ref 和 reactive

```typescript
import { ref, reactive, toRefs } from 'vue'

// ref - 基本类型
const count = ref(0)
count.value++

// reactive - 对象类型
const state = reactive({
  name: 'Vue',
  version: 3
})
state.name = 'Vue 3'

// toRefs - 解构保持响应性
const { name, version } = toRefs(state)
```

### computed 和 watch

```typescript
import { ref, computed, watch, watchEffect } from 'vue'

const firstName = ref('John')
const lastName = ref('Doe')

// 计算属性
const fullName = computed(() => `${firstName.value} ${lastName.value}`)

// 侦听器
watch(firstName, (newVal, oldVal) => {
  console.log(`firstName changed: ${oldVal} -> ${newVal}`)
})

// 侦听多个源
watch([firstName, lastName], ([newFirst, newLast]) => {
  console.log(`Full name: ${newFirst} ${newLast}`)
})

// 自动追踪依赖
watchEffect(() => {
  console.log(`Full name is: ${fullName.value}`)
})
```

## 生命周期

```typescript
import { 
  onBeforeMount, 
  onMounted, 
  onBeforeUpdate, 
  onUpdated,
  onBeforeUnmount,
  onUnmounted 
} from 'vue'

onBeforeMount(() => {
  console.log('组件挂载前')
})

onMounted(() => {
  console.log('组件已挂载')
})

onBeforeUnmount(() => {
  // 清理定时器、事件监听等
})
```

## 依赖注入

```typescript
// 父组件 - 提供数据
import { provide, ref } from 'vue'

const theme = ref('dark')
provide('theme', theme)

// 子组件 - 注入数据
import { inject } from 'vue'

const theme = inject('theme', 'light') // 默认值
```

## 自定义 Hooks

### useRequest

```typescript
import { ref, Ref } from 'vue'

interface UseRequestReturn<T> {
  data: Ref<T | null>
  loading: Ref<boolean>
  error: Ref<Error | null>
  execute: () => Promise<void>
}

function useRequest<T>(fn: () => Promise<T>): UseRequestReturn<T> {
  const data = ref<T | null>(null) as Ref<T | null>
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const execute = async () => {
    loading.value = true
    error.value = null
    try {
      data.value = await fn()
    } catch (e) {
      error.value = e as Error
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, execute }
}

// 使用
const { data, loading, execute } = useRequest(() => fetchUser(1))
onMounted(execute)
```

### useLocalStorage

```typescript
import { ref, watch } from 'vue'

function useLocalStorage<T>(key: string, defaultValue: T) {
  const stored = localStorage.getItem(key)
  const data = ref<T>(stored ? JSON.parse(stored) : defaultValue)

  watch(data, (newVal) => {
    localStorage.setItem(key, JSON.stringify(newVal))
  }, { deep: true })

  return data
}

// 使用
const theme = useLocalStorage('theme', 'light')
```

## 组件通信

### Props 和 Emits

```typescript
// 子组件
const props = defineProps<{
  title: string
  count?: number
}>()

const emit = defineEmits<{
  (e: 'update', value: number): void
  (e: 'delete', id: string): void
}>()

emit('update', 10)
```

### v-model 双向绑定

```typescript
// 父组件
<CustomInput v-model="text" />

// 子组件
const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const input = (e: Event) => {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
```

## Teleport 传送门

```vue
<template>
  <Teleport to="body">
    <div class="modal">
      <!-- 模态框内容 -->
    </div>
  </Teleport>
</template>
```

## 最佳实践

1. 优先使用 `<script setup>` 语法糖
2. 复杂逻辑抽取为自定义 Hooks
3. 使用 TypeScript 增强类型安全
4. 合理使用 computed 避免重复计算
5. 及时清理副作用（定时器、事件监听）
