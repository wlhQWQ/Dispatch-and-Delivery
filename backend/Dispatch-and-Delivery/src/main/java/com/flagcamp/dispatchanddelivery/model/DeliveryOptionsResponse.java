package com.flagcamp.dispatchanddelivery.model;

public class DeliveryOptionsResponse {
    public RouteResponse robotRoute;
    public RouteResponse droneRoute;
    
    public DeliveryOptionsResponse(RouteResponse robotRoute, RouteResponse droneRoute) {
        this.robotRoute = robotRoute;
        this.droneRoute = droneRoute;
    }
}
