package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.entity.HubEntity;
import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import com.flagcamp.dispatchanddelivery.entity.RouteEntity;
import com.flagcamp.dispatchanddelivery.model.*;
import com.flagcamp.dispatchanddelivery.repository.OrderRepository;
import com.flagcamp.dispatchanddelivery.service.RobotService;
import com.flagcamp.dispatchanddelivery.service.RouteService;
import com.google.maps.model.LatLng;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/dashboard/orders")
public class OrderController {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);
    
    private final RouteService routeService;
    private final RobotService robotService;
    private final OrderRepository orderRepository;
    
    public OrderController(RouteService routeService, RobotService robotService, OrderRepository orderRepository) {
        this.routeService = routeService;
        this.robotService = robotService;
        this.orderRepository = orderRepository;
    }
    
    /**
     * Get all orders
     * GET /dashboard/orders
     */
    @GetMapping
    public ResponseEntity<List<OrderEntity>> getAllOrders() {
        logger.info("Fetching all orders");
        List<OrderEntity> orders = orderRepository.findAll();
        logger.info("Found {} orders", orders.size());
        return ResponseEntity.ok(orders);
    }
    
   
    @PostMapping("/deliveryOptions/preview")
    public ResponseEntity<?> previewRoute(@RequestBody RouteRequestBody request) {
        boolean test = false;
        if(test){
            // Hardcoded test case for Ferry Building to Golden Gate Bridge
            // Ferry Building: 37.7955, -122.3937
            // Golden Gate Bridge: 37.8199, -122.4783
            
            // Validate test coordinates (approximate match)
            if (Math.abs(request.fromLat - 37.7955) < 0.01 && 
                Math.abs(request.fromLng - (-122.3937)) < 0.01 &&
                Math.abs(request.toLat - 37.8199) < 0.01 && 
                Math.abs(request.toLng - (-122.4783)) < 0.01) {
                
                // Robot route (road-based) - realistic Google Maps route
                String robotEncodedRoute = "gqp_GnhejVoBqDuCcF}@oBs@kBi@}A[aAUy@Mq@Ks@Gk@Cm@?m@Bk@Fk@Ji@Nk@Ri@Xk@\\i@`@g@d@e@f@c@j@a@l@]n@[p@Yp@Wt@Ut@Sx@Qx@Oz@M|@K|@I|@G~@E~@C~@A~@?~@@~@B~@D|@F|@H|@J|@L|@Nz@Rz@Tz@Vx@Zx@\\v@^v@`@t@b@r@f@r@h@p@l@n@p@l@t@j@x@h@|@f@`Ad@dAb@hA`@jA^lA\\nAZpAXrAVtATvARxAPzAN|AL~AJ`BHbBFdBDfBBhB@jB?lBAjBClBEhBGhBIhBKfBMfBOfBQdBSdBUbBWbBY`B[`B_@~Aa@~Ac@|Ae@|Ag@zAi@zAk@xAm@xAo@vAq@vAs@tAu@tAw@rAy@rA{@pA}@pA_AnA_AlAaAjAcAjAeAhAgAhAiAfAkAfAmAdAoAdAqAbAsA`AuA`AwA~@yA~@{A|@}A|@_Bz@aBz@cBx@eBx@gBv@iBv@kBt@mBt@oBr@qBr@sBp@uBp@wBn@yBn@{Bl@}Bl@_Cj@aCj@cCh@eCh@gCf@iCf@kCd@mCd@";
                long robotDistance = 8450; // meters (approximately 8.45 km via roads)
                
                // Drone route (straight-line)
                String droneEncodedRoute = "gqp_GnhejV}AlE}@tCq@~Bm@bCg@bCc@dC_@fCY~BU`COdCKfCEdCChC@hCDhCHfCNfCRdCV`CZ~B^|Bd@xBh@vBn@rBr@nBx@jB|@fBbAjBf@nBj@lBl@hBp@dBt@`Bx@\\B";
                long droneDistance = 6820; // meters (approximately 6.82 km straight line)
                
                // Robot specs (can be arbitrary as per requirements)
                double robotSpeed = 15.0; // km/h
                double robotPricePerKm = 2.5; // dollars per km
                
                // Drone specs (can be arbitrary as per requirements)
                double droneSpeed = 45.0; // km/h
                double dronePricePerKm = 5.0; // dollars per km
                
                // Compute prices: per km for unit price, meters for distance
                double robotPrice = robotDistance * robotPricePerKm / 1000.0;
                double dronePrice = droneDistance * dronePricePerKm / 1000.0;
                
                // Compute duration: km/h for speed, minutes for duration, meters for distance
                int robotDuration = (int) (robotDistance * 60.0 / (robotSpeed * 1000.0));
                int droneDuration = (int) (droneDistance * 60.0 / (droneSpeed * 1000.0));
                
                RouteResponse robotRoute = new RouteResponse(
                    robotEncodedRoute,
                    robotDuration,
                    robotPrice,
                    "robot"
                );
                
                RouteResponse droneRoute = new RouteResponse(
                    droneEncodedRoute,
                    droneDuration,
                    dronePrice,
                    "drone"
                );
                
                DeliveryOptionsResponse response = new DeliveryOptionsResponse(robotRoute, droneRoute);
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Test mode only supports Ferry Building to Golden Gate Bridge route"));
            }
        } else {
            // Real implementation - calls Google Maps API
            logger.info("Received route preview request: from ({}, {}) to ({}, {})", 
                       request.fromLat, request.fromLng, request.toLat, request.toLng);
            
            try {
                List<RouteDTO> routeDTOs = routeService.computeRoute(
                    request.fromLat,
                    request.fromLng,
                    request.toLat,
                    request.toLng
                );

                Optional<HubEntity> hub = robotService.findNearestHub(request.fromLat, request.fromLng);
                if (hub.isEmpty()) {
                    throw new IllegalArgumentException("No hub found near pickup location");
                }
                //get a robot and a drone
                RobotEntity robot = robotService.findCheapestRobot(hub.get().hub_id()).get();
                RobotEntity drone = robotService.findFastestDrone(hub.get().hub_id()).get();

                //compute prices: per km for unit price, meter for distance
                double robotPrice = routeDTOs.get(0).distance() * robot.price() / 1000;
                double dronePrice = routeDTOs.get(1).distance() * drone.price() / 1000;
                
                //compute duration: km/h for speed, minutes for duration, meter for distance
                int robotDuration = (int) (routeDTOs.get(0).distance() * 60.0 / (robot.speed() * 1000.0));
                int droneDuration = (int) (routeDTOs.get(1).distance() * 60.0 / (drone.speed() * 1000.0));
                
                // routeDTOs[0] = robot route (road-based), routeDTOs[1] = drone route (straight-line)
                DeliveryOptionsResponse response = new DeliveryOptionsResponse(
                    RouteResponse.from(routeDTOs.get(0), robotDuration, robotPrice, "robot"), // robot route
                    RouteResponse.from(routeDTOs.get(1), droneDuration, dronePrice, "drone")  // drone route
                );
                return ResponseEntity.ok(response);
                
            } catch (IllegalArgumentException e) {
                logger.warn("Invalid request for route preview: {}", e.getMessage());
                return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse(e.getMessage()));
            } catch (RuntimeException e) {
                logger.error("Failed to compute route: {}", e.getMessage());
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse(e.getMessage()));
            } catch (Exception e) {
                logger.error("Unexpected error during route preview", e);
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to compute route: " + e.getMessage()));
            }
        }
    }
     
    
    @GetMapping("/tracking")
    public ResponseEntity<?> getPositionByOrderId(
            @RequestParam("id") String orderId) {
        
        boolean test = true;
        
        if (test) {
            // Hardcoded test case for ORD-001 pickup-to-end route (Ferry Building → Golden Gate Bridge)
            // Store hardcoded route entity and use actual computeAndStorePosition from RouteService
            
            try {
                // Ensure test route exists in Redis (idempotent - only stores if not exists)
                ensureTestRouteExists();
                boolean pickup = false;
                LocalDateTime pickupTime = LocalDateTime.of(2026, 1, 5, 11, 45, 0);
                LocalDateTime now = LocalDateTime.now();
                int elapsed = (int) java.time.temporal.ChronoUnit.SECONDS.between(pickupTime, now);
                
                // Use actual RouteService method with hardcoded speed of 15 km/h
                double testSpeed = 15; // km/h - hardcoded for test
                RouteService.PositionResult result = routeService.computeAndStorePosition(orderId, testSpeed, elapsed, pickup);
                LatLng position = result.getCurrentPosition();
                boolean arrived = result.isArrived();
                
                // Get the route to return encoded polyline
                RouteEntity route = routeService.getRoutesByOrderId(orderId);
                String encodedRoute = pickup ? route.getHubToPickup() : route.getPickupToEnd();
                
                PositionResponse response = new PositionResponse(orderId, encodedRoute, position.lat, position.lng);
                return ResponseEntity.ok(response);
                
            } catch (Exception e) {
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Test mode failed: " + e.getMessage()));
            }
            
        } else {
            // Real implementation
            try {
                RouteEntity route = routeService.getRoutesByOrderId(orderId);
                OrderEntity order = orderRepository.findById(orderId)
                    .orElseThrow(()->(new IllegalArgumentException()));
                boolean pickup = order.getStatus() == "dispatching";
                String encodedRoute = pickup ? route.getHubToPickup() : route.getPickupToEnd();
                PositionResponse response = new PositionResponse(orderId, encodedRoute, route.getPositionLat(),route.getPositionLng());
                return ResponseEntity.ok(response);
            } catch (IllegalArgumentException e) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(new ErrorResponse(e.getMessage()));
            } catch (Exception e) {
                return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to get position: " + e.getMessage()));
            }
        }
    }
    
    /**
     * Ensures a hardcoded test route exists in Redis for ORD-001.
     * Idempotent - only creates the route if it doesn't already exist.
     */
    private void ensureTestRouteExists() throws Exception {
        try {
            // Try to get existing route
            routeService.getRoutesByOrderId("ORD-001");
            // Route exists, nothing to do
        } catch (IllegalArgumentException e) {
            // Route doesn't exist, create it
            String hubToPickup = "dummy"; // Not used in this test
            String pickupToEnd = "gqp_GnhejVoBqDuCcF}@oBs@kBi@}A[aAUy@Mq@Ks@Gk@Cm@?m@Bk@Fk@Ji@Nk@Ri@Xk@\\i@`@g@d@e@f@c@j@a@l@]n@[p@Yp@Wt@Ut@Sx@Qx@Oz@M|@K|@I|@G~@E~@C~@A~@?~@@~@B~@D|@F|@H|@J|@L|@Nz@Rz@Tz@Vx@Zx@\\v@^v@`@t@b@r@f@r@h@p@l@n@p@l@t@j@x@h@|@f@`Ad@dAb@hA`@jA^lA\\nAZpAXrAVtATvARxAPzAN|AL~AJ`BHbBFdBDfBBhB@jB?lBAjBClBEhBGhBIhBKfBMfBOfBQdBSdBUbBWbBY`B[`B_@~Aa@~Ac@|Ae@|Ag@zAi@zAk@xAm@xAo@vAq@vAs@tAu@tAw@rAy@rA{@pA}@pA_AnA_AlAaAjAcAjAeAhAgAhAiAfAkAfAmAdAoAdAqAbAsA`AuA`AwA~@yA~@{A|@}A|@_Bz@aBz@cBx@eBx@gBv@iBv@kBt@mBt@oBr@qBr@sBp@uBp@wBn@yBn@{Bl@}Bl@_Cj@aCj@cCh@eCh@gCf@iCf@kCd@mCd@";
            double positionLat = 37.7955; // Ferry Building (start position)
            double positionLng = -122.3937;
            long hubToPickupDistance = 0; // Not used in this test
            long pickupToEndDistance = 8450; // meters
            
            routeService.storeRoute(
                "ORD-001",
                hubToPickup,
                pickupToEnd,
                positionLat,
                positionLng,
                hubToPickupDistance,
                pickupToEndDistance
            );
        }
    }
}
