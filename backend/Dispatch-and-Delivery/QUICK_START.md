# 快速启动指南

使用旧金山示例数据快速启动应用程序！

## 🚀 一键启动（推荐）

**Windows/macOS/Linux 通用命令：**

```bash
npm run dev
```

此命令会自动：

1. ✅ 检查 Docker 并启动 PostgreSQL 和 Redis 容器
2. ✅ 启动 Spring Boot 后端（端口 8080）
3. ✅ 启动 React 前端（端口 5173）
4. ✅ 在 PostgreSQL 中初始化 12 个示例订单
5. ✅ 在 Redis 中初始化 12 个示例路由

**首次设置：**

Windows：

```powershell
# 安装前端依赖
cd frontend
npm install
cd ..

# 然后运行
npm run dev
```

macOS/Linux：

```bash
# 安装前端依赖
cd frontend
npm install
cd ..

# 然后运行
npm run dev
```

---

## 📋 手动设置（分步说明）

### 步骤 1：启动数据库

**Windows PowerShell：**

```powershell
# 启动 PostgreSQL
docker run --name postgres-dispatch `
  -e POSTGRES_DB=dispatch_delivery `
  -e POSTGRES_USER=user `
  -e POSTGRES_PASSWORD=password `
  -p 5432:5432 `
  -d postgres:latest

# 启动 Redis
docker run --name redis-dispatch `
  -p 6379:6379 `
  -d redis:latest

# 验证容器运行状态
docker ps
```

**macOS/Linux：**

```bash
# 启动 PostgreSQL
docker run --name postgres-dispatch \
  -e POSTGRES_DB=dispatch_delivery \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:latest

# 启动 Redis
docker run --name redis-dispatch \
  -p 6379:6379 \
  -d redis:latest

# 验证容器运行状态
docker ps
```

### 步骤 2：构建并运行应用程序

**Windows：**

```powershell
# 进入后端目录
cd backend/Dispatch-and-Delivery

# 构建应用程序（下载依赖）
.\gradlew.bat build

# 运行应用程序
.\gradlew.bat bootRun
```

**macOS/Linux：**

```bash
# 进入后端目录
cd backend/Dispatch-and-Delivery

# 构建应用程序（下载依赖）
./gradlew build

# 运行应用程序
./gradlew bootRun
```

**启动时会发生什么：**

- ✅ 在 PostgreSQL 中创建 `orders` 表
- ✅ 从 `data.sql` 加载 12 个示例订单
- ✅ 计算并将 12 个示例路由加载到 Redis
- ✅ 所有数据使用真实的旧金山地点！

你应该看到：

```
Redis initialization complete. Created 12 routes.
Started DispatchAndDeliveryApplication in X.XXX seconds
```

## 步骤 3：查看数据

### 方式 A：使用图形界面工具（推荐）

**PostgreSQL (pgAdmin)：**

Windows/macOS/Linux：

```bash
docker run -p 5050:80 \
  -e PGADMIN_DEFAULT_EMAIL=admin@admin.com \
  -e PGADMIN_DEFAULT_PASSWORD=admin \
  -d dpage/pgadmin4
```

然后打开：http://localhost:5050

**Redis (RedisInsight)：**

Windows/macOS/Linux：

```bash
docker run -d --name redisinsight \
  -p 5540:5540 \
  redis/redisinsight:latest
```

然后打开：http://localhost:5540

### 方式 B：使用命令行

**PostgreSQL：**

Windows/macOS/Linux：

```bash
docker exec -it postgres-dispatch psql -U user -d dispatch_delivery

# 查看订单
SELECT id, from_address, to_address, status, price FROM orders;

# 按状态统计
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

**Redis：**

Windows/macOS/Linux：

```bash
docker exec -it redis-dispatch redis-cli

# 查看所有路由键
KEYS routes:*

# 查看特定路由
HGETALL routes:ROUTE-001

# 统计路由数量
DBSIZE
```

## 验证一切正常

### 测试 PostgreSQL 订单

Windows/macOS/Linux：

```bash
# 连接到 PostgreSQL
docker exec -it postgres-dispatch psql -U user -d dispatch_delivery

# 查询
SELECT id, from_address, to_address, status FROM orders WHERE status = 'pending';
```

预期结果：3 个订单（ORD-003, ORD-005, ORD-010）

### 测试 Redis 路由

Windows/macOS/Linux：

```bash
# 连接到 Redis
docker exec -it redis-dispatch redis-cli

# 查询
HGETALL routes:ROUTE-001
```

预期结果：Ferry Building → Golden Gate Bridge 路由的详细信息

