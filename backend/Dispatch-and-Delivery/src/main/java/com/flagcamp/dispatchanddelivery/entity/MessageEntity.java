package com.flagcamp.dispatchanddelivery.entity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

import com.flagcamp.dispatchanddelivery.model.ActionRequired;
import com.flagcamp.dispatchanddelivery.model.MessageType;

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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private  long id;
    // 接收者
    @Column(nullable = false)
    private String userId;

    // 关联订单
    @Column()
    private String orderId;

    // 消息标题
    @Column(nullable = false, length = 100)
    private String subject;

    // 消息正文
    @Lob
    private String content;

    // 消息类型
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private MessageType type;

    // 是否需要用户动作
    @Enumerated(EnumType.STRING)
    @Column( length = 20)
    private ActionRequired actionRequired;

    // 是否已读
    @Column(nullable = false)
    private boolean read;
    @Column( nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected MessageEntity() {}

    public MessageEntity(String userId,
                    String orderId,
                    String subject,
                    String content,
                    MessageType type,
                    ActionRequired actionRequired) {
        this.userId = userId;
        this.orderId = orderId;
        this.subject = subject;
        this.content = content;
        this.type = type;
        this.actionRequired = actionRequired;
        this.read = false;
        this.createdAt =LocalDateTime.now();
}}