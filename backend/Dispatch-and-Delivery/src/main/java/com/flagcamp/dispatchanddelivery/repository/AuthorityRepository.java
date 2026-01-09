package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.AuthorityEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

public interface AuthorityRepository extends ListCrudRepository<AuthorityEntity, Long> {
    
    @Modifying
    @Query("INSERT INTO authorities (email, authority) VALUES (:email, :authority)")
    void insertAuthority(@Param("email") String email, @Param("authority") String authority);
}
