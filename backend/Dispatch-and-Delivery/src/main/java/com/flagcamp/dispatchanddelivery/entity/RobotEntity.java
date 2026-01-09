package com.flagcamp.dispatchanddelivery.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "robots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RobotEntity {
    
    @Id
    @Column(name = "id")
    private String robotId;
    
    @Column(name = "available")
    private boolean available;
    
    @Column(name = "battery")
    private int battery;
    
    @Column(name = "hub_id")
    private String hubId;
    
    @Column(name = "current_lat")
    private Double currentLat;
    
    @Column(name = "current_lng")
    private Double currentLng;
    
    @Column(name = "max_weight")
    private double maxWeight;
    
    @Column(name = "speed")
    private double speed;
    
    @Column(name = "price")
    private double price;
    
    @Column(name = "robot_type")
    private String robotType;
}

