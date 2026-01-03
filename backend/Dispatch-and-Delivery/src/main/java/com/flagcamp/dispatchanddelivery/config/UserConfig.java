package com.flagcamp.dispatchanddelivery.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;

import javax.sql.DataSource;

@Configuration
public class UserConfig {
    @Bean
    UserDetailsManager users(DataSource dataSource) {
        JdbcUserDetailsManager userDetailsManager = new JdbcUserDetailsManager(dataSource);

        userDetailsManager.setCreateUserSql("INSERT INTO users (email, password, enabled) VALUES (?,?,?)");

        userDetailsManager.setCreateAuthoritySql("INSERT INTO authorities (email, authority) VALUES (?,?)");

        userDetailsManager.setUsersByUsernameQuery("SELECT email, password, enabled FROM users WHERE email = ?");

        userDetailsManager.setAuthoritiesByUsernameQuery("SELECT email, authority FROM authorities WHERE email = ?");

        userDetailsManager.setUserExistsSql("SELECT count(*) FROM users WHERE email = ?"); // spring expects an integer (1 or 0)

        return userDetailsManager;
    }
}
