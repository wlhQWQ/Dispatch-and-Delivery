package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    // Custom query methods can be added here
    List<OrderEntity> findByUserId(String userId);
    List<OrderEntity> findByStatus(String status);
}

