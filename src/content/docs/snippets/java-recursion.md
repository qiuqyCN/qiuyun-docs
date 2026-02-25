---
title: Java 树结构递归处理器
description: 对树结构进行递归处理的通用处理器
---

## 递归处理器

```java 
import java.util.*;
import java.util.function.*;

/**
 * 通用向下递归处理器
 */
public class RecursiveHandler<T> {

    private final ChildrenGetter<T> childrenGetter;

    public RecursiveHandler(ChildrenGetter<T> childrenGetter) {
        this.childrenGetter = childrenGetter;
    }

    /**
     * 深度优先遍历处理
     */
    public void processDepthFirst(T root, RecursiveProcessor<T> processor) {
        processDepthFirst(root, processor, new HashSet<>());
    }

    private void processDepthFirst(T node, RecursiveProcessor<T> processor, Set<T> visited) {
        if (node == null || visited.contains(node)) {
            return;
        }

        visited.add(node);
        List<T> children = childrenGetter.getChildren(node);

        // 先处理子节点
        for (T child : children) {
            processDepthFirst(child, processor, visited);
        }

        // 再处理当前节点
        processor.process(node, children);
    }

    /**
     * 广度优先遍历处理
     */
    public void processBreadthFirst(T root, RecursiveProcessor<T> processor) {
        if (root == null) {
            return;
        }

        Queue<T> queue = new LinkedList<>();
        Set<T> visited = new HashSet<>();

        queue.offer(root);
        visited.add(root);

        while (!queue.isEmpty()) {
            T current = queue.poll();
            List<T> children = childrenGetter.getChildren(current);

            // 处理当前节点
            processor.process(current, children);

            // 将未访问的子节点加入队列
            for (T child : children) {
                if (!visited.contains(child)) {
                    visited.add(child);
                    queue.offer(child);
                }
            }
        }
    }

    /**
     * 查找满足条件的节点
     */
    public Optional<T> findFirst(T root, Predicate<T> predicate) {
        return findFirst(root, predicate, new HashSet<>());
    }

    private Optional<T> findFirst(T node, Predicate<T> predicate, Set<T> visited) {
        if (node == null || visited.contains(node)) {
            return Optional.empty();
        }

        visited.add(node);

        // 检查当前节点
        if (predicate.test(node)) {
            return Optional.of(node);
        }

        // 递归检查子节点
        for (T child : childrenGetter.getChildren(node)) {
            Optional<T> result = findFirst(child, predicate, visited);
            if (result.isPresent()) {
                return result;
            }
        }

        return Optional.empty();
    }

    /**
     * 查找所有满足条件的节点
     */
    public List<T> findAll(T root, Predicate<T> predicate) {
        List<T> result = new ArrayList<>();
        findAll(root, predicate, result, new HashSet<>());
        return result;
    }

    private void findAll(T node, Predicate<T> predicate, List<T> result, Set<T> visited) {
        if (node == null || visited.contains(node)) {
            return;
        }

        visited.add(node);

        // 检查当前节点
        if (predicate.test(node)) {
            result.add(node);
        }

        // 递归检查子节点
        for (T child : childrenGetter.getChildren(node)) {
            findAll(child, predicate, result, visited);
        }
    }

    /**
     * 映射处理 - 将树结构转换为另一种结构
     */
    public <R> R map(T root, Function<T, R> mapper, BiFunction<T, List<R>, R> combiner) {
        return map(root, mapper, combiner, new HashMap<>());
    }

    private <R> R map(T node, Function<T, R> mapper, BiFunction<T, List<R>, R> combiner, Map<T, R> cache) {
        if (node == null) {
            return null;
        }

        // 检查缓存
        if (cache.containsKey(node)) {
            return cache.get(node);
        }

        List<T> children = childrenGetter.getChildren(node);
        List<R> mappedChildren = new ArrayList<>();

        // 递归处理子节点
        for (T child : children) {
            R mappedChild = map(child, mapper, combiner, cache);
            if (mappedChild != null) {
                mappedChildren.add(mappedChild);
            }
        }

        // 组合结果
        R result = combiner.apply(node, mappedChildren);
        cache.put(node, result);

        return result;
    }

    /**
     * 递归处理器接口
     * @param <T> 处理的数据类型
     */
    @FunctionalInterface
    public interface RecursiveProcessor<T> {
        /**
         * 处理当前节点
         * @param current 当前节点
         * @param children 当前节点的子节点列表（可能为空）
         */
        void process(T current, List<T> children);
    }

    /**
     * 子节点获取器接口
     * @param <T> 数据类型
     */
    @FunctionalInterface
    public interface ChildrenGetter<T> {
        /**
         * 获取指定节点的子节点列表
         * @param node 父节点
         * @return 子节点列表
         */
        List<T> getChildren(T node);
    }
```

