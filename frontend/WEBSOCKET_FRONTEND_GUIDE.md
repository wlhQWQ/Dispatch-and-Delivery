# 前端 WebSocket 连接指南

## 更新说明

WebSocket 连接现在需要在 URL 中传递 `userId` 参数。这是为了实现用户消息隔离，确保每个用户只收到属于自己的消息。

## 主要变化

### ✅ 已完成的更新

1. **MailboxContext.jsx** - WebSocket 连接已更新
   - 自动从 `localStorage` 读取 `userId`
   - 在连接 URL 中添加 `userId` 参数
   - 处理连接被拒绝的情况（缺少 userId 时）
   - 增强的错误处理和日志

### 📝 连接方式

```javascript
// 旧的连接方式（已废弃）
const ws = new WebSocket("ws://localhost:8000/ws");

// 新的连接方式（必需）
const userId = localStorage.getItem("userId") || "user-guest";
const ws = new WebSocket(`ws://localhost:8000/ws?userId=${userId}`);
```

## 如何使用

### 1. 确保设置了 userId

在用户登录后，需要将 `userId` 保存到 localStorage：

```javascript
// 登录成功后
localStorage.setItem("userId", user.id);

// 例如在 Login.jsx 中
const handleLogin = async (credentials) => {
  const user = await loginApi(credentials);
  localStorage.setItem("userId", user.id);
  // ... 其他登录逻辑
};
```

### 2. 使用 MailboxContext

```javascript
import { useMailbox } from "../contexts/MailboxContext";

function YourComponent() {
  const { messages, wsStatus, unreadCount, markRead, confirmAction } =
    useMailbox();

  return (
    <div>
      <div>Status: {wsStatus}</div>
      <div>Unread: {unreadCount}</div>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
    </div>
  );
}
```

### 3. WebSocket 状态

`wsStatus` 有三种状态：

- `"connecting"` - 正在连接
- `"connected"` - 已连接
- `"disconnected"` - 已断开

```javascript
const { wsStatus } = useMailbox();

// 显示连接状态
{
  wsStatus === "connected" && <Badge variant="success">✅ Online</Badge>;
}
{
  wsStatus === "connecting" && (
    <Badge variant="warning">⏳ Connecting...</Badge>
  );
}
{
  wsStatus === "disconnected" && <Badge variant="danger">❌ Offline</Badge>;
}
```

## 消息格式

### 后端发送的消息格式

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "subject": "Robot arrived at pickup",
  "content": "Please confirm pickup to continue.",
  "type": "ARRIVED",
  "orderId": "ORD-001",
  "actionRequired": "PICKUP",
  "time": "2025-01-08T10:30:00Z",
  "read": false
}
```

### 前端规范化后的格式

`normalizeMessage()` 函数会将各种后端格式转换为统一的前端格式：

```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  subject: "Robot arrived at pickup",
  content: "Please confirm pickup to continue.",
  timestamp: Date object,
  read: false,
  type: "ARRIVED",
  orderId: "ORD-001",
  actionRequired: "pickup" // 小写，"pickup" | "delivery" | null
}
```

## API 调用

### 获取历史消息

```javascript
import { fetchMailboxMessages } from "../api/mailboxApi";

const messages = await fetchMailboxMessages();
// 自动从localStorage读取userId并传递给后端
```

### 确认消息操作

```javascript
import { confirmMailboxAction } from "../api/mailboxApi";

await confirmMailboxAction({
  messageId: message.id,
  orderId: message.orderId,
  action: "PICKUP", // "PICKUP" | "DELIVERY" | "ACK"
});
```

## 错误处理

### 连接被拒绝

如果 WebSocket 连接立即关闭（错误代码 1008），说明缺少 userId：

```javascript
ws.onclose = (evt) => {
  if (evt.code === 1008) {
    console.error("Connection rejected: userId is required");
    toast.error("User authentication required");
    // 不会自动重连，需要用户重新登录
    return;
  }
};
```

### 自动重连

`MailboxContext` 实现了指数退避的自动重连策略：

- 第 1 次重连：800ms 后
- 第 2 次重连：1.6s 后
- 第 3 次重连：3.2s 后
- ...
- 最大延迟：10s

## 开发测试

### 1. 测试不同用户

在浏览器控制台中切换用户：

```javascript
// 切换到 user-alice
localStorage.setItem("userId", "user-alice");
location.reload();

// 切换到 user-bob
localStorage.setItem("userId", "user-bob");
location.reload();
```

### 2. 手动发送测试消息

使用开发 API 向特定用户发送测试消息：

```bash
# 向 user-alice 发送消息
curl -X POST "http://localhost:8000/dev/ws/send?userId=user-alice" \
  -H "Content-Type: application/json" \
  -d '{
    "id": 999,
    "subject": "Test Message",
    "content": "This is a test",
    "type": "INFO",
    "actionRequired": "PICKUP"
  }'
```

