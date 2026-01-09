package com.flagcamp.dispatchanddelivery.model.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

// 用于 GET /dashboard/orders
@Data
@Builder
public class OrderResponseDTO {
    private String order_id;
    private String from_address;
    private String to_address;
    private String status;
    private String route;
    private LocalDateTime pickup_time;
    private int duration;
    private float price;
    private String item_description;
    private float weight;
    private String robot_type;
}


