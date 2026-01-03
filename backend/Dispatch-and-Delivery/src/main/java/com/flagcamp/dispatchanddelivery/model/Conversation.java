package com.flagcamp.dispatchanddelivery.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(name="conversation",uniqueConstraints = @UniqueConstraint(columnNames = {"userId","user2Id"}))
public class Conversation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long conversationId;

    @Column(nullable = false)
    private Long userId;
    @Column(nullable = false)
    private Long user2Id;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    protected Conversation() {
    }
}
