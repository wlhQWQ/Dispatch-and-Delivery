# 项目设置清单

配送调度系统（Dispatch and Delivery）完整设置指南

## 前置要求

- [ ] 已安装 Docker
- [ ] 已安装 Node.js (推荐 v18+)
- [ ] 已安装 Java 17+
- [ ] 已获取 Google Maps API Key

## 一、环境配置

### 1. 配置 Google Maps API Key

在 Google Cloud Console 完成以下操作：

- [ ] 创建或选择项目
- [ ] 启用 Directions API
- [ ] 创建 API Key

**方法一：配置环境变量**

Windows PowerShell：

```powershell
$env:GOOGLE_MAP_API_KEY="你的API密钥"
```

macOS/Linux：

```bash
export GOOGLE_MAP_API_KEY="你的API密钥"
```

**方法二：配置 .env 文件（推荐）**

在项目根目录下（backend/frontend 同一层）创建 `.env` 文件：

```
VITE_GOOGLE_MAP_API_KEY="你的API密钥"
GOOGLE_MAP_API_KEY="你的API密钥"
```

注意：

- 不要有额外空格
- 如果无法识别可能需要在 `DispatchAndDeliveryApplication.java` 里的 dotenv 去掉 `.directory("../../")`

### 2. 安装前端依赖

Windows：

```powershell
cd frontend
npm install
cd ..
```

macOS/Linux：

```bash
cd frontend
npm install
cd ..
```

## 二、启动项目（快速方式）

### 一键启动（推荐）

Windows/macOS/Linux：

```bash
npm run dev
```

此命令会自动：

- 启动 PostgreSQL 和 Redis 容器
- 启动后端服务（端口 8080）
- 启动前端服务（端口 5173）
- 初始化示例数据（12 个订单和路由）

**注意**：Windows 用户如果遇到问题，可能需要修改 `package.json` 中的 `dev:backend` 脚本，将 `gradlew.bat` 改为 `.\gradlew.bat`

## 三、手动启动（可选）

### 1. 启动数据库容器

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

# 检查容器状态
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

# 检查容器状态
docker ps
```

### 2. 启动后端

Windows：

```powershell
cd backend/Dispatch-and-Delivery
.\gradlew.bat bootRun
```

macOS/Linux：

```bash
cd backend/Dispatch-and-Delivery
./gradlew bootRun
```

应该看到：

```
Redis initialization complete. Created 12 routes.
Started DispatchAndDeliveryApplication in X.XXX seconds
```

### 3. 启动前端

Windows/macOS/Linux：

```bash
cd frontend
npm run dev
```

访问：http://localhost:5173

## 四、验证安装

### 检查数据库

Windows/macOS/Linux：

```bash
# 使用 npm 命令验证
npm run verify:all

# 或单独验证
npm run verify:postgres
npm run verify:redis
```

### 检查 PostgreSQL 订单数据

Windows/macOS/Linux：

```bash
docker exec postgres-dispatch psql -U user -d dispatch_delivery -c "SELECT id, status, from_address FROM orders LIMIT 5;"
```

应该看到 12 个订单记录。

### 检查 Redis 路由数据

Windows/macOS/Linux：

```bash
docker exec redis-dispatch redis-cli KEYS "routes:*"
```

应该看到 12 个路由键。

## 五、常用命令

### 开发命令

Windows/macOS/Linux：

```bash
npm run dev              # 启动完整项目
npm run dev:backend      # 仅启动后端
npm run dev:frontend     # 仅启动前端
```

### Docker 管理

Windows/macOS/Linux：

```bash
npm run docker:status    # 查看容器状态
npm run docker:logs      # 查看容器日志
npm run docker:stop      # 停止容器
npm run docker:restart   # 重启容器
```

### 数据验证

Windows/macOS/Linux：

```bash
npm run verify           # 验证数据
npm run verify:postgres  # 验证 PostgreSQL
npm run verify:redis     # 验证 Redis
```

### 清理和重置

Windows/macOS/Linux：

```bash
npm run clean            # 停止并删除容器
npm run reset            # 清理并重新启动
```

## 六、问题排查

### 问题：端口被占用

**8080 端口被占用：**

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

停止占用端口的进程或修改后端配置文件中的端口。

**5173 端口被占用：**
前端 Vite 会自动使用下一个可用端口（5174, 5175 等）。

### 问题：数据库连接失败

检查 Docker 容器状态：

Windows/macOS/Linux：

```bash
npm run docker:status
```

如果容器未运行：

Windows/macOS/Linux：

```bash
npm run docker:start
```

### 问题：订单表不存在

重启后端服务，Spring Boot 会自动创建表并加载数据：

Windows/macOS/Linux：

```bash
npm run dev:backend
```

### 问题：Redis 中没有路由数据

重启后端，系统会在启动时自动初始化 Redis 数据：

Windows/macOS/Linux：

```bash
npm run dev:backend
```

### 问题：Google Maps API 错误

- [ ] 检查环境变量是否正确设置
- [ ] 确认 API Key 已启用 Directions API
- [ ] 检查 API Key 是否有使用限制
- [ ] 等待 1-2 分钟让 API 激活

### 完全重置（清空所有数据）

Windows/macOS/Linux：

```bash
npm run clean      # 删除所有容器
npm run dev        # 重新启动
```

## 七、项目结构

```
├── backend/Dispatch-and-Delivery/   # Spring Boot 后端
│   ├── src/main/java/              # Java 源代码
│   ├── src/main/resources/         # 配置文件
│   │   ├── application.yml         # 主配置
│   │   ├── schema.sql             # 数据库结构
│   │   └── data.sql               # 示例数据
│   └── build.gradle               # 构建配置
├── frontend/                       # React 前端
│   ├── src/                       # 前端源代码
│   ├── package.json               # 前端依赖
│   └── vite.config.ts            # Vite 配置
└── package.json                   # 项目根配置
```

## 八、系统功能

### 后端功能

- 订单管理（创建、查询、更新）
- 机器人调度
- 路由计算（Google Maps API）
- WebSocket 实时通信
- 用户认证和会话管理

### 前端功能

- 订单管理界面
- 实时包裹追踪
- 地图可视化
- 管理员面板
- 电子邮箱功能

### 数据存储

- PostgreSQL：订单、用户、机器人数据
- Redis：路由缓存、会话存储

## 九、默认配置

### 数据库连接

- PostgreSQL：localhost:5432
- 数据库名：dispatch_delivery
- 用户名：user
- 密码：password

### Redis 连接

- 主机：localhost
- 端口：6379

### 服务端口

- 后端：http://localhost:8080
- 前端：http://localhost:5173

## 十、完成检查

设置完成后，确认以下项目：

- [ ] PostgreSQL 容器运行正常
- [ ] Redis 容器运行正常
- [ ] 后端服务启动成功
- [ ] 前端服务启动成功
- [ ] 数据库有 12 条订单记录
- [ ] Redis 有 12 条路由记录
- [ ] Google Maps API 配置正确
- [ ] 可以访问前端页面

## 参考文档

- QUICK_START.md - 快速启动指南
