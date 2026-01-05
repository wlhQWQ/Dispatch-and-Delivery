package com.flagcamp.dispatchanddelivery.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hub")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HubEntity {
    
    @Id
    @Column(name = "id")
    private String id;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "hub_lat")
    private double hubLat;
    
    @Column(name = "hub_lng")
    private double hubLng;
}
