package com.flagcamp.dispatchanddelivery.mailbox;

public class ConfirmRequest {
    public long messageId;
    public Long orderId;
    public String action; // "PICKUP" | "DELIVERY" | "ACK"
    public String time;   // ISO string
}