## 示例数据概览

✅ **12 个订单** 在 PostgreSQL（orders 表）  
✅ **12 条路由** 在 Redis（routes:\* 键）  
✅ **真实的旧金山地点**：Ferry Building、Golden Gate Bridge、Union Square、Fisherman's Wharf 等！  
✅ **真实坐标**：用于地图显示的准确经纬度

## 下一步

1. **探索数据**：查看 `SAMPLE_DATA.md` 了解详细信息
2. **数据库设置**：阅读 `DATABASE_SETUP.md` 进行高级配置
3. **构建 API**：创建控制器以通过 REST 端点公开数据
4. **连接前端**：使用坐标在地图上显示

## 🛠️ NPM 命令参考

项目根目录下所有可用的 npm 命令：

Windows/macOS/Linux：

```bash
# 获取帮助
npm run info             # 显示所有可用命令

# 开发
npm run dev              # 启动所有服务（Docker + 后端 + 前端）
npm run dev:backend      # 仅启动后端
npm run dev:frontend     # 仅启动前端

# Docker 管理
npm run docker:start     # 启动 Docker 容器（智能 - 如果已运行则不重建）
npm run docker:stop      # 停止 Docker 容器
npm run docker:restart   # 重启 Docker 容器
npm run docker:status    # 检查容器状态
npm run docker:logs      # 查看所有容器日志
npm run docker:remove    # 删除容器（谨慎使用）

# 验证
npm run verify           # 验证 PostgreSQL 和 Redis 数据
npm run verify:all       # 详细的全面验证
npm run verify:postgres  # 检查 PostgreSQL 订单
npm run verify:redis     # 检查 Redis 路由

# 日志
npm run logs:postgres    # 查看 PostgreSQL 日志（最后 50 行）
npm run logs:redis       # 查看 Redis 日志（最后 50 行）
npm run logs:backend     # 后端日志在终端中
npm run docker:logs      # 同时查看所有日志

# 设置和安装
npm run setup            # 安装前端依赖并设置 Docker
npm run setup:install    # 仅安装前端依赖
npm run setup:docker     # 仅设置 Docker 容器

# 清理和重置
npm run clean            # 停止并删除所有容器
npm run reset            # 清理所有内容并重新开始
```

### 快速命令示例：

Windows/macOS/Linux：

```bash
# 首次设置
npm run setup            # 安装依赖并设置 Docker
npm run dev              # 启动所有服务

# 日常开发
npm run dev              # 只需运行这个 - 它处理一切！

# 检查是否一切正常
npm run verify:all       # 全面检查

# 需要重新开始？
npm run reset            # 清空一切并重启

# 遇到问题？检查日志
npm run docker:logs      # 查看所有日志
npm run docker:status    # 检查运行状态
```

## 问题排查

### "连接被拒绝" 错误

**使用 npm：**

Windows/macOS/Linux：

```bash
npm run docker:status
```

**手动检查：**

Windows/macOS/Linux：

```bash
docker ps --filter name=dispatch
```

应该显示 postgres-dispatch 和 redis-dispatch 两个容器。

### "表 orders 不存在"

**检查架构是否已加载：**

Windows/macOS/Linux：

```bash
docker exec -it postgres-dispatch psql -U user -d dispatch_delivery -c "\dt"
```

或使用 npm：

Windows/macOS/Linux：

```bash
npm run verify:postgres
```

如果未加载，重启后端 - Spring Boot 将自动初始化。

### Redis 中没有路由

**检查路由：**

Windows/macOS/Linux：

```bash
npm run verify:redis
```

**如果为空，重启应用程序：**

Windows/macOS/Linux：

```bash
npm run dev:backend
```

RedisDataInitializer 将在启动时自动加载路由。

### 清空重启（重置所有内容）

**使用 npm（推荐）：**

Windows/macOS/Linux：

```bash
npm run clean
npm run dev
```

**手动操作：**

Windows/macOS/Linux：

```bash
# 停止并删除容器
docker stop postgres-dispatch redis-dispatch
docker rm postgres-dispatch redis-dispatch

# 然后重启
npm run dev
```

### 后端无法启动 - "端口 8080 已被使用"

检查什么在使用该端口：

Windows：

```powershell
netstat -ano | findstr :8080
```

macOS/Linux：

```bash
lsof -i :8080
# 或
netstat -an | grep 8080
```

终止该进程或在 `backend/Dispatch-and-Delivery/src/main/resources/application.yml` 中更改端口

### 前端无法启动 - "端口 5173 已被使用"

Vite 将自动尝试下一个可用端口（5174, 5175 等）
