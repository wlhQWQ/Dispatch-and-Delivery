package com.flagcamp.dispatchanddelivery.model.response;

import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response object containing robot delivery options for a hub.
 * Includes the cheapest robot and fastest drone options.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RobotOptionsResponse {
    /**
     * The cheapest robot option (robot_type = "robot")
     */
    private RobotEntity cheapestRobot;
    
    /**
     * The fastest drone option (robot_type = "drone")
     */
    private RobotEntity fastestDrone;
}
