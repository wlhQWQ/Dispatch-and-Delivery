package com.flagcamp.dispatchanddelivery.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

/**
 * Custom UserDetails implementation that includes userId (UUID string)
 * This allows us to store and retrieve userId from the session
 */
public class CustomUserDetails implements UserDetails {
    
    private final String userId;
    private final String email;
    private final String password;
    private final boolean enabled;
    private final Collection<? extends GrantedAuthority> authorities;
    
    public CustomUserDetails(String userId, String email, String password, 
                            boolean enabled, Collection<? extends GrantedAuthority> authorities) {
        this.userId = userId;
        this.email = email;
        this.password = password;
        this.enabled = enabled;
        this.authorities = authorities;
    }
    
    /**
     * Get the user's database ID (UUID string)
     * This is stored in the session after login
     */
    public String getUserId() {
        return userId;
    }
    
    @Override
    public String getUsername() {
        return email;
    }
    
    @Override
    public String getPassword() {
        return password;
    }
    
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }
    
    @Override
    public boolean isEnabled() {
        return enabled;
    }
    
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }
    
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }
    
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }
}