## 示例

```java
public class Demo {
    // ==================== 调用示例 ====================

    /**
     * 示例1: 组织架构树处理
     */
    static class Employee {
        String name;
        String department;
        int level; // 职级
        List<Employee> subordinates = new ArrayList<>();

        Employee(String name, String department, int level) {
            this.name = name;
            this.department = department;
            this.level = level;
        }

        void addSubordinate(Employee e) {
            subordinates.add(e);
        }

        @Override
        public String toString() {
            return String.format("%s(%s, L%d)", name, department, level);
        }
    }

    public static void demoOrganizationTree() {
        System.out.println("========== 示例1: 组织架构树 ==========\n");

        // 构建组织架构
        Employee ceo = new Employee("张三", "总裁办", 10);
        Employee cto = new Employee("李四", "技术部", 9);
        Employee cfo = new Employee("王五", "财务部", 9);

        Employee techLead1 = new Employee("赵六", "后端组", 7);
        Employee techLead2 = new Employee("孙七", "前端组", 7);
        Employee dev1 = new Employee("周八", "后端组", 5);
        Employee dev2 = new Employee("吴九", "前端组", 5);
        Employee dev3 = new Employee("郑十", "前端组", 5);

        ceo.addSubordinate(cto);
        ceo.addSubordinate(cfo);
        cto.addSubordinate(techLead1);
        cto.addSubordinate(techLead2);
        techLead1.addSubordinate(dev1);
        techLead2.addSubordinate(dev2);
        techLead2.addSubordinate(dev3);

        // 创建处理器
        RecursiveHandler<Employee> handler = new RecursiveHandler<>(e -> e.subordinates);

        // 1. 深度优先遍历 - 打印汇报关系（后序遍历：先下属后领导）
        System.out.println("【深度优先遍历 - 汇报关系】");
        handler.processDepthFirst(ceo, (current, children) -> {
            String indent = "  ".repeat(10 - current.level);
            if (children.isEmpty()) {
                System.out.println(indent + "👤 " + current.name + " (基层员工)");
            } else {
                String subNames = children.stream().map(e -> e.name).reduce((a, b) -> a + ", " + b).orElse("");
                System.out.println(indent + "👔 " + current.name + " 管理: [" + subNames + "]");
            }
        });

        // 2. 广度优先遍历 - 按层级打印
        System.out.println("\n【广度优先遍历 - 按层级查看】");
        handler.processBreadthFirst(ceo, (current, children) -> {
            String indent = "  ".repeat(10 - current.level);
            System.out.println(indent + "Level " + current.level + ": " + current);
        });

        // 3. 查找第一个符合条件的员工
        System.out.println("\n【查找职级为7的技术负责人】");
        Optional<Employee> firstL7 = handler.findFirst(ceo, e -> e.level == 7);
        firstL7.ifPresent(e -> System.out.println("找到: " + e));

        // 4. 查找所有技术部员工
        System.out.println("\n【查找所有技术部员工】");
        List<Employee> techStaff = handler.findAll(ceo, e -> e.department.contains("技术") || e.department.contains("端"));
        techStaff.forEach(e -> System.out.println("  - " + e));

        // 5. 映射转换 - 转换为树形字符串结构
        System.out.println("\n【映射为树形字符串】");
        String treeStr = handler.map(ceo,
                e -> e.name,  // 映射当前节点
                (e, childNames) -> {  // 组合子节点
                    if (childNames.isEmpty()) return e.name;
                    return e.name + " -> " + childNames;
                }
        );
        System.out.println(treeStr);
    }

    /**
     * 示例2: 文件系统遍历
     */
    static class FileNode {
        String name;
        boolean isDirectory;
        long size;
        List<FileNode> children = new ArrayList<>();

        FileNode(String name, boolean isDirectory, long size) {
            this.name = name;
            this.isDirectory = isDirectory;
            this.size = size;
        }

        void addChild(FileNode child) {
            children.add(child);
        }
    }

    public static void demoFileSystem() {
        System.out.println("\n========== 示例2: 文件系统遍历 ==========\n");

        // 构建文件树
        FileNode root = new FileNode("/", true, 0);
        FileNode projects = new FileNode("projects", true, 0);
        FileNode docs = new FileNode("documents", true, 0);
        FileNode src = new FileNode("src", true, 0);
        FileNode main = new FileNode("Main.java", false, 2048);
        FileNode util = new FileNode("Util.java", false, 1024);
        FileNode readme = new FileNode("README.md", false, 512);
        FileNode resume = new FileNode("resume.pdf", false, 1024);

        root.addChild(projects);
        root.addChild(docs);
        projects.addChild(src);
        src.addChild(main);
        src.addChild(util);
        projects.addChild(readme);
        docs.addChild(resume);

        RecursiveHandler<FileNode> handler = new RecursiveHandler<>(f -> f.children);

        // 计算目录总大小（后序遍历）
        System.out.println("【计算目录大小】");
        handler.processDepthFirst(root, (current, children) -> {
            if (current.isDirectory) {
                long totalSize = children.stream().mapToLong(f -> f.size).sum();
                current.size = totalSize;
                System.out.printf("📁 %s: %d bytes%n", current.name, totalSize);
            } else {
                System.out.printf("📄 %s: %d bytes%n", current.name, current.size);
            }
        });

        // 查找所有Java文件
        System.out.println("\n【查找所有Java文件】");
        List<FileNode> javaFiles = handler.findAll(root, f -> f.name.endsWith(".java"));
        javaFiles.forEach(f -> System.out.println("  ☕ " + f.name + " (" + f.size + " bytes)"));

        // 映射为JSON格式字符串
        System.out.println("\n【映射为JSON格式】");
        String json = handler.map(root,
                f -> String.format("\"name\":\"%s\",\"size\":%d,\"type\":\"%s\"",
                        f.name, f.size, f.isDirectory ? "dir" : "file"),
                (f, childJsons) -> {
                    StringBuilder sb = new StringBuilder();
                    sb.append("{").append(f.isDirectory ?
                            String.format("\"name\":\"%s\",\"type\":\"dir\",\"size\":%d,\"children\":[", f.name, f.size) :
                            String.format("\"name\":\"%s\",\"type\":\"file\",\"size\":%d", f.name, f.size));

                    if (f.isDirectory && !childJsons.isEmpty()) {
                        sb.append(String.join(",", childJsons)).append("]");
                    }
                    sb.append("}");
                    return sb.toString();
                }
        );
        System.out.println(json);
    }

    /**
     * 示例3: 菜单权限树
     */
    static class Menu {
        String id;
        String name;
        String permission;
        boolean enabled;
        List<Menu> children = new ArrayList<>();

        Menu(String id, String name, String permission, boolean enabled) {
            this.id = id;
            this.name = name;
            this.permission = permission;
            this.enabled = enabled;
        }

        void addChild(Menu child) {
            children.add(child);
        }
    }

    public static void demoMenuTree() {
        System.out.println("\n========== 示例3: 菜单权限树 ==========\n");

        // 构建菜单树
        Menu root = new Menu("1", "系统管理", "system:*", true);
        Menu userMgmt = new Menu("2", "用户管理", "user:*", true);
        Menu roleMgmt = new Menu("3", "角色管理", "role:*", true);
        Menu userList = new Menu("4", "用户列表", "user:list", true);
        Menu userAdd = new Menu("5", "新增用户", "user:add", true);
        Menu userDel = new Menu("6", "删除用户", "user:delete", false); // 禁用
        Menu roleList = new Menu("7", "角色列表", "role:list", true);

        root.addChild(userMgmt);
        root.addChild(roleMgmt);
        userMgmt.addChild(userList);
        userMgmt.addChild(userAdd);
        userMgmt.addChild(userDel);
        roleMgmt.addChild(roleList);

        RecursiveHandler<Menu> handler = new RecursiveHandler<>(m -> m.children);

        // 收集所有启用的权限码
        System.out.println("【收集所有启用的权限码】");
        Set<String> permissions = new HashSet<>();
        handler.processBreadthFirst(root, (current, children) -> {
            if (current.enabled) {
                permissions.add(current.permission);
                System.out.println("  ✓ " + current.name + " -> " + current.permission);
            } else {
                System.out.println("  ✗ " + current.name + " (已禁用)");
            }
        });
        System.out.println("权限集合: " + permissions);

        // 映射为前端需要的VO结构
        System.out.println("\n【映射为前端MenuVO】");
        class MenuVO {
            String label;
            String value;
            boolean disabled;
            List<MenuVO> children;
            MenuVO(String l, String v, boolean d) { label=l; value=v; disabled=d; }
            public String toString() {
                return String.format("{label:%s, value:%s, disabled:%s, children:%s}",
                        label, value, disabled, children);
            }
        }

        MenuVO vo = handler.map(root,
                m -> new MenuVO(m.name, m.id, !m.enabled),
                (m, childVOs) -> {
                    MenuVO current = new MenuVO(m.name, m.id, !m.enabled);
                    current.children = childVOs.isEmpty() ? null : childVOs;
                    return current;
                }
        );
        System.out.println(vo);
    }

    // 主方法运行所有示例
    public static void main(String[] args) {
        demoOrganizationTree();
        demoFileSystem();
        demoMenuTree();
    }
}
```

