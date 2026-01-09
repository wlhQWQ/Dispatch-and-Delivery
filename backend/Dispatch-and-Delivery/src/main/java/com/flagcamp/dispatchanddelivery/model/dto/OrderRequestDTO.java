package com.flagcamp.dispatchanddelivery.model.dto;

import lombok.Data;

// 用于 POST /dashboard/orders/deliveryOptions
@Data
public class OrderRequestDTO {
    private String fromAddress;
    private Double fromLat;
    private Double fromLng;
    private String toAddress;
    private Double toLat;
    private Double toLng;
    private Integer duration;
    private Double price;
    private String itemDescription;
    private Double weight;

    // Selected option from preview (complete RouteResponse data)
    private String robotType;
    private String robotId;
    private String route;  // encodedPolyline from selected option
    private Long distance; // distance from selected option

    // Optional hub coordinates (can be derived from robotId)
    private Double hubLat;
    private Double hubLng;
}
