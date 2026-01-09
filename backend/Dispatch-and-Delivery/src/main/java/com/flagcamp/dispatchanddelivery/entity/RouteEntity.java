package com.flagcamp.dispatchanddelivery.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@RedisHash(value = "routes", timeToLive = 86400) // TTL: 24 hours
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteEntity {
    
    @Id
    private String orderId;
    
    private String hubToPickup;
    
    private String pickupToEnd;
    
    private double positionLat;
    
    private double positionLng;
    
    private long hubToPickupDistance;
    
    private long pickupToEndDistance;
}
