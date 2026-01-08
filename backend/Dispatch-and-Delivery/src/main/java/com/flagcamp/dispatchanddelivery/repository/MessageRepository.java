package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<MessageEntity, Long> {

    List<MessageEntity> findByUserIdOrderByCreatedAtDesc(String userId);
}