package com.flagcamp.dispatchanddelivery.repository;

import com.flagcamp.dispatchanddelivery.entity.RobotEntity;

import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.ListCrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RobotRepository extends ListCrudRepository<RobotEntity, String> {

    List<RobotEntity> findByAvailableTrue();

    @Query("SELECT * FROM robots WHERE hub_id = :hubId AND available = true AND robot_type = :type")
    List<RobotEntity> findAvailableByHubIdAndType(String hubId, String type);

    //加了这个方法，因为感觉如果只改position的话没必要用原来把所有字段全搜出来再set回去的写法
    @Modifying
    @Query("UPDATE robots set lat = :lat, lng = :lng where robot_id= :robotId")
    void updatePositionByRobotId(@Param("robotId") String robotId,
                                @Param("lat") double lat,
                                @Param("lng") double lng);
}
