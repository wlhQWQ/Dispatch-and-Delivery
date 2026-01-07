package com.flagcamp.dispatchanddelivery.service;

import com.flagcamp.dispatchanddelivery.entity.UserEntity;
import com.flagcamp.dispatchanddelivery.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserDetailsManager userDetailsManager;

    public UserService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            UserDetailsManager userDetailsManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userDetailsManager = userDetailsManager;
    }

    @Transactional
    public void signUp(String email, String password) {
        email = email.toLowerCase();

        // Check if the user already exists in the system
        if (userDetailsManager.userExists(email)) {
            throw new IllegalStateException("User already exists");
        }

        UserDetails user = User.builder()
                .username(email)
                .password(passwordEncoder.encode(password))
                .roles("USER")
                .build();
        userDetailsManager.createUser(user);

//        UserEntity savedUser = userRepository.findByEmail(email);
    }

    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }
}
