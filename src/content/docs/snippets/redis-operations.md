---
title: Redis 常用操作
description: Redis 开发常用命令与最佳实践
---

## 基础数据类型

### String 字符串

```bash
SET key value
SET key value EX 3600
SET key value PX 60000
SETNX key value
GET key
MGET key1 key2 key3
INCR counter
INCRBY counter 10
DECR counter
```

### Hash 哈希

```bash
HSET user:1 name "张三" age 25
HGET user:1 name
HGETALL user:1
HMGET user:1 name age
HDEL user:1 age
HEXISTS user:1 name
```

### List 列表

```bash
LPUSH list value
RPUSH list value
LRANGE list 0 -1
LINDEX list 0
LPOP list
RPOP list
BLPOP list 5
```

### Set 集合

```bash
SADD set value1 value2
SMEMBERS set
SISMEMBER set value
SINTER set1 set2
SUNION set1 set2
SDIFF set1 set2
```

### ZSet 有序集合

```bash
ZADD rank 100 "user1" 90 "user2"
ZRANK rank "user1"
ZREVRANK rank "user1"
ZRANGE rank 0 9 WITHSCORES
ZREVRANGE rank 0 9 WITHSCORES
ZRANGEBYSCORE rank 80 100
```

## Spring Boot 集成

### 配置

```yaml
spring:
  data:
    redis:
      host: localhost
      port: 6379
      password: 
      database: 0
      lettuce:
        pool:
          max-active: 8
          max-idle: 8
          min-idle: 0
```

### RedisTemplate 使用

```java
@Service
public class RedisService {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    public void set(String key, Object value, long timeout, TimeUnit unit) {
        redisTemplate.opsForValue().set(key, value, timeout, unit);
    }
    
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }
    
    public Boolean delete(String key) {
        return redisTemplate.delete(key);
    }
    
    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }
    
    public Boolean expire(String key, long timeout, TimeUnit unit) {
        return redisTemplate.expire(key, timeout, unit);
    }
}
```

### 缓存注解

```java
@Service
public class UserService {
    
    @Cacheable(value = "user", key = "#id")
    public User getById(Long id) {
        return userMapper.selectById(id);
    }
    
    @CachePut(value = "user", key = "#user.id")
    public User update(User user) {
        userMapper.updateById(user);
        return user;
    }
    
    @CacheEvict(value = "user", key = "#id")
    public void delete(Long id) {
        userMapper.deleteById(id);
    }
}
```

## 分布式锁

### Redisson 实现

```java
@Configuration
public class RedissonConfig {
    
    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
            .setAddress("redis://localhost:6379");
        return Redisson.create(config);
    }
}

@Service
public class OrderService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    public void createOrder(String orderId) {
        RLock lock = redissonClient.getLock("order:" + orderId);
        try {
            if (lock.tryLock(10, 30, TimeUnit.SECONDS)) {
            }
        } finally {
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

## 常见应用场景

### 缓存

```java
public User getUserWithCache(Long id) {
    String key = "user:" + id;
    User user = (User) redisTemplate.opsForValue().get(key);
    if (user == null) {
        user = userMapper.selectById(id);
        if (user != null) {
            redisTemplate.opsForValue().set(key, user, 1, TimeUnit.HOURS);
        }
    }
    return user;
}
```

### 限流

```java
public boolean allowRequest(String key, int limit, int period) {
    String redisKey = "rate:" + key;
    Long count = redisTemplate.opsForValue().increment(redisKey);
    if (count == 1) {
        redisTemplate.expire(redisKey, period, TimeUnit.SECONDS);
    }
    return count <= limit;
}
```

## 最佳实践

1. **Key 命名规范**: `业务:模块:ID`，如 `user:profile:1`
2. **设置过期时间**: 避免内存溢出
3. **避免大 Key**: 单个 Key 的 Value 不要超过 10KB
4. **批量操作**: 使用 Pipeline 或 Lua 脚本
5. **序列化**: 统一使用 JSON 序列化
