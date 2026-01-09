package com.flagcamp.dispatchanddelivery.model.dto;

import com.flagcamp.dispatchanddelivery.entity.RouteEntity;

//This DTO is for computing route before order is processed
public record RouteDTO(
    
    String encodedPolyline,              
    double positionLat,
    double positionLng,
    long distance
){  
    public RouteDTO( RouteEntity routeEntity, boolean pickup){
        this(
            pickup ? routeEntity.getHubToPickup(): routeEntity.getPickupToEnd(),
            routeEntity.getPositionLat(),
            routeEntity.getPositionLng(),
            pickup ? routeEntity.getHubToPickupDistance()
            : routeEntity.getPickupToEndDistance()
        );
    }
}