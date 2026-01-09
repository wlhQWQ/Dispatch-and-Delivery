package com.flagcamp.dispatchanddelivery.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

import com.flagcamp.dispatchanddelivery.model.enums.ActionRequired;
import com.flagcamp.dispatchanddelivery.model.enums.MessageType;

import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
@Entity
@Table(
        name="messages",
        indexes = {
@Index(name = "idx_messages_user_id", columnList = "userId"),
@Index(name = "idx_messages_created_at", columnList = "createdAt")
        }
)

public class MessageEntity {
    @Id
    private String id;
    // 接收者
    @Column(name = "user_id",nullable = false)
    private String userId;

    // 关联订单
    @Column(name = "order_id")
    private String orderId;

    // 消息标题
    @Column(name = "subject", nullable = false, length = 100)
    private String subject;

    // 消息正文
    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    // 消息类型
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private MessageType type;

    // 是否需要用户动作
    @Enumerated(EnumType.STRING)
    @Column(name = "action_required", length = 20)
    private ActionRequired actionRequired;

    // 是否已读
    @Column(name = "has_read", nullable = false)
    private boolean hasRead;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected MessageEntity() {}

    public MessageEntity(String userId,
                    String orderId,
                    String subject,
                    String content,
                    MessageType type,
                    ActionRequired actionRequired) {
        this.id = UUID.randomUUID().toString();
        this.userId = userId;
        this.orderId = orderId;
        this.subject = subject;
        this.content = content;
        this.type = type;
        this.actionRequired = actionRequired;
        this.hasRead = false;
        this.createdAt = LocalDateTime.now();
}}