package com.flagcamp.dispatchanddelivery.mailbox;

import com.flagcamp.dispatchanddelivery.model.MailboxActionConfirmedEvent;
import com.flagcamp.dispatchanddelivery.model.ActionRequired;
import com.flagcamp.dispatchanddelivery.service.MessageService;
import com.flagcamp.dispatchanddelivery.service.OrderService;
import com.flagcamp.dispatchanddelivery.service.RobotService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailboxActionListener {

    private final OrderService orderService;
    private final RobotService robotService;
    private final MessageService messageService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional
    public void onMailboxActionConfirmed(MailboxActionConfirmedEvent event) {
        if (event == null || event.userId() == null || event.orderId() == null || event.actionRequired() == null) {
            return;
        }

        Long userId = event.userId();
        Long orderId = event.orderId();
        ActionRequired action = event.actionRequired();

        log.info("MailboxActionConfirmedEvent received: userId={}, orderId={}, action={}", userId, orderId, action);

        switch (action) {
            case PICKUP -> {

                orderService.confirmPickup(orderId, userId);

                messageService.notifyPickupConfirmed(userId, orderId);
            }

            case DELIVERY -> {

                orderService.confirmDelivery(orderId, userId);


                messageService.notifyDeliveryConfirmed(userId, orderId);
            }

            default -> log.warn("Unhandled actionRequired: {}", action);
        }
    }
}