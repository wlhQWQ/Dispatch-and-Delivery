package com.flagcamp.dispatchanddelivery.entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderEntity {
    
    @Id
    @Column(name = "id")
    @JsonProperty("order_id")
    private String orderId;
    
    @Column(name = "submit_time")
    private LocalDateTime submitTime;
    
    @Column(name = "user_id")
    private String userId;
    
    @Column(name = "from_address")
    private String fromAddress;
    
    @Column(name = "to_address")
    private String toAddress;
    
    @Column(name = "from_lat")
    private double fromLat;
    
    @Column(name = "from_lng")
    private double fromLng;
    
    @Column(name = "to_lat")
    private double toLat;
    
    @Column(name = "to_lng")
    private double toLng;
    
    @Column(name = "package_id")
    private String packageId;
    
    @Column(name = "status")
    private String status;
    
    @Column(name = "price")
    private double price;
    
    @Column(name = "pickup_time")
    private LocalDateTime pickupTime;
    
    @Column(name = "duration")
    private int duration;

    @Column(name = "robot_id")
    private String robotId;
    
    @Column(name = "robot_type")
    private String robotType;
}