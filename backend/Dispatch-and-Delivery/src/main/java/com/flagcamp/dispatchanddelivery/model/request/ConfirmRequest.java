package com.flagcamp.dispatchanddelivery.model.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmRequest {
    @JsonProperty("messageId")
    private String messageId;
    
    @JsonProperty("orderId")
    private String orderId;
    
    @JsonProperty("action")
    private String action; // "PICKUP" | "DELIVERY" | "ACK"
    
    @JsonProperty("time")
    private String time;   // ISO string
}
