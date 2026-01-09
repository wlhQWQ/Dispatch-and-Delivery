package com.flagcamp.dispatchanddelivery.service;

import com.flagcamp.dispatchanddelivery.entity.OrderEntity;
import com.flagcamp.dispatchanddelivery.entity.PackageEntity;
import com.flagcamp.dispatchanddelivery.entity.RouteEntity;
import com.flagcamp.dispatchanddelivery.manager.RobotSignalManager;
import com.flagcamp.dispatchanddelivery.model.dto.OrderRequestDTO;
import com.flagcamp.dispatchanddelivery.model.dto.OrderResponseDTO;
import com.flagcamp.dispatchanddelivery.model.dto.RouteDTO;
import com.flagcamp.dispatchanddelivery.model.enums.OrderStatus;
import com.flagcamp.dispatchanddelivery.model.response.DeliveryOptionsResponse;
import com.flagcamp.dispatchanddelivery.model.response.PositionResponse;
import com.flagcamp.dispatchanddelivery.model.response.RouteResponse;
import com.flagcamp.dispatchanddelivery.repository.OrderRepository;
import com.flagcamp.dispatchanddelivery.repository.PackageRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private static final Logger logger = LoggerFactory.getLogger(OrderService.class);
    
    private final OrderRepository orderRepository;
    private final PackageRepository packageRepository;
    private final RouteService routeService;
    private final RobotService robotService;
    private final RobotSimulatorService robotSimulatorService;
    private final RobotSignalManager robotSignalManager;

    public List<OrderResponseDTO> getOrderList(String userId) {
        logger.info("Retrieving orders for user: {}", userId);
        
        List<OrderEntity> orders = orderRepository.findByUserId(userId);
        
        return orders.stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public OrderEntity findById(String orderId) {
        return orderRepository.findById(orderId).orElseThrow();
    }

    private OrderResponseDTO convertToResponseDTO(OrderEntity entity) {
        // Fetch package information
        String itemDescription = "";
        float weight = 0.0f;
        
        if (entity.getPackageId() != null) {
            PackageEntity packageEntity = packageRepository.findById(entity.getPackageId()).orElse(null);
            if (packageEntity != null) {
                itemDescription = packageEntity.getItemDescription();
                weight = (float) packageEntity.getWeight();
            }
        }
        
        return OrderResponseDTO.builder()
                .order_id(entity.getOrderId())
                .from_address(entity.getFromAddress())
                .to_address(entity.getToAddress())
                .status(entity.getStatus())
                .route("") // Route info could be fetched separately if needed
                .pickup_time(entity.getPickupTime() != null ?
                        entity.getPickupTime() : LocalDateTime.now())
                .duration(entity.getDuration())
                .price((float) entity.getPrice())
                .item_description(itemDescription)
                .weight(weight)
                .robot_type(entity.getRobotType())
                .build();
    }

    public DeliveryOptionsResponse previewOptions(Double fromLat, Double fromLng, Double toLat, Double toLng) {
        logger.info("Computing preview options from ({}, {}) to ({}, {})", fromLat, fromLng, toLat, toLng);

        try {
            // 1. 计算路径信息
            List<RouteDTO> routes = routeService.computeRoute(fromLat, fromLng, toLat, toLng);
            RouteDTO robotRoute = routes.get(0);
            RouteDTO droneRoute = routes.get(1);

            // 2. 找最近的Hub
            var nearestHub = robotService.findNearestHub(fromLat, fromLng);
            if (nearestHub.isEmpty()) {
                throw new RuntimeException("No hub found");
            }
            String hubId = nearestHub.get().getHubId();
            logger.info("Found nearest hub: {}", hubId);

            // 3. 从该Hub获取最便宜的机器人和最快的无人机
            var cheapestRobot = robotService.findCheapestRobot(hubId);
            var fastestDrone = robotService.findFastestDrone(hubId);

            // 4. 计算机器人选项
            RouteResponse robotResponse;
            if (cheapestRobot.isPresent()) {
                var robot = cheapestRobot.get();
                int robotDuration = calculateDuration(robotRoute.distance(), robot.getSpeed());
                double robotPrice = calculatePrice(robotRoute.distance(), "robot"); 
                robotResponse = RouteResponse.from(robotRoute, robotDuration, robotPrice, "robot", robot.getRobotId());
                logger.info("Robot option - ID: {}, Duration: {}min, Price: ${}", robot.getRobotId(), robotDuration, robotPrice);
            } else {
                // 如果没有可用机器人，使用默认值
                int robotDuration = calculateDuration(robotRoute.distance(), "robot");
                double robotPrice = calculatePrice(robotRoute.distance(), "robot");
                robotResponse = RouteResponse.from(robotRoute, robotDuration, robotPrice, "robot", null);
                logger.warn("No available robot found, using default pricing");
            }

            // 5. 计算无人机选项
            RouteResponse droneResponse;
            if (fastestDrone.isPresent()) {
                var drone = fastestDrone.get();
                int droneDuration = calculateDuration(droneRoute.distance(), drone.getSpeed());
                double dronePrice = calculatePrice(droneRoute.distance(), "drone"); 
                droneResponse = RouteResponse.from(droneRoute, droneDuration, dronePrice, "drone", drone.getRobotId());
                logger.info("Drone option - ID: {}, Duration: {}min, Price: ${}", drone.getRobotId(), droneDuration, dronePrice);
            } else {
                // 如果没有可用无人机，使用默认值
                int droneDuration = calculateDuration(droneRoute.distance(), "drone");
                double dronePrice = calculatePrice(droneRoute.distance(), "drone");
                droneResponse = RouteResponse.from(droneRoute, droneDuration, dronePrice, "drone", null);
                logger.warn("No available drone found, using default pricing");
            }

            return new DeliveryOptionsResponse(robotResponse, droneResponse);

        } catch (Exception e) {
            logger.error("Failed to compute preview options", e);
            return new DeliveryOptionsResponse(null, null);
        }
    }

    @Transactional
    //之前版本有机器人开跑但提交失败的问题，所以加入回滚
    public Map<String, Object> submitOrder(String userId, OrderRequestDTO orderRequest) {
        logger.info("Submitting order for user: {}", userId);

        try {
            String orderId = UUID.randomUUID().toString();

            // 1. 创建订单实体
            OrderEntity orderEntity = new OrderEntity();
            orderEntity.setOrderId(orderId);
            orderEntity.setUserId(userId);
            orderEntity.setFromAddress(orderRequest.getFromAddress());
            orderEntity.setToAddress(orderRequest.getToAddress());
            orderEntity.setFromLat(orderRequest.getFromLat());
            orderEntity.setFromLng(orderRequest.getFromLng());
            orderEntity.setToLat(orderRequest.getToLat());
            orderEntity.setToLng(orderRequest.getToLng());
            orderEntity.setStatus(OrderStatus.PENDING.name());
            orderEntity.setPrice(orderRequest.getPrice());
            orderEntity.setDuration(orderRequest.getDuration());
            orderEntity.setRobotType(orderRequest.getRobotType());
            orderEntity.setSubmitTime(LocalDateTime.now());

            // 2. 创建包裹实体
            String packageId = UUID.randomUUID().toString();
            PackageEntity packageEntity = new PackageEntity();
            packageEntity.setPackageId(packageId);
            packageEntity.setOrderId(orderId);
            packageEntity.setItemDescription(orderRequest.getItemDescription());
            packageEntity.setWeight(orderRequest.getWeight());
            
            // 设置订单中的包裹ID
            orderEntity.setPackageId(packageId);

            // 3. 通过robotId获取robot信息和hub位置
            if (orderRequest.getRobotId() == null || orderRequest.getRobotId().isEmpty()) {
                throw new IllegalArgumentException("Robot ID is required");
            }

            var selectedRobot = robotService.getRobotById(orderRequest.getRobotId());
            if (selectedRobot.isEmpty() || !selectedRobot.get().isAvailable()) {
                throw new IllegalArgumentException("Selected robot is not available");
            }

            var robot = selectedRobot.get();
            orderEntity.setRobotId(robot.getRobotId());
            logger.info("Using selected robot {} for order {}", robot.getRobotId(), orderId);

            // 4. 获取hub信息
            var hub = robotService.getHubById(robot.getHubId());
            if (hub.isEmpty()) {
                throw new IllegalArgumentException("Hub not found for robot: " + robot.getHubId());
            }

            var hubEntity = hub.get();
            double hubLat = hubEntity.getHubLat();
            double hubLng = hubEntity.getHubLng();
            logger.info("Found hub {} at ({}, {}) for robot {}", hubEntity.getHubId(), hubLat, hubLng, robot.getRobotId());

            // 5. 计算从hub到起始点的路由
            List<RouteDTO> hubToStartRoutes = routeService.computeRoute(
                hubLat, hubLng,
                orderRequest.getFromLat(), orderRequest.getFromLng()
            );

            // 6. 根据机器人类型选择合适的路由
            RouteDTO hubToStartRoute;
            if ("DRONE".equalsIgnoreCase(orderRequest.getRobotType())) {
                hubToStartRoute = hubToStartRoutes.get(1); // 无人机使用直线路径
                logger.info("Using drone route from hub to start point");
            } else {
                hubToStartRoute = hubToStartRoutes.get(0); // 机器人使用道路路径
                logger.info("Using robot route from hub to start point");
            }

            // 7. 存储完整路由信息
            long hubToStartDistance = hubToStartRoute.distance();

            // 使用前端提供的距离（从preview选项中获得）
            long startToEndDistance = orderRequest.getDistance();

            routeService.storeRoute(
                orderId,
                hubToStartRoute.encodedPolyline(), // hub到起始点路径
                orderRequest.getRoute(),           // 起始点到终点路径（前端提供）
                hubLat,
                hubLng,
                hubToStartDistance,
                startToEndDistance
            );
            logger.info("Route stored for order {} - Hub to start: {}m, Start to end: {}m",
                orderId, hubToStartDistance, startToEndDistance);

            // 8. 保存包裹到数据库
            packageRepository.save(packageEntity);
            logger.info("Package {} created for order {}", packageId, orderId);
            
            // 9. 保存订单到数据库（先设为PENDING状态）
            orderEntity.setStatus(OrderStatus.PENDING.name());
            orderRepository.save(orderEntity);
            logger.info("Order {} saved to database with status: PENDING", orderId);

            // 10. 返回详细的订单信息（事务会在方法结束时自动提交）
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("order_id", orderId);
            response.put("status", "PENDING");
            response.put("robot_id", robot.getRobotId());
            response.put("hub_id", hubEntity.getHubId());
            response.put("message", "Order submitted successfully");

            return response;

        } catch (Exception e) {
            logger.error("Failed to submit order for user {}: {}", userId, e.getMessage(), e);

            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to submit order: " + e.getMessage());
            return response;
        }
    }

    public PositionResponse getTrackingData(String orderId) {
        logger.info("Getting tracking data for order: {}", orderId);

        try {
            // Get route information
            RouteEntity route = routeService.getRoutesByOrderId(orderId);
            // Get order to check status
            OrderEntity order = orderRepository.findById(orderId).orElseThrow();
            

            // Get current position from route
            double currentLat = route.getPositionLat();
            double currentLng = route.getPositionLng();

            // Choose route based on order status
            String encodedRoute;
            if ("DISPATCHING".equalsIgnoreCase(order.getStatus()) || 
                "PENDING".equalsIgnoreCase(order.getStatus())) {
                // Robot is going from hub to pickup
                encodedRoute = route.getHubToPickup();
                logger.info("Tracking data for order {} (DISPATCHING): using hubToPickup route", orderId);
            } else {
                // Robot is going from pickup to delivery (in transit, complete, etc.)
                encodedRoute = route.getPickupToEnd();
                logger.info("Tracking data for order {} (IN TRANSIT): using pickupToEnd route", orderId);
            }
                logger.info("Tracking data for order {}: position ({}, {})", orderId, currentLat, currentLng);

            return new PositionResponse(orderId, encodedRoute, currentLat, currentLng);

        } catch (Exception e) {
            logger.error("Failed to get tracking data for order: {}", orderId, e);
            throw new RuntimeException("Failed to get tracking data: " + e.getMessage(), e);
        }
    }



    //mock
    private int calculateDuration(double distance, String robotType) {
        // Convert distance from meters to kilometers
        double distanceKm = distance / 1000.0;
        // Average speed: robot ~5 km/h, drone ~15 km/h
        double speed = "DRONE".equalsIgnoreCase(robotType) ? 15.0 : 5.0;
        return (int) Math.ceil((distanceKm / speed) * 60); // Duration in minutes
    }

    private int calculateDuration(double distance, double speedKmH) {
        // Convert distance from meters to kilometers
        double distanceKm = distance / 1000.0;
        // Calculate duration in minutes
        return (int) Math.ceil((distanceKm / speedKmH) * 60);
    }

    //mock
    private double calculatePrice(double distance, String robotType) {
        // Convert distance from meters to kilometers
        double distanceKm = distance / 1000.0;
        // Base price + distance-based pricing
        double basePrice = "DRONE".equalsIgnoreCase(robotType) ? 5.0 : 3.0;
        double pricePerKm = "DRONE".equalsIgnoreCase(robotType) ? 2.0 : 1.0;
        return basePrice + (distanceKm * pricePerKm);
    }

    /**
     * 启动机器人任务（异步）- 公共方法，供Controller调用
     * 此方法会启动机器人，并将订单状态更新为DISPATCHING
     */
    @Async
    public void startRobotAsync(String orderId, String robotId) {
        try {
            logger.info("Starting robot {} for order {}", robotId, orderId);
            
            // 启动机器人模拟器
            robotSimulatorService.startRobotMission(orderId, robotId);
            
            // 更新订单状态为DISPATCHING
            OrderEntity order = orderRepository.findById(orderId).orElseThrow();
            order.setStatus(OrderStatus.DISPATCHING.name());
            order.setPickupTime(LocalDateTime.now());
            orderRepository.save(order);
            
            logger.info("Robot {} started successfully, order {} status updated to DISPATCHING", robotId, orderId);
            
        } catch (Exception e) {
            logger.error("Failed to start robot {} for order {}: {}", robotId, orderId, e.getMessage(), e);
            // 如果启动失败，订单状态保持为PENDING
        }
    }



    @Transactional
    public void confirmPickup(String orderId, String userId, 
        LocalDateTime pickupTime){
        //update order
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow();
        order.setPickupTime(pickupTime);
        order.setStatus("in transit");
        orderRepository.save(order);

        //wake up robot
        robotSignalManager.userConfirmedPickup(orderId);
        
    }

    @Transactional
    public void confirmDelivery(String orderId, String userId
    ){
        System.out.println("=== confirmDelivery called ===");
        System.out.println("orderId: " + orderId);
        System.out.println("userId: " + userId);
        
        //update order
        OrderEntity order = orderRepository.findById(orderId)
            .orElseThrow();
        System.out.println("Order found, current status: " + order.getStatus());
        
        order.setStatus("delivered");
        orderRepository.save(order);
        System.out.println("Order status updated to: delivered");
        
        //update 
        robotSignalManager.userConfirmedDeliver(orderId);
        System.out.println("Robot signal sent for delivery confirmation");
    }

    
}
