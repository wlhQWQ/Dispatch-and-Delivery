package com.flagcamp.dispatchanddelivery.config;

import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(new MailboxWsHandler(), "/ws")
                .setAllowedOrigins("http://localhost:3000");
        // 如果你想更“无脑放开”（开发期），可以改成：
        // .setAllowedOriginPatterns("*");
    }
}
