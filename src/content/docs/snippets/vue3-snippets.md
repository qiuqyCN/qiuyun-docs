---
title: Vue 3 常用代码片段
description: Vue 3 开发常用代码片段集合
---

## 组件模板

### 通用组件结构

```vue
<template>
  <div class="my-component">
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  title: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()
</script>

<style scoped>
.my-component {
}
</style>
```

### 带加载状态的按钮

```vue
<template>
  <button 
    :disabled="loading || disabled" 
    @click="handleClick"
  >
    <span v-if="loading">加载中...</span>
    <slot v-else />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
}>()

const handleClick = () => {
  if (!props.loading && !props.disabled) {
    emit('click')
  }
}
</script>
```

## 表单处理

### 表单验证

```typescript
import { ref, reactive } from 'vue'

interface FormState {
  username: string
  email: string
  password: string
}

interface FormErrors {
  username?: string
  email?: string
  password?: string
}

function useForm() {
  const form = reactive<FormState>({
    username: '',
    email: '',
    password: ''
  })
  
  const errors = reactive<FormErrors>({})
  
  const validate = () => {
    let valid = true
    
    if (!form.username) {
      errors.username = '请输入用户名'
      valid = false
    }
    
    if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = '请输入正确的邮箱'
      valid = false
    }
    
    if (!form.password || form.password.length < 6) {
      errors.password = '密码至少6位'
      valid = false
    }
    
    return valid
  }
  
  const reset = () => {
    Object.assign(form, { username: '', email: '', password: '' })
    Object.keys(errors).forEach(key => delete errors[key as keyof FormErrors])
  }
  
  return { form, errors, validate, reset }
}
```

## 工具函数

### 防抖与节流

```typescript
import { ref, onUnmounted } from 'vue'

function useDebounce(fn: Function, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  
  const debounced = (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
  
  const cancel = () => clearTimeout(timer)
  
  onUnmounted(cancel)
  
  return { debounced, cancel }
}

function useThrottle(fn: Function, delay: number) {
  let lastTime = 0
  
  const throttled = (...args: any[]) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn(...args)
      lastTime = now
    }
  }
  
  return throttled
}
```

### 剪贴板操作

```typescript
function useClipboard() {
  const copied = ref(false)
  
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      copied.value = true
      setTimeout(() => copied.value = false, 2000)
      return true
    } catch {
      return false
    }
  }
  
  const read = async () => {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return null
    }
  }
  
  return { copied, copy, read }
}
```

## 请求封装

### Axios 实例

```typescript
import axios from 'axios'
import { useUserStore } from '@/stores/user'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000
})

request.interceptors.request.use(config => {
  const userStore = useUserStore()
  if (userStore.token) {
    config.headers.Authorization = `Bearer ${userStore.token}`
  }
  return config
})

request.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      const userStore = useUserStore()
      userStore.logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default request
```
