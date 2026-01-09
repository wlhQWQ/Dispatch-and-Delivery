package com.flagcamp.dispatchanddelivery.model.event;

import com.flagcamp.dispatchanddelivery.model.enums.ActionRequired;

public record MailboxActionConfirmedEvent(
        String userId,
        String orderId,
        ActionRequired actionRequired
) {}