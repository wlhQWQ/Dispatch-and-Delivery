package com.flagcamp.dispatchanddelivery.service;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;

import org.springframework.stereotype.Service;

import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.manager.RobotSignalManager;
import com.flagcamp.dispatchanddelivery.repository.OrderRepository;
import com.flagcamp.dispatchanddelivery.repository.RouteRepository;

import lombok.AllArgsConstructor;

@AllArgsConstructor
@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final RouteRepository routeRepository;
    private final RobotSignalManager robotSignalManager;


    public OrderEntity findById(String orderId){
        OrderEntity orderEntity = orderRepository.findById(orderId)
            .orElseThrow(()-> (new NoSuchElementException()));
        return orderEntity;
    }

    public void confirmPickup(String orderId, String userId, 
        LocalDateTime pickupTime){
        //update order
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NoSuchElementException());
        order.setPickupTime(pickupTime);
        order.setStatus("in transit");
        orderRepository.save(order);

        //wake up robot
        robotSignalManager.userConfirmedPickup(orderId);
        
    }

    public void confirmDelivery(String orderId, String userId
    ){
        //update order
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new NoSuchElementException());
        order.setStatus("delivered");
        orderRepository.save(order);
        
        //update 
        robotSignalManager.userConfirmedDeliver(orderId);
    }
}
