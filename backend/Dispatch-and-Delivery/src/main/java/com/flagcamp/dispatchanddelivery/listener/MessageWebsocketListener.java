package com.flagcamp.dispatchanddelivery.listener;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flagcamp.dispatchanddelivery.entity.MessageEntity;
import com.flagcamp.dispatchanddelivery.model.dto.MessageDTO;
import com.flagcamp.dispatchanddelivery.model.event.MessageCreatedEvent;
import com.flagcamp.dispatchanddelivery.repository.MessageRepository;
import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;

@Slf4j
@Component
@RequiredArgsConstructor
public class MessageWebsocketListener {

    private final MessageRepository messageRepository;
    private final ObjectMapper objectMapper;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onMessageCreated(MessageCreatedEvent event) {
        String messageId = event.messageId();
        if (messageId == null) return;

        MessageEntity message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            log.warn("MessageCreatedEvent received but message not found: id={}", messageId);
            return;
        }

        MessageDTO dto = MessageDTO.from(message);
        try {
            String json = objectMapper.writeValueAsString(dto);
            // 只向消息所属的用户发送，而不是广播给所有人
            String userId = message.getUserId();
            MailboxWsHandler.broadcastToUser(userId, json);
            log.debug("Message sent to user via WebSocket: userId={}, messageId={}", userId, messageId);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize mailbox message, id={}", messageId, e);
        }
    }
}