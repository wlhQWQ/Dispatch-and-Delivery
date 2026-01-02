package com.flagcamp.dispatchanddelivery.mailbox;

import java.time.Instant;

public class MailboxMessage {
    public long id;
    public String subject;
    public String content;
    public String type;      // 可选
    public Long orderId;     // 可选
    public String actionRequired; // "pickup" | "delivery" | null
    public Instant time;
    public boolean read;

    public MailboxMessage() {}
}
