package com.flagcamp.dispatchanddelivery.service;

import com.flagcamp.dispatchanddelivery.entity.UserEntity;
import com.flagcamp.dispatchanddelivery.repository.UserRepository;
import com.flagcamp.dispatchanddelivery.security.CustomUserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Custom UserDetailsService that loads user from database
 * and includes userId in the UserDetails object
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UserRepository userRepository;
    
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Query user from database (including the id field)
        UserEntity user = userRepository.findByEmail(email.toLowerCase());
        
        if (user == null) {
            throw new UsernameNotFoundException("User not found with email: " + email);
        }
        
        // Create authorities (roles)
        List<GrantedAuthority> authorities = List.of(
            new SimpleGrantedAuthority("ROLE_USER")
        );
        
        // Return CustomUserDetails with userId included
        // This userId will be stored in the Redis session
        return new CustomUserDetails(
            user.id(),          // userId will be available in session
            user.email(),
            user.password(),
            user.enabled(),
            authorities
        );
    }
}
