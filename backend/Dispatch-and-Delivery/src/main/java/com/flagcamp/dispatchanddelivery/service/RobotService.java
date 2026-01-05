package com.flagcamp.dispatchanddelivery.service;

import com.flagcamp.dispatchanddelivery.entity.HubEntity;
import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import com.flagcamp.dispatchanddelivery.model.RobotOptionsResponse;
import com.flagcamp.dispatchanddelivery.repository.HubRepository;
import com.flagcamp.dispatchanddelivery.repository.OrderRepository;
import com.flagcamp.dispatchanddelivery.repository.RobotRepository;
import com.google.maps.model.LatLng;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.util.Comparator;
import java.util.List;

@Service
public class RobotService {
    private static final Logger logger = LoggerFactory.getLogger(RobotService.class);
    
    private final RobotRepository robotRepository;
    private final OrderRepository orderRepository;
    private final RouteService routeService;
    private final HubRepository hubRepository;
    
    public RobotService(RobotRepository robotRepository, 
                       OrderRepository orderRepository,
                       RouteService routeService,
                       HubRepository hubRepository) {
        this.robotRepository = robotRepository;
        this.orderRepository = orderRepository;
        this.routeService = routeService;
        this.hubRepository = hubRepository;
    }

    /**
     * Find the closest hub to a given latitude and longitude.
     * Uses the Haversine formula to calculate distances.
     * 
     * @param lat The latitude of the location
     * @param lng The longitude of the location
     * @return The ID of the closest hub
     * @throws IllegalArgumentException if no hubs are found
     */
    public String findClosestHub(double lat, double lng) {
        logger.info("Finding closest hub to location: lat={}, lng={}", lat, lng);
        
        List<HubEntity> allHubs = hubRepository.findAll();
        
        if (allHubs.isEmpty()) {
            throw new IllegalArgumentException("No hubs found in the system");
        }
        
        HubEntity closestHub = null;
        double minDistance = Double.MAX_VALUE;
        
        for (HubEntity hub : allHubs) {
            double distance = calculateDistance(lat, lng, hub.getHubLat(), hub.getHubLng());
            
            if (distance < minDistance) {
                minDistance = distance;
                closestHub = hub;
            }
        }
        
        if (closestHub == null) {
            throw new IllegalArgumentException("Unable to find closest hub");
        }
        
        logger.info("Closest hub found: id={}, distance={} km", closestHub.getId(), minDistance);
        return closestHub.getId();
    }
    
    /**
     * Calculate the distance between two points using the Haversine formula.
     * Returns the distance in kilometers.
     * 
     * @param lat1 Latitude of point 1
     * @param lng1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lng2 Longitude of point 2
     * @return Distance in kilometers
     */
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int EARTH_RADIUS_KM = 6371;
        
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);
        
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLng / 2) * Math.sin(dLng / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }
    
    /**
     * Find the best robot options in a specific hub.
     * Returns the cheapest robot (robot_type = "robot") and the fastest drone (robot_type = "drone").
     * 
     * @param hubId The ID of the hub
     * @return RobotOptionsResponse containing the cheapest robot and fastest drone
     */
    public RobotOptionsResponse findRobotsByHubId(String hubId) {
        logger.info("Finding robot options in hub: {}", hubId);
        
        // Find all robots of type "robot" in the hub
        List<RobotEntity> robots = robotRepository.findByHubIdAndRobotType(hubId, "robot");
        
        // Find all robots of type "drone" in the hub
        List<RobotEntity> drones = robotRepository.findByHubIdAndRobotType(hubId, "drone");
        
        // Find the cheapest robot (lowest price)
        RobotEntity cheapestRobot = robots.stream()
            .min(Comparator.comparingDouble(RobotEntity::getPrice))
            .orElse(null);
        
        // Find the fastest drone (highest speed)
        RobotEntity fastestDrone = drones.stream()
            .max(Comparator.comparingDouble(RobotEntity::getSpeed))
            .orElse(null);
        
        if (cheapestRobot != null) {
            logger.info("Found cheapest robot in hub {}: id={}, price={}", 
                       hubId, cheapestRobot.getId(), cheapestRobot.getPrice());
        } else {
            logger.warn("No robots found in hub {}", hubId);
        }
        
        if (fastestDrone != null) {
            logger.info("Found fastest drone in hub {}: id={}, speed={}", 
                       hubId, fastestDrone.getId(), fastestDrone.getSpeed());
        } else {
            logger.warn("No drones found in hub {}", hubId);
        }
        
        return new RobotOptionsResponse(cheapestRobot, fastestDrone);
    }
    
    /**
     * Updates a robot's position based on the order status and elapsed time.
     * 
     * For orders with status "dispatching": duration = current time - submitTime
     * For orders with status "in transit": duration = current time - pickupTime
     * 
     * Then calls routeService.computeAndStorePosition to get the updated position
     * and updates both the route position and the robot's position in the robot table.
     * 
     * @param orderId The ID of the order
     * @return LatLng representing the updated robot position
     * @throws IllegalArgumentException if order is not found or status is invalid
     */
    public LatLng updateRobotPositionByOrderId(String orderId) {
        logger.info("Updating robot position for order: {}", orderId);
        
        // Find the order
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        // Get the robot
        RobotEntity robot = robotRepository.findById(order.getRobotId())
            .orElseThrow(() -> new IllegalArgumentException("Robot not found: " + order.getRobotId()));
        
        // Calculate duration based on order status
        long durationInMillis;
        boolean pickup;
        String status = order.getStatus();
        Timestamp currentTime = new Timestamp(System.currentTimeMillis());
        
        if ("dispatching".equalsIgnoreCase(status)) {
            // Robot is going from hub to pickup location
            if (order.getSubmitTime() == null) {
                throw new IllegalArgumentException("Order submitTime is null for order: " + orderId);
            }
            durationInMillis = currentTime.getTime() - order.getSubmitTime().getTime();
            pickup = true;
            logger.info("Order {} is dispatching. Duration: {} ms", orderId, durationInMillis);
            
        } else if ("in transit".equalsIgnoreCase(status)) {
            // Robot is going from pickup location to end location
            if (order.getPickupTime() == null) {
                throw new IllegalArgumentException("Order pickupTime is null for order: " + orderId);
            }
            durationInMillis = currentTime.getTime() - order.getPickupTime().getTime();
            pickup = false;
            logger.info("Order {} is in transit. Duration: {} ms", orderId, durationInMillis);
            
        } else {
            throw new IllegalArgumentException("Order status must be 'dispatching' or 'in transit', but got: " + status);
        }
        
        // Convert duration from milliseconds to seconds
        int durationInSeconds = (int) (durationInMillis / 1000);
        
        // Compute and store the new position using RouteService
        LatLng newPosition = routeService.computeAndStorePosition(
            orderId, 
            robot.getSpeed(), 
            durationInSeconds, 
            pickup
        );
        
        // Update the robot's position in the robot table
        robot.setCurrentLat(newPosition.lat);
        robot.setCurrentLng(newPosition.lng);
        robotRepository.save(robot);
        
        logger.info("Updated position for order {} and robot {}: lat={}, lng={}", 
                   orderId, robot.getId(), newPosition.lat, newPosition.lng);
        
        return newPosition;
    }
}
