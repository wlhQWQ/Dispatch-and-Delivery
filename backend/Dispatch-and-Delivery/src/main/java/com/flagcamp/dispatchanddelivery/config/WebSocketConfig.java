package com.flagcamp.dispatchanddelivery.config;

import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    private final MailboxWsHandler mailboxWsHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(mailboxWsHandler, "/ws")
                .setAllowedOriginPatterns("*");  // 允许所有来源（开发环境）
    }
}
