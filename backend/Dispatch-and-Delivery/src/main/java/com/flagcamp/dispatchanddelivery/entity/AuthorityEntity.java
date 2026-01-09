package com.flagcamp.dispatchanddelivery.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("authorities")
public record AuthorityEntity(
        @Id Long id,
        String email,
        String authority
) {
}
