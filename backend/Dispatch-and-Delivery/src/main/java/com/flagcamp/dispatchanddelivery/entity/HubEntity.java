package com.flagcamp.dispatchanddelivery.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

@Table("hubs")
public record HubEntity (
    @Id String hub_id,
    double lat,
    double lng,
    String address
) {
}