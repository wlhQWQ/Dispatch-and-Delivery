package com.flagcamp.dispatchanddelivery.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.data.redis.repository.configuration.EnableRedisRepositories;


@Configuration
@EnableRedisRepositories(basePackages = "com.flagcamp.dispatchanddelivery.repository")
public class RedisConfig {
    @Bean
    PasswordEncoder passwordEncoder() {
        return PasswordEncoderFactories.createDelegatingPasswordEncoder();
    }

    // clean previous session IDs
    @Bean
    public CommandLineRunner clearRedis(RedisConnectionFactory factory) {
        return args -> {
            System.out.println("Cleaning Redis session data...");
            factory.getConnection().serverCommands().flushAll();
        };
    }
}


