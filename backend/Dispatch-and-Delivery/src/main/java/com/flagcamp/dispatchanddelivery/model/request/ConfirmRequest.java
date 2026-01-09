package com.flagcamp.dispatchanddelivery.model.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmRequest {
    public String messageId;
    public String orderId;
    public String action; // "PICKUP" | "DELIVERY" | "ACK"
    public String time;   // ISO string
}
