package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, String> {
    // Custom query methods can be added here
    List<OrderEntity> findByUserId(String userId);
    List<OrderEntity> findByStatus(String status);
}