### 3. 检查 WebSocket 状态

```bash
# 查看在线用户数
curl "http://localhost:8000/dev/ws/status"

# 检查特定用户是否在线
curl "http://localhost:8000/dev/ws/check?userId=user-alice"
```

### 4. 浏览器控制台测试

```javascript
// 查看当前连接状态
const ws = window._ws; // 如果你在MailboxContext中暴露了ws引用

// 查看当前userId
console.log("Current userId:", localStorage.getItem("userId"));

// 清除所有消息（测试用）
localStorage.removeItem("mailboxMessages");
```

## 多标签页支持

同一用户在多个浏览器标签页中打开应用时，每个标签页都会建立独立的 WebSocket 连接。当后端推送消息时，所有标签页都会同时收到。

这是预期行为，无需担心。

## 常见问题

### Q: 为什么连接立即断开？

**A:** 检查是否设置了 userId：

```javascript
console.log("UserId:", localStorage.getItem("userId"));
```

### Q: 收不到消息？

**A:** 检查清单：

1. WebSocket 状态是否为 `"connected"`
2. 浏览器控制台是否有错误
3. userId 是否正确
4. 后端是否真的向该 userId 发送了消息

### Q: 能收到其他用户的消息？

**A:** 这不应该发生！如果发生了：

1. 检查 localStorage 中的 userId 是否正确
2. 查看浏览器 Network 标签中 WebSocket 的连接 URL
3. 检查后端日志

### Q: 如何实现消息通知？

**A:** `MailboxContext` 已经集成了 `toast.info()`：

```javascript
// 在 MailboxContext.jsx 中
ws.onmessage = (evt) => {
  const msg = normalizeMessage(payload);
  setMessages((prev) => [msg, ...prev]);

  // 自动显示通知
  toast.info(msg.subject);
};
```

如需自定义通知，修改此处即可。

### Q: 如何在登出时断开 WebSocket？

**A:** WebSocket 会在组件卸载时自动清理。如需手动断开：

```javascript
// 在 MailboxContext 中暴露 disconnect 方法
export function MailboxProvider({ children }) {
  // ... existing code ...

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
  }, []);

  const value = useMemo(
    () => ({
      messages,
      markRead,
      confirmAction,
      unreadCount,
      wsStatus,
      disconnect, // 添加这个
    }),
    [messages, unreadCount, wsStatus, disconnect]
  );
}

// 在登出逻辑中使用
const { disconnect } = useMailbox();

const handleLogout = () => {
  disconnect();
  localStorage.removeItem("userId");
  navigate("/login");
};
```

## 性能优化

### 1. 消息去重

`MailboxContext` 已实现消息去重：

```javascript
setMessages((prev) => {
  const next = [msg, ...prev];
  const seen = new Set();
  const dedup = [];
  for (const m of next) {
    const key = `${m.id}`;
    if (!seen.has(key)) {
      seen.add(key);
      dedup.push(m);
    }
  }
  return dedup.sort((a, b) => b.timestamp - a.timestamp);
});
```

### 2. 消息数量限制

如需限制内存中的消息数量：

```javascript
// 在去重后添加
return dedup.sort((a, b) => b.timestamp - a.timestamp).slice(0, 100); // 只保留最新100条
```

### 3. 消息持久化

如需在刷新页面后保留消息：

```javascript
// 保存到 localStorage
useEffect(() => {
  localStorage.setItem("mailboxMessages", JSON.stringify(messages));
}, [messages]);

// 初始化时恢复
const [messages, setMessages] = useState(() => {
  const saved = localStorage.getItem("mailboxMessages");
  return saved ? JSON.parse(saved) : [];
});
```

## 安全注意事项

1. **userId 验证**: 当前只检查 userId 是否存在，未验证真实性
2. **生产环境**: 应使用 JWT token 等机制验证用户身份
3. **HTTPS/WSS**: 生产环境应使用 `wss://` 而非 `ws://`

```javascript
// 生产环境配置示例
const WS_PROTOCOL = window.location.protocol === "https:" ? "wss:" : "ws:";
const WS_HOST = process.env.REACT_APP_WS_HOST || window.location.host;
const WS_URL = `${WS_PROTOCOL}//${WS_HOST}/ws`;
```

## 相关文件

- `frontend/src/contexts/MailboxContext.jsx` - WebSocket 连接和消息管理
- `frontend/src/api/mailboxApi.js` - REST API 调用
- `frontend/src/components/Mailbox.jsx` - 消息列表 UI
- `frontend/src/constants.js` - 配置常量

## 后端文档

详细的后端 WebSocket 实现文档请参考：

- `backend/Dispatch-and-Delivery/WEBSOCKET_USAGE.md`
