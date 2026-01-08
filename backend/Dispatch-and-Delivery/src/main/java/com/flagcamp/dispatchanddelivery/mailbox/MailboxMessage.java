package com.flagcamp.dispatchanddelivery.mailbox;

import java.time.Instant;
import java.time.ZoneId;

import com.flagcamp.dispatchanddelivery.entity.MessageEntity;

public class MailboxMessage {
    public long id;
    public String subject;
    public String content;
    public String type;      // 可选
    public String orderId;     // 可选
    public String actionRequired; // "pickup" | "delivery" | null
    public Instant time;
    public boolean read;

    public MailboxMessage() {}
    public static MailboxMessage from(MessageEntity message) {
        MailboxMessage dto = new MailboxMessage();
        dto.id = message.getId();
        dto.subject = message.getSubject();
        dto.content = message.getContent();
        dto.type = message.getType() == null ? null : message.getType().name();
        dto.orderId = message.getOrderId();
        if (message.getActionRequired() == null) {
            dto.actionRequired = null;
        } else {
            dto.actionRequired = switch (message.getActionRequired()) {
                case PICKUP -> "pickup";
                case DELIVERY -> "delivery";
                default -> null; // NONE -> null
            };
        }
        dto.time = message.getCreatedAt().atZone(ZoneId.systemDefault()).toInstant();
        dto.read = message.isRead();
        return dto;
    }
}