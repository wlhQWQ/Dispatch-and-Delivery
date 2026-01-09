package com.flagcamp.dispatchanddelivery.model.response;

import com.flagcamp.dispatchanddelivery.model.dto.RouteDTO;

// { route: string
// duration: int
// distance: long
// price: double
// robot_type: string
// robot_id: string}

public class RouteResponse {
    public String encodedPolyline;
    public int duration;
    public long distance;
    public double price;
    public String robotType;
    public String robotId;

    public RouteResponse(String encodedPolyline, int duration, long distance, double price, String robotType, String robotId) {
        this.encodedPolyline = encodedPolyline;
        this.duration = duration;
        this.distance = distance;
        this.price = price;
        this.robotType = robotType;
        this.robotId = robotId;
    }

    public static RouteResponse from(RouteDTO dto, int duration, double price, String robotType, String robotId) {
        return new RouteResponse(
            dto.encodedPolyline(),
            duration,
            dto.distance(),
            price,
            robotType,
            robotId
        );
    }
}
