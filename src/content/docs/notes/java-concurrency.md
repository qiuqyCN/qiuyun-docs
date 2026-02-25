---
title: Java 并发编程基础
description: Java 多线程与并发编程的核心概念
---

## 线程基础

### 创建线程的方式

```java
// 方式1：继承 Thread 类
public class MyThread extends Thread {
    @Override
    public void run() {
        System.out.println("Thread running");
    }
}

// 方式2：实现 Runnable 接口
public class MyRunnable implements Runnable {
    @Override
    public void run() {
        System.out.println("Runnable running");
    }
}

// 方式3：使用 Lambda 表达式
Thread thread = new Thread(() -> System.out.println("Lambda thread"));
```

### 线程生命周期

- **NEW**: 新建状态
- **RUNNABLE**: 可运行状态
- **BLOCKED**: 阻塞状态
- **WAITING**: 等待状态
- **TIMED_WAITING**: 计时等待状态
- **TERMINATED**: 终止状态

## 线程安全

### synchronized 关键字

```java
// 同步方法
public synchronized void increment() {
    count++;
}

// 同步代码块
public void increment() {
    synchronized(this) {
        count++;
    }
}

// 静态方法同步
public static synchronized void staticMethod() {
    // 类级别锁
}
```

### ReentrantLock

```java
private final ReentrantLock lock = new ReentrantLock();

public void safeMethod() {
    lock.lock();
    try {
        // 临界区代码
    } finally {
        lock.unlock();
    }
}
```

## 线程通信

### wait/notify

```java
public class ProducerConsumer {
    private final Queue<String> queue = new LinkedList<>();
    private final int capacity = 10;

    public synchronized void produce(String item) throws InterruptedException {
        while (queue.size() == capacity) {
            wait();
        }
        queue.add(item);
        notifyAll();
    }

    public synchronized String consume() throws InterruptedException {
        while (queue.isEmpty()) {
            wait();
        }
        String item = queue.poll();
        notifyAll();
        return item;
    }
}
```

## 线程池

### ExecutorService

```java
// 固定大小线程池
ExecutorService fixedPool = Executors.newFixedThreadPool(10);

// 缓存线程池
ExecutorService cachedPool = Executors.newCachedThreadPool();

// 单线程池
ExecutorService singlePool = Executors.newSingleThreadExecutor();

// 推荐：使用 ThreadPoolExecutor 自定义
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    5,                      // 核心线程数
    10,                     // 最大线程数
    60L,                    // 空闲线程存活时间
    TimeUnit.SECONDS,
    new LinkedBlockingQueue<>(100),  // 工作队列
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);
```

## 总结

并发编程是 Java 开发中的核心技能，需要理解线程安全、锁机制和线程池的使用。
