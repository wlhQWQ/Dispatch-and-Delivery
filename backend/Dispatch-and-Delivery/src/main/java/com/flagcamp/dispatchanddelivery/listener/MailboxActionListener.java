package com.flagcamp.dispatchanddelivery.listener;

import com.flagcamp.dispatchanddelivery.model.event.MailboxActionConfirmedEvent;
import com.flagcamp.dispatchanddelivery.model.event.RobotArrivedEvent;
import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.model.enums.ActionRequired;
import com.flagcamp.dispatchanddelivery.service.MessageService;
import com.flagcamp.dispatchanddelivery.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
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
                //告诉orderService改变订单状态，唤醒机器人
                orderService.confirmDelivery(orderId, userId);
                //推送信息
                messageService.notifyDeliveryConfirmed(userId, orderId);
            }

            default -> log.warn("Unhandled actionRequired: {}", action);
        }
    }

    @EventListener
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Async
    public void onRobotArrival(RobotArrivedEvent event) {
        log.info("RobotArrivedEvent received: orderId={}, message={}", 
            event != null ? event.orderId() : null, 
            event != null ? event.message() : null);
            
        if (event == null || event.orderId() == null || event.message() == null 
        ) {
            log.warn("RobotArrivedEvent is invalid, ignoring");
            return;
        }
        String orderId = event.orderId();
        String message = event.message();
       
        switch (message) {
            case "PICKUP" -> {
                log.info("Processing PICKUP arrival for order: {}", orderId);
                OrderEntity order = orderService.findById(orderId);
                String userId = order.getUserId();
                //推送消息
                messageService.notifyPickupArrived(userId, orderId);
                log.info("Pickup notification sent to user: {} for order: {}", userId, orderId);
            }

            case "DELIVERED" -> {
                log.info("Processing DELIVERED arrival for order: {}", orderId);
                OrderEntity order = orderService.findById(orderId);
                String userId = order.getUserId();
                //推送消息
                messageService.notifyDeliveryArrived(userId, orderId);
                log.info("Delivery notification sent to user: {} for order: {}", userId, orderId);
            }

            default -> log.warn("Unhandled message: {}", message);
        }
        
    }
}