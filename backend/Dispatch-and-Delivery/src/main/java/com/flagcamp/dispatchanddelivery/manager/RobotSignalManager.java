package com.flagcamp.dispatchanddelivery.manager;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import org.springframework.stereotype.Component;

@Component
public class RobotSignalManager {

    private static final Logger logger = LoggerFactory.getLogger(RobotSignalManager.class);
    

    //key: orderId, value: signal，“未来会被pickup/deliver的信号”
    private final Map<String,CompletableFuture<Boolean>> pickupOrders = new ConcurrentHashMap<>();
    private final Map<String,CompletableFuture<Boolean>> deliverOrders = new ConcurrentHashMap<>();

    //机器人等待确认pickup
    public void awaitPickup(String orderId) {
        logger.info("Robot arriving at pickup location for order: {}, awaiting user confirmation...", orderId);
        CompletableFuture<Boolean> signal = new CompletableFuture<>();
        pickupOrders.put(orderId, signal);
        try {
            //设置12小时pickup窗口，过后超时
            logger.info("Robot is now WAITING at pickup for order: {}", orderId);
            signal.get(12, TimeUnit.HOURS);
            logger.info("User confirmed pickup for order: {}, robot resuming...", orderId);
        } catch (Exception e) {
            logger.error("Order pickup {} timed out", orderId, e);
            throw new RuntimeException("Timeout",e);
        } finally {
            pickupOrders.remove(orderId);
        }
    }

    //确认pickup，唤醒机器人继续行动
    public void userConfirmedPickup(String orderId){
        CompletableFuture<Boolean> signal = pickupOrders.get(orderId);
        if (signal != null) {
            signal.complete(true);
            logger.info("Pickup confirmed for orderId: {}", orderId);
        } else {
            logger.warn("Can't find orderId: {} - already picked up or timed out", orderId);
        }
    }

    //机器人等待确认deliver
    public void awaitDeliver(String orderId) {
        logger.info("Robot arriving at delivery location for order: {}, awaiting user confirmation...", orderId);
        CompletableFuture<Boolean> signal = new CompletableFuture<>();
        deliverOrders.put(orderId, signal);
        try {
            //设置12小时delivery窗口，过后超时
            logger.info("Robot is now WAITING at delivery point for order: {}", orderId);
            signal.get(12, TimeUnit.HOURS);
            logger.info("User confirmed delivery for order: {}, robot returning to hub...", orderId);
        } catch (Exception e) {
            logger.error("Order delivery {} timed out", orderId, e);
            throw new RuntimeException("Timeout",e);
        } finally {
            deliverOrders.remove(orderId);
        }
    }

    //确认deliver，唤醒机器人继续行动
    public void userConfirmedDeliver(String orderId){
        CompletableFuture<Boolean> signal = deliverOrders.get(orderId);
        if (signal != null) {
            signal.complete(true);
            logger.info("Delivery confirmed for orderId: {}", orderId);
        } else {
            logger.warn("Can't find orderId: {} - already delivered or timed out", orderId);
        }
    }

}
