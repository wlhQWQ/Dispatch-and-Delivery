package com.flagcamp.dispatchanddelivery.service;

import com.flagcamp.dispatchanddelivery.mailbox.ConfirmRequest;
import com.flagcamp.dispatchanddelivery.mailbox.MailboxMessage;
import com.flagcamp.dispatchanddelivery.model.ActionRequired;
import com.flagcamp.dispatchanddelivery.socket.MailboxWsHandler;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class MailboxService {

    private final AtomicLong idGen = new AtomicLong(1000);
    private final CopyOnWriteArrayList<MailboxMessage> messages = new CopyOnWriteArrayList<>();
    private final ObjectMapper mapper = new ObjectMapper();

    public MailboxService() {
        // 启动时塞两条样例，方便你一进 mailbox 就有数据
        addMessage(build("Robot arrived at pickup",
                "Please confirm pickup to continue.",
                "PICKUP_ARRIVED", 12345L, "pickup"));

        addMessage(build("Order delivered",
                "Please confirm delivery.",
                "DELIVERY_ARRIVED", 12344L, "delivery"));
    }

    private MailboxMessage build(String subject, String content, String type, Long orderId, String actionRequired) {
        MailboxMessage m = new MailboxMessage();
        m.id = idGen.incrementAndGet();
        m.subject = subject;
        m.content = content;
        m.type = type;
        m.orderId = orderId;
        m.actionRequired = actionRequired;
        m.time = Instant.now();
        m.read = false;
        return m;
    }

    public List<MailboxMessage> list() {
        return new ArrayList<>(messages);
    }

    public MailboxMessage addMessage(MailboxMessage m) {
        if (m.id == 0) m.id = idGen.incrementAndGet();
        if (m.time == null) m.time = Instant.now();
        messages.add(0, m); // 新消息放前面

        // 同步推送 WS（前端会 toast + 未读数+1）
        try {
            String json = mapper.writeValueAsString(m);
            MailboxWsHandler.broadcast(json);
        } catch (Exception ignored) {}

        return m;
    }

    public void confirm(ConfirmRequest req) {
        for (MailboxMessage m : messages) {
            if (m.id == req.messageId) {
                m.read = true;

                MailboxMessage ack = build(
                        "Confirmed: " + (req.action == null ? "ACK" : req.action),
                        "Message #" + req.messageId + " confirmed.",
                        "CONFIRMED",
                        req.orderId,
                        null
                );
                addMessage(ack);
                return;
            }
        }
    }

}
