package com.flagcamp.dispatchanddelivery.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flagcamp.dispatchanddelivery.mailbox.ConfirmRequest;
import com.flagcamp.dispatchanddelivery.mailbox.MailboxMessage;
import com.flagcamp.dispatchanddelivery.model.*;
import com.flagcamp.dispatchanddelivery.repository.MessageRepository;
import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;



@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper ;
    private final ApplicationEventPublisher publisher;

    public List<MailboxMessage> getMailbox(Long userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }

        return messageRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(MailboxMessage::from)
                .toList();
    }

    @Transactional
    public void confirmMailboxAction(ConfirmRequest req) {
        Message message = messageRepository.findById(req.messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        message.setRead(true);
        publisher.publishEvent(new MailboxActionConfirmedEvent(
                message.getUserId(),
                message.getOrderId(),
                message.getActionRequired()
        ));
    }

    @Transactional
    public Message createMessage(
            Long userId,
            Long orderId,
            String subject,
            String content,
            MessageType type,
            ActionRequired actionRequired
    ) {
        Message message = new Message(
                userId,
                orderId,
                subject,
                content,
                type,
                actionRequired
        );
        Message saved = messageRepository.save(message);

        publisher.publishEvent(new MessageCreatedEvent(saved.getId(), saved.getUserId()));
        return saved;
    }
    @Transactional
    public Message notifyDeliveryConfirmed(Long userId, Long orderId) {
        Message message = createMessage(
                userId,
                orderId,
                "Delivery confirmed",
                "Thanks! Your delivery has been confirmed.",
                MessageType.INFO,
                ActionRequired.NONE
        );

        return message;
    }


    @Transactional
    public Message notifyPickupArrived(Long userId, Long orderId) {

        Message message = createMessage(
                userId,
                orderId,
                "Robot arrived at pickup",
                "Please confirm pickup to continue.",
                MessageType.ARRIVED,
                ActionRequired.PICKUP
        );

        return message;
    }
    @Transactional
    public Message notifyPickupConfirmed(Long userId, Long orderId) {

        Message message = createMessage(
                userId,
                orderId,
                "Pickup confirmed",
                "Robot has picked up your order.",
                MessageType.INFO,
                ActionRequired.NONE
        );

        return message;
    }

    @Transactional
    public Message notifyDeliveryArrived(Long userId, Long orderId) {
        return createMessage(
                userId,
                orderId,
                "Order delivered",
                "Please confirm delivery.",
                MessageType.ARRIVED,
                ActionRequired.DELIVERY
        );
    }
}