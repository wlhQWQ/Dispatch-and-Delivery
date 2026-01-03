package com.flagcamp.dispatchanddelivery.repository;
import com.flagcamp.dispatchanddelivery.model.Conversation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface  ConversationRepository extends JpaRepository<Conversation,Long>{
}
