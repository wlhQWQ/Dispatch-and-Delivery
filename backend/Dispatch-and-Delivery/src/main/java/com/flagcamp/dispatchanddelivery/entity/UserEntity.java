package com.flagcamp.dispatchanddelivery.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("users")
public record UserEntity(
        @Id Long id,
        String email,
        String password,
        boolean enabled
) {
}
