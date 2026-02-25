---
title: MyBatis-Plus 常用代码
description: MyBatis-Plus 开发常用代码片段
---

## 基础 CRUD

### Entity 定义

```java
@Data
@TableName("t_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    
    private String username;
    private String email;
    private Integer status;
    
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
    
    @TableLogic
    private Integer deleted;
}
```

### Mapper 接口

```java
public interface UserMapper extends BaseMapper<User> {
    
    @Select("SELECT * FROM t_user WHERE email = #{email}")
    User selectByEmail(@Param("email") String email);
    
    @Select("SELECT * FROM t_user WHERE status = #{status}")
    IPage<User> selectPageByStatus(Page<User> page, @Param("status") Integer status);
}
```

## 条件构造器

### QueryWrapper

```java
QueryWrapper<User> wrapper = new QueryWrapper<>();
wrapper.eq("status", 1)
       .like("username", "admin")
       .orderByDesc("create_time");
List<User> users = userMapper.selectList(wrapper);

LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
wrapper.eq(User::getStatus, 1)
       .like(User::getUsername, "admin")
       .orderByDesc(User::getCreateTime);
```

### UpdateWrapper

```java
UpdateWrapper<User> wrapper = new UpdateWrapper<>();
wrapper.eq("id", 1L)
       .set("status", 0)
       .set("update_time", LocalDateTime.now());
userMapper.update(null, wrapper);

LambdaUpdateWrapper<User> wrapper = new LambdaUpdateWrapper<>();
wrapper.eq(User::getId, 1L)
       .set(User::getStatus, 0);
```

## 分页查询

### 配置分页插件

```java
@Configuration
public class MybatisPlusConfig {
    
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
```

### 分页查询示例

```java
public Page<User> selectUserPage(int pageNum, int pageSize, String keyword) {
    Page<User> page = new Page<>(pageNum, pageSize);
    LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
    wrapper.like(StringUtils.isNotEmpty(keyword), User::getUsername, keyword)
           .eq(User::getStatus, 1)
           .orderByDesc(User::getCreateTime);
    return userMapper.selectPage(page, wrapper);
}
```

## 自动填充

```java
@Component
public class MyMetaObjectHandler implements MetaObjectHandler {
    
    @Override
    public void insertFill(MetaObject metaObject) {
        this.strictInsertFill(metaObject, "createTime", LocalDateTime.class, LocalDateTime.now());
        this.strictInsertFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        this.strictUpdateFill(metaObject, "updateTime", LocalDateTime.class, LocalDateTime.now());
    }
}
```

## Service 层

```java
public interface UserService extends IService<User> {
    Page<User> selectUserPage(int pageNum, int pageSize, String keyword);
}

@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {
    
    @Override
    public Page<User> selectUserPage(int pageNum, int pageSize, String keyword) {
        Page<User> page = new Page<>(pageNum, pageSize);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.like(StringUtils.isNotEmpty(keyword), User::getUsername, keyword);
        return this.page(page, wrapper);
    }
}
```
