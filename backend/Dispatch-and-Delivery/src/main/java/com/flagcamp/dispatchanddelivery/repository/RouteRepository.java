package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.RouteEntity;

import org.springframework.data.repository.CrudRepository;

public interface RouteRepository extends CrudRepository<RouteEntity, String> {
    // orderId is now the primary key, so we can use findById directly
    // No need for custom findByOrderId method
}

