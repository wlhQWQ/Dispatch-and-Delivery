package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RobotRepository extends JpaRepository<RobotEntity, String> {
    // Find all robots in a specific hub
    List<RobotEntity> findByHubId(String hubId);
    
    // Find robots by hub and robot type
    List<RobotEntity> findByHubIdAndRobotType(String hubId, String robotType);

    List<RobotEntity> findByAvailableTrue();

    List<RobotEntity> findByHubIdAndAvailableTrueAndRobotType(String hubId, String robotType);
}
