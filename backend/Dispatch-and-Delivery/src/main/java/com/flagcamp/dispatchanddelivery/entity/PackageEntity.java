package com.flagcamp.dispatchanddelivery.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "packages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PackageEntity {
    
    @Id
    @Column(name = "id")
    private String packageId;
    
    @Column(name = "order_id")
    private String orderId;
    
    @Column(name = "item_description")
    private String itemDescription;
    
    @Column(name = "weight")
    private double weight;
}
