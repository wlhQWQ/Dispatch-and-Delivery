package com.flagcamp.dispatchanddelivery.config;

import org.springframework.context.annotation.Configuration;

/**
 * User configuration
 * 
 * Note: We now use CustomUserDetailsService instead of JdbcUserDetailsManager
 * to have full control over UserDetails and include userId in the session
 */
@Configuration
public class UserConfig {
    
    // The old JdbcUserDetailsManager bean has been replaced by CustomUserDetailsService
    // CustomUserDetailsService loads user data including userId from the database
    // and stores it in the Redis session for easy access
    
}
