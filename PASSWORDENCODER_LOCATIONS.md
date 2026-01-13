# PasswordEncoder Locations in Main Branch

This document lists all locations where `PasswordEncoder` is used in the dispatchanddelivery repository.

## Summary

`PasswordEncoder` is found in **2 files** in the backend Java codebase:

## 1. Configuration File - RedisConfig.java

**File Path:** `backend/Dispatch-and-Delivery/src/main/java/com/flagcamp/dispatchanddelivery/config/RedisConfig.java`

**Lines:** 7-8, 13-15

**Purpose:** Bean definition and imports

**Details:**
- **Line 7:** Import statement for `PasswordEncoderFactories`
- **Line 8:** Import statement for `PasswordEncoder`
- **Lines 13-15:** Bean definition method that creates a `PasswordEncoder` bean using `PasswordEncoderFactories.createDelegatingPasswordEncoder()`

**Code:**
```java
@Bean
PasswordEncoder passwordEncoder() {
    return PasswordEncoderFactories.createDelegatingPasswordEncoder();
}
```

## 2. Service File - UserService.java

**File Path:** `backend/Dispatch-and-Delivery/src/main/java/com/flagcamp/dispatchanddelivery/service/UserService.java`

**Lines:** 7, 15, 20, 24, 39

**Purpose:** User authentication and password encoding

**Details:**
- **Line 7:** Import statement for `PasswordEncoder`
- **Line 15:** Private field declaration for `passwordEncoder`
- **Line 20:** Constructor parameter for dependency injection
- **Line 24:** Field initialization in constructor
- **Line 39:** Usage to encode password during user signup: `passwordEncoder.encode(password)`

**Code:**
```java
private final PasswordEncoder passwordEncoder;

public UserService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        UserDetailsManager userDetailsManager
) {
    this.userRepository = userRepository;
    this.passwordEncoder = passwordEncoder;
    this.userDetailsManager = userDetailsManager;
}

// Usage in signUp method:
.password(passwordEncoder.encode(password))
```

## Usage Pattern

The application follows the standard Spring Security pattern:
1. **RedisConfig** defines a `@Bean` that creates the `PasswordEncoder` instance
2. **UserService** injects this bean via constructor dependency injection
3. **UserService** uses the encoder to hash passwords during user registration (signup)

## Implementation Details

- **Type:** `DelegatingPasswordEncoder` (created by `PasswordEncoderFactories`)
- **Framework:** Spring Security
- **Primary Use Case:** Encoding user passwords during registration
- **Location:** Backend Java application only (not found in frontend)
