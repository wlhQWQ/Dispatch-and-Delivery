package com.flagcamp.dispatchanddelivery.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;

@Configuration
@EnableRedisRepositories(basePackages = "com.flagcamp.dispatchanddelivery.repository")
public class RedisConfig {
    // Spring Data Redis will auto-configure the necessary beans
    // RedisTemplate and other beans are provided by Spring Boot auto-configuration
    
    // Note: RouteRepository is a Redis repository (RouteEntity has @RedisHash)
    // Other repositories (Order, Hub, Robot) are JPA repositories for PostgreSQL
}

