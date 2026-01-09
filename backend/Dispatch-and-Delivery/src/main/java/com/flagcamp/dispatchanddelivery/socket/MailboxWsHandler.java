package com.flagcamp.dispatchanddelivery.socket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MailboxWsHandler extends TextWebSocketHandler {

    private static final Map<String, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private static final Map<WebSocketSession, String> sessionUserMap = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        // 从URL获取userId: ws://localhost:8080/ws?userId=user-alice
        String query = session.getUri().getQuery();
        if (query != null && query.startsWith("userId=")) {
            String userId = query.substring(7); // 去掉 "userId="
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
            sessionUserMap.put(session, userId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = sessionUserMap.remove(session);
        if (userId != null) {
            Set<WebSocketSession> userSet = userSessions.get(userId);
            if (userSet != null) {
                userSet.remove(session);
                if (userSet.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
        }
    }

    // 向特定用户发送消息
    public static void broadcastToUser(String userId, String json) {
        Set<WebSocketSession> userSet = userSessions.get(userId);
        if (userSet != null) {
            for (WebSocketSession s : userSet) {
                if (s.isOpen()) {
                    try {
                        s.sendMessage(new TextMessage(json));
                    } catch (Exception ignored) {
                    }
                }
            }
        }
    }

    // 你们后端任何地方都可以调用这个方法推送消息给前端
    public static void broadcast(String json) {
        for (Set<WebSocketSession> userSet : userSessions.values()) {
            for (WebSocketSession s : userSet) {
                try {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(json));
                    }
                } catch (Exception ignored) {
                }
            }
        }
    }
}
