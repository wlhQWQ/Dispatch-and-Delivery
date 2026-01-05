package com.flagcamp.dispatchanddelivery.model;

// { route: string
// duration: int
// price: double 
// robot_type: string}

public class RouteResponse {
    public String encodedPolyline;
    public int duration;
    public double price;
    public String robotType;
    
    public RouteResponse(String encodedPolyline, int duration,double price, String robotType) {
        this.encodedPolyline = encodedPolyline;
        this.duration = duration;
        this.price = price;
        this.robotType = robotType;
    }
    
    public static RouteResponse from(RouteDTO dto, int duration, double price, String robotType) {
        return new RouteResponse(
            dto.encodedPolyline(),
            duration,
            price,
            robotType
        );
    }
}
