package com.flagcamp.dispatchanddelivery.model.event;

//message: "PICKUP" / "DELIVERED"
public record RobotArrivedEvent(String orderId, String message) {
    
}
