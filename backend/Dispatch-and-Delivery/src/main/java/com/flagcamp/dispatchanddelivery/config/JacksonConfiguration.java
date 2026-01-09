package com.flagcamp.dispatchanddelivery.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Jackson 配置类
 * 配置 ObjectMapper 以支持 Java 8 时间类型（Instant, LocalDateTime 等）的序列化
 */
@Configuration
public class JacksonConfiguration {
    
    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        
        // 在jackson中注册 Java 8 时间模块，支持 Instant, LocalDateTime, ZonedDateTime
        // 否则json转化时jackson会报错
        mapper.registerModule(new JavaTimeModule());
        
        // 禁用将日期序列化为时间戳，使用 ISO-8601 格式字符串代替
        // 例如: "2026-01-08T12:34:56.789Z" 而不是 1704715696789
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        
        return mapper;
    }
}
