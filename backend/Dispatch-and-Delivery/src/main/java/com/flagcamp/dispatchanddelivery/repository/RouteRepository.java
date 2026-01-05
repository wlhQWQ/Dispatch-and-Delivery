package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.RouteEntity;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface RouteRepository extends CrudRepository<RouteEntity, String> {
    // Custom query methods for Redis entity
    RouteEntity findByOrderId(String orderId);
}

