---
title: Java 分布式锁服务
description: 基于 Redisson 实现的分布式锁服务
---


## 分布式锁服务

```java
import org.redisson.RedissonClient;
import org.redisson.api.RLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

/**
 * 分布式锁服务
 * 提供基于 Redisson 的分布式锁实现，用于在分布式环境下保护临界资源
 */
@Service
public class DistributedLockService {

    @Autowired
    private RedissonClient redissonClient;

    /**
     * 在锁保护下执行方法，执行完成后自动释放锁
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有时间（超过后自动释放，防止死锁）
     * @param timeUnit  时间单位
     * @param runnable  要执行的方法
     * @throws RuntimeException 获取锁失败时抛出
     */
    public void executeWithLock(String lockKey, long waitTime, long leaseTime, TimeUnit timeUnit, Runnable runnable) {
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        try {
            locked = lock.tryLock(waitTime, leaseTime, timeUnit);
            if (!locked) {
                throw new RuntimeException("获取锁失败，当前锁被占用: " + lockKey);
            }
            runnable.run();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("获取锁被中断: " + lockKey, e);
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    /**
     * 简化版：使用默认时间单位（秒）
     */
    public void executeWithLock(String lockKey, long waitTime, long leaseTime, Runnable runnable) {
        executeWithLock(lockKey, waitTime, leaseTime, TimeUnit.SECONDS, runnable);
    }

    /**
     * 带返回值的锁执行方法
     *
     * @param lockKey   锁的key
     * @param waitTime  等待时间
     * @param leaseTime 持有时间
     * @param timeUnit  时间单位
     * @param supplier  要执行的函数（带返回值）
     * @return 函数执行结果
     * @throws RuntimeException 获取锁失败时抛出
     */
    public <T> T executeWithLock(String lockKey, long waitTime, long leaseTime, TimeUnit timeUnit, Supplier<T> supplier) {
        RLock lock = redissonClient.getLock(lockKey);
        boolean locked = false;
        try {
            locked = lock.tryLock(waitTime, leaseTime, timeUnit);
            if (!locked) {
                throw new RuntimeException("获取锁失败，当前锁被占用: " + lockKey);
            }
            return supplier.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("获取锁被中断: " + lockKey, e);
        } finally {
            if (locked && lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }

    /**
     * 带返回值的简化版：使用默认时间单位（秒）
     */
    public <T> T executeWithLock(String lockKey, long waitTime, long leaseTime, Supplier<T> supplier) {
        return executeWithLock(lockKey, waitTime, leaseTime, TimeUnit.SECONDS, supplier);
    }
}
```

## 调用示例

```java
// 示例：使用分布式锁保护数据库更新操作
// 无返回值
lockService.executeWithLock("order:123", 3, 10, TimeUnit.SECONDS, () -> {
    // 执行业务逻辑
    orderService.processOrder(orderId);
});

// 带返回值
Order order = lockService.executeWithLock("order:123", 3, 10, () -> {
    return orderService.getOrder(orderId);
});
```
