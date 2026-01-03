package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByUserIdOrderByCreatedAtDesc(Long userId);
}