## 运行结果

```console
========== 示例1: 组织架构树 ==========

【深度优先遍历 - 汇报关系】
          👤 周八 (基层员工)
      👔 赵六 管理: [周八]
          👤 吴九 (基层员工)
          👤 郑十 (基层员工)
      👔 孙七 管理: [吴九, 郑十]
  👔 李四 管理: [赵六, 孙七]
  👤 王五 (基层员工)
👔 张三 管理: [李四, 王五]

【广度优先遍历 - 按层级查看】
Level 10: 张三(总裁办, L10)
  Level 9: 李四(技术部, L9)
  Level 9: 王五(财务部, L9)
      Level 7: 赵六(后端组, L7)
      Level 7: 孙七(前端组, L7)
          Level 5: 周八(后端组, L5)
          Level 5: 吴九(前端组, L5)
          Level 5: 郑十(前端组, L5)

【查找职级为7的技术负责人】
找到: 赵六(后端组, L7)

【查找所有技术部员工】
  - 李四(技术部, L9)
  - 赵六(后端组, L7)
  - 周八(后端组, L5)
  - 孙七(前端组, L7)
  - 吴九(前端组, L5)
  - 郑十(前端组, L5)

【映射为树形字符串】
张三 -> [李四 -> [赵六 -> [周八], 孙七 -> [吴九, 郑十]], 王五]

========== 示例2: 文件系统遍历 ==========

【计算目录大小】
📄 Main.java: 2048 bytes
📄 Util.java: 1024 bytes
📁 src: 3072 bytes
📄 README.md: 512 bytes
📁 projects: 3584 bytes
📄 resume.pdf: 1024 bytes
📁 documents: 1024 bytes
📁 /: 4608 bytes

【查找所有Java文件】
  ☕ Main.java (2048 bytes)
  ☕ Util.java (1024 bytes)

【映射为JSON格式】
{"name":"/","type":"dir","size":4608,"children":[{"name":"projects","type":"dir","size":3584,"children":[{"name":"src","type":"dir","size":3072,"children":[{"name":"Main.java","type":"file","size":2048},{"name":"Util.java","type":"file","size":1024}]},{"name":"README.md","type":"file","size":512}]},{"name":"documents","type":"dir","size":1024,"children":[{"name":"resume.pdf","type":"file","size":1024}]}]}

========== 示例3: 菜单权限树 ==========

【收集所有启用的权限码】
  ✓ 系统管理 -> system:*
  ✓ 用户管理 -> user:*
  ✓ 角色管理 -> role:*
  ✓ 用户列表 -> user:list
  ✓ 新增用户 -> user:add
  ✗ 删除用户 (已禁用)
  ✓ 角色列表 -> role:list
权限集合: [user:*, role:*, user:list, user:add, system:*, role:list]

【映射为前端MenuVO】
{label:系统管理, value:1, disabled:false, children:[{label:用户管理, value:2, disabled:false, children:[{label:用户列表, value:4, disabled:false, children:null}, {label:新增用户, value:5, disabled:false, children:null}, {label:删除用户, value:6, disabled:true, children:null}]}, {label:角色管理, value:3, disabled:false, children:[{label:角色列表, value:7, disabled:false, children:null}]}]}

```