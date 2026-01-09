package com.flagcamp.dispatchanddelivery.config;

import com.flagcamp.dispatchanddelivery.entity.HubEntity;
import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.model.dto.RouteDTO;
import com.flagcamp.dispatchanddelivery.repository.HubRepository;
import com.flagcamp.dispatchanddelivery.repository.OrderRepository;
import com.flagcamp.dispatchanddelivery.repository.RouteRepository;
import com.flagcamp.dispatchanddelivery.service.RouteService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class RedisDataInitializer {
    
    private static final Logger logger = LoggerFactory.getLogger(RedisDataInitializer.class);
    
    @Bean
    public CommandLineRunner initializeRedisData(
            OrderRepository orderRepository,
            HubRepository hubRepository,
            RouteService routeService,
            RouteRepository routeRepository) {
        
        return args -> {
            logger.info("Starting Redis data initialization with Google Maps route computation...");
            
            // Clear existing routes if any
            long existingRoutesCount = routeRepository.count();
            if (existingRoutesCount > 0) {
                logger.info("Redis already has {} routes. Clearing before re-initialization...", existingRoutesCount);
                routeRepository.deleteAll();
                logger.info("Existing routes cleared.");
            }
            
            // Fetch all orders from PostgreSQL
            Iterable<OrderEntity> orders = orderRepository.findAll();
            int routesCreated = 0;
            int routesFailed = 0;
            
            for (OrderEntity order : orders) {
                try {
                    // Only create routes for orders with pickup times
                    if (order.getPickupTime() != null) {
                        logger.info("Computing and storing route for order: {}", order.getOrderId());
                        
                        // Find the closest hub to the pickup location
                        HubEntity closestHub = findClosestHub(
                            hubRepository, 
                            order.getFromLat(), 
                            order.getFromLng()
                        );
                        
                        if (closestHub == null) {
                            logger.error("No hub found for order: {}", order.getOrderId());
                            routesFailed++;
                            continue;
                        }
                        
                        logger.info("Using hub {} for order {}", closestHub.getHubId(), order.getOrderId());
                        
                        // Compute route from hub to pickup location
                        // computeRoute returns List<RouteDTO> where [0] is robot route, [1] is drone route
                        List<RouteDTO> hubToPickupRoutes = routeService.computeRoute(
                            closestHub.getHubLat(),
                            closestHub.getHubLng(),
                            order.getFromLat(),
                            order.getFromLng()
                        );
                        
                        // Compute route from pickup location to end location
                        List<RouteDTO> pickupToEndRoutes = routeService.computeRoute(
                            order.getFromLat(),
                            order.getFromLng(),
                            order.getToLat(),
                            order.getToLng()
                        );
                        
                        // Use robot route (index 0) for both legs
                        // If order is drone type, we could use index 1, but for simplicity use robot route
                        RouteDTO hubToPickupRoute = hubToPickupRoutes.get(0);
                        RouteDTO pickupToEndRoute = pickupToEndRoutes.get(0);
                        
                        // Store the route with the order ID
                        routeService.storeRoute(
                            order.getOrderId(),
                            hubToPickupRoute.encodedPolyline(),
                            pickupToEndRoute.encodedPolyline(),
                            closestHub.getHubLat(),
                            closestHub.getHubLng(),
                            hubToPickupRoute.distance(),
                            pickupToEndRoute.distance()
                        );
                        
                        routesCreated++;
                        
                        // Add small delay to avoid hitting Google Maps API rate limits
                        Thread.sleep(200);
                    }
                } catch (Exception e) {
                    logger.error("Failed to create route for order {}: {}", 
                               order.getOrderId(), e.getMessage(), e);
                    routesFailed++;
                }
            }
            
            logger.info("Redis initialization complete. Created {} routes, {} failed.", 
                       routesCreated, routesFailed);
        };
    }
    
    /**
     * Find the closest hub to a given location using Haversine distance formula.
     */
    private HubEntity findClosestHub(HubRepository hubRepository, double lat, double lng) {
        List<HubEntity> allHubs = hubRepository.findAll();
        
        if (allHubs.isEmpty()) {
            return null;
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
        
        return closestHub;
    }
    
    /**
     * Calculate the distance between two points using the Haversine formula.
     * Returns the distance in kilometers.
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
}


