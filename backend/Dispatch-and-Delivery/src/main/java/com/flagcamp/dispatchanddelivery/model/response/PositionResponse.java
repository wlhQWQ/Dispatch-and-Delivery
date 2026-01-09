package com.flagcamp.dispatchanddelivery.model.response;

public class PositionResponse {
    public String orderId;
    public String encodedRoute;
    public double lat;
    public double lng;
    
    public PositionResponse(String orderId, String encodedRoute, double lat, double lng) {
        this.orderId = orderId;
        this.encodedRoute = encodedRoute;
        this.lat = lat;
        this.lng = lng;
    }
}
