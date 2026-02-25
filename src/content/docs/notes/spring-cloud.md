---
title: Spring Cloud 微服务架构
description: Spring Cloud 核心组件与微服务架构实践
---

## 核心组件

### 服务注册与发现 - Nacos

```yaml
# application.yml
spring:
  cloud:
    nacos:
      discovery:
        server-addr: localhost:8848
        namespace: dev
        group: DEFAULT_GROUP
```

### 配置中心 - Nacos Config

```yaml
spring:
  cloud:
    nacos:
      config:
        server-addr: localhost:8848
        file-extension: yaml
        shared-configs:
          - data-id: common.yaml
            refresh: true
```

### 服务网关 - Spring Cloud Gateway

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/user/**
          filters:
            - StripPrefix=1
            - name: RequestRateLimiter
              args:
                redis-rate-limiter.replenishRate: 10
                redis-rate-limiter.burstCapacity: 20
```

### 服务调用 - OpenFeign

```java
@FeignClient(name = "user-service", fallback = UserFallback.class)
public interface UserClient {
    
    @GetMapping("/user/{id}")
    Result<User> getById(@PathVariable Long id);
}

@Component
public class UserFallback implements UserClient {
    @Override
    public Result<User> getById(Long id) {
        return Result.fail("服务不可用");
    }
}
```

### 熔断限流 - Sentinel

```java
@RestController
public class OrderController {
    
    @SentinelResource(value = "createOrder", 
        blockHandler = "handleBlock",
        fallback = "handleFallback")
    @PostMapping("/order")
    public Result createOrder(@RequestBody OrderDTO dto) {
        return Result.success();
    }
    
    public Result handleBlock(BlockException e) {
        return Result.fail("系统繁忙，请稍后重试");
    }
    
    public Result handleFallback(Throwable t) {
        return Result.fail("服务异常");
    }
}
```

## 分布式事务 - Seata

### AT 模式配置

```yaml
seata:
  enabled: true
  tx-service-group: my_tx_group
  service:
    vgroup-mapping:
      my_tx_group: default
  registry:
    type: nacos
    nacos:
      server-addr: localhost:8848
```

### 使用示例

```java
@Service
public class OrderService {
    
    @GlobalTransactional
    public void createOrder(OrderDTO dto) {
        orderMapper.insert(order);
        stockClient.deduct(dto.getProductId(), dto.getQuantity());
        accountClient.deduct(dto.getUserId(), dto.getAmount());
    }
}
```

## 消息队列集成

### RabbitMQ

```java
@Configuration
public class RabbitConfig {
    
    @Bean
    public Queue orderQueue() {
        return new Queue("order.queue", true);
    }
    
    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order.exchange");
    }
    
    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue())
            .to(orderExchange())
            .with("order.created");
    }
}

@Component
public class OrderConsumer {
    
    @RabbitListener(queues = "order.queue")
    public void handleOrder(OrderMessage msg) {
        // 处理订单消息
    }
}
```

## 服务监控

### 健康检查

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: always
```

### 链路追踪 - Micrometer + Zipkin

```yaml
spring:
  zipkin:
    base-url: http://localhost:9411
  sleuth:
    sampler:
      probability: 1.0
```

## 最佳实践

1. **服务拆分**: 按业务领域拆分，避免过度拆分
2. **接口版本**: 使用版本号管理接口变更
3. **异常处理**: 统一异常码和错误信息
4. **日志规范**: 使用 TraceId 串联请求链路
5. **配置管理**: 敏感配置使用加密存储
