package com.flagcamp.dispatchanddelivery.model;


public record MailboxActionConfirmedEvent(
        Long userId,
        Long orderId,
        ActionRequired actionRequired
) {}
