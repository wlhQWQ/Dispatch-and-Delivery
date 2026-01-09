package com.flagcamp.dispatchanddelivery.service;
import com.flagcamp.dispatchanddelivery.entity.MessageEntity;
import com.flagcamp.dispatchanddelivery.model.dto.MessageDTO;
import com.flagcamp.dispatchanddelivery.model.enums.ActionRequired;
import com.flagcamp.dispatchanddelivery.model.enums.MessageType;
import com.flagcamp.dispatchanddelivery.model.event.MailboxActionConfirmedEvent;
import com.flagcamp.dispatchanddelivery.model.event.MessageCreatedEvent;
import com.flagcamp.dispatchanddelivery.model.request.ConfirmRequest;
import com.flagcamp.dispatchanddelivery.repository.MessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;



@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ApplicationEventPublisher publisher;

    public List<MessageDTO> getMailbox(String userId) {
        if (userId == null) {
            throw new IllegalArgumentException("userId cannot be null");
        }

        return messageRepository
                .findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(MessageDTO::from)
                .toList();
    }

    @Transactional
    public void confirmMailboxAction(ConfirmRequest req) {
        MessageEntity message = messageRepository.findById(req.getMessageId())
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        message.setHasRead(true);
        messageRepository.save(message);
        
        publisher.publishEvent(new MailboxActionConfirmedEvent(
                message.getUserId(),
                message.getOrderId(),
                message.getActionRequired()
        ));
    }

    @Transactional
    public MessageEntity createMessage(
            String userId,
            String orderId,
            String subject,
            String content,
            MessageType type,
            ActionRequired actionRequired
    ) {
        MessageEntity message = new MessageEntity(
                userId,
                orderId,
                subject,
                content,
                type,
                actionRequired
        );
        MessageEntity saved = messageRepository.save(message);

        publisher.publishEvent(new MessageCreatedEvent(saved.getId(), saved.getUserId()));
        return saved;
    }
    @Transactional
    public MessageEntity notifyDeliveryConfirmed(String userId, String orderId) {
        MessageEntity message = createMessage(
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
    public MessageEntity notifyPickupArrived(String userId, String orderId) {

        MessageEntity message = createMessage(
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
    public MessageEntity notifyPickupConfirmed(String userId, String orderId) {

        MessageEntity message = createMessage(
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
    public MessageEntity notifyDeliveryArrived(String userId, String orderId) {
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