package com.flagcamp.dispatchanddelivery.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hubs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HubEntity {
    
    @Id
    @Column(name = "id")
    private String hubId;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "hub_lat")
    private double hubLat;
    
    @Column(name = "hub_lng")
    private double hubLng;
}
