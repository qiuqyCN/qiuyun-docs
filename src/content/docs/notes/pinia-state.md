---
title: Pinia 状态管理
description: Vue 3 官方推荐的状态管理方案
---

## 基础使用

### 定义 Store

```typescript
// stores/user.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// Options API 风格
export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: '',
    roles: [] as string[]
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    hasRole: (state) => (role: string) => state.roles.includes(role)
  },
  
  actions: {
    setUser(user: { name: string; token: string }) {
      this.name = user.name
      this.token = user.token
    },
    
    logout() {
      this.name = ''
      this.token = ''
      this.roles = []
    }
  }
})

// Composition API 风格
export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  
  function increment() {
    count.value++
  }
  
  return { count, doubleCount, increment }
})
```

### 在组件中使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

// 读取状态
console.log(userStore.name)
console.log(userStore.isLoggedIn)

// 修改状态
userStore.setUser({ name: 'Admin', token: 'xxx' })

// 调用 action
userStore.logout()
</script>
```

## 解构与响应性

```typescript
import { storeToRefs } from 'pinia'

const userStore = useUserStore()

// 错误：失去响应性
const { name, token } = userStore

// 正确：使用 storeToRefs
const { name, token } = storeToRefs(userStore)

// actions 不需要 storeToRefs
const { setUser, logout } = userStore
```

## 持久化

### 使用 pinia-plugin-persistedstate

```typescript
// main.ts
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// store 配置
export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null
  }),
  
  persist: {
    key: 'user-store',
    storage: localStorage,
    paths: ['token', 'userInfo']
  }
})
```

## 组合式 Store

```typescript
export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  
  const total = computed(() => 
    items.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  )
  
  return { items, total }
})

export const useOrderStore = defineStore('order', () => {
  const cartStore = useCartStore()
  
  async function createOrder() {
    const orderItems = cartStore.items
    // 创建订单...
    cartStore.$reset()
  }
  
  return { createOrder }
})
```

## 订阅状态变化

```typescript
const userStore = useUserStore()

// 订阅 state 变化
userStore.$subscribe((mutation, state) => {
  console.log('Type:', mutation.type)
  console.log('Store ID:', mutation.storeId)
  console.log('New State:', state)
})

// 订阅 action 调用
userStore.$onAction(({ name, args, after, onError }) => {
  console.log(`Action ${name} called with:`, args)
  
  after((result) => {
    console.log(`Action ${name} finished:`, result)
  })
  
  onError((error) => {
    console.error(`Action ${name} failed:`, error)
  })
})
```

## 重置与批量更新

```typescript
const userStore = useUserStore()

// 重置到初始状态
userStore.$reset()

// 批量更新
userStore.$patch({
  name: 'New Name',
  token: 'new-token'
})

// 批量更新（函数式）
userStore.$patch((state) => {
  state.roles.push('admin')
})
```

## 与 Vue Router 配合

```typescript
// router/guards.ts
import { useUserStore } from '@/stores/user'

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
})
```

## 最佳实践

1. Store 按功能模块拆分，避免单一巨大 Store
2. 敏感数据不要持久化到 localStorage
3. 复杂异步逻辑放在 actions 中
4. 使用 TypeScript 定义 state 类型
5. 合理使用 getters 处理派生状态
