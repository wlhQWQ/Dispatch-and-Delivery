package com.flagcamp.dispatchanddelivery.mailbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flagcamp.dispatchanddelivery.model.MessageCreatedEvent;
import com.flagcamp.dispatchanddelivery.mailbox.MailboxMessage;
import com.flagcamp.dispatchanddelivery.model.Message;
import com.flagcamp.dispatchanddelivery.model.MessageCreatedEvent;
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
        Long messageId = event.messageId();
        if (messageId == null) return;

        Message message = messageRepository.findById(messageId).orElse(null);
        if (message == null) {
            log.warn("MessageCreatedEvent received but message not found: id={}", messageId);
            return;
        }

        MailboxMessage dto = MailboxMessage.from(message);
        try {
            String json = objectMapper.writeValueAsString(dto);
            MailboxWsHandler.broadcast(json);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize mailbox message, id={}", messageId, e);
        }
    }
}