package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.HubEntity;
import org.springframework.data.repository.ListCrudRepository;

public interface HubRepository extends ListCrudRepository<HubEntity, String> {
}
