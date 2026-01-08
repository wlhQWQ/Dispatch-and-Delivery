package com.flagcamp.dispatchanddelivery.mailbox;

import com.flagcamp.dispatchanddelivery.model.event.MailboxActionConfirmedEvent;
import com.flagcamp.dispatchanddelivery.model.event.RobotArrivedEvent;
import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.model.ActionRequired;
import com.flagcamp.dispatchanddelivery.service.MessageService;
import com.flagcamp.dispatchanddelivery.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class MailboxActionListener {

    private final OrderService orderService;
    private final MessageService messageService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onMailboxActionConfirmed(MailboxActionConfirmedEvent event) {
        if (event == null || event.userId() == null || event.orderId() == null || event.actionRequired() == null) {
            return;
        }

        String userId = event.userId();
        String orderId = event.orderId();
        ActionRequired action = event.actionRequired();

        log.info("MailboxActionConfirmedEvent received: userId={}, orderId={}, action={}", userId, orderId, action);

        switch (action) {
            case PICKUP -> {
                LocalDateTime currentTime = LocalDateTime.now();
                //告诉orderService改变订单状态，唤醒机器人
                orderService.confirmPickup(orderId, userId, currentTime);
                //推送信息
                messageService.notifyPickupConfirmed(userId, orderId);
                
            }

            case DELIVERY -> {
                orderService.confirmDelivery(orderId, userId);
                messageService.notifyDeliveryConfirmed(userId, orderId);
            }

            default -> log.warn("Unhandled actionRequired: {}", action);
        }
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void onRobotArrival(RobotArrivedEvent event) {
        if (event == null || event.orderId() == null || event.message() == null 
        ) {
            return;
        }
        String orderId = event.orderId();
        String message = event.message();
       
        switch (message) {
            case "PICKUP" -> {
                OrderEntity order = orderService.findById(orderId);
                String userId = order.getUserId();
                //推送消息
                messageService.notifyPickupArrived(userId, orderId);
                
            }

            case "DELIVERED" -> {
                OrderEntity order = orderService.findById(orderId);
                String userId = order.getUserId();
                //推送消息
                messageService.notifyDeliveryArrived(userId, orderId);
            }

            default -> log.warn("Unhandled message: {}", message);
        }
        
    }
}