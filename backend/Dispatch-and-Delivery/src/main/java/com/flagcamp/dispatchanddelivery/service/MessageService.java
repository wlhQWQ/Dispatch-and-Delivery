package com.flagcamp.dispatchanddelivery.service;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flagcamp.dispatchanddelivery.mailbox.ConfirmRequest;
import com.flagcamp.dispatchanddelivery.mailbox.MailboxMessage;
import com.flagcamp.dispatchanddelivery.model.ActionRequired;
import com.flagcamp.dispatchanddelivery.model.Message;
import com.flagcamp.dispatchanddelivery.repository.MessageRepository;
import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;
import java.util.List;
import com.flagcamp.dispatchanddelivery.model.MessageType;



@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        pushToWebSocket(saved);
        return saved;
    }
    private void pushToWebSocket(Message message) {
        MailboxMessage dto = MailboxMessage.from(message);
        try {
            String json = objectMapper.writeValueAsString(dto);
            MailboxWsHandler.broadcast(json);
        } catch (Exception e) {

            e.printStackTrace();
        }

    }
    @Transactional
    public Message notifyPickupArrived(Long userId, Long orderId) {
        return createMessage(
                userId,
                orderId,
                "Robot arrived at pickup",
                "Please confirm pickup to continue.",
                MessageType.ARRIVED,
                ActionRequired.PICKUP
        );
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