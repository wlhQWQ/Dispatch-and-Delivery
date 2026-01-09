package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.model.dto.OrderRequestDTO;
import com.flagcamp.dispatchanddelivery.model.dto.OrderResponseDTO;
import com.flagcamp.dispatchanddelivery.model.response.PositionResponse;
import com.flagcamp.dispatchanddelivery.security.CustomUserDetails;
import com.flagcamp.dispatchanddelivery.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/dashboard/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // 1. GET /dashboard/orders -> Return list of orders for the current user
    @GetMapping
    public ResponseEntity<List<OrderResponseDTO>> getOrderList(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        // Get userId from session (stored in CustomUserDetails)
        String userId = userDetails.getUserId();
        return ResponseEntity.ok(orderService.getOrderList(userId));
    }

    // 2. POST /dashboard/orders/preview -> Preview delivery options
    @PostMapping("/deliveryOptions/preview")
    public ResponseEntity<Object> previewOptions(@RequestBody Map<String, Object> payload) {
        Double fromLat = ((Number) payload.get("from_lat")).doubleValue();
        Double fromLng = ((Number) payload.get("from_lng")).doubleValue();
        Double toLat = ((Number) payload.get("to_lat")).doubleValue();
        Double toLng = ((Number) payload.get("to_lng")).doubleValue();

        return ResponseEntity.ok(orderService.previewOptions(fromLat, fromLng, toLat, toLng));
    }

    // 3. POST /dashboard/orders/submit -> Submit order
    @PostMapping("/deliveryOptions/submit")
    public ResponseEntity<Object> submitOrder(
            @RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        OrderRequestDTO dto = new OrderRequestDTO();
        dto.setFromAddress((String) payload.get("from_address"));
        dto.setToAddress((String) payload.get("to_address"));
        dto.setDuration((Integer) payload.get("duration"));
        dto.setPrice(((Number) payload.get("price")).doubleValue());
        dto.setItemDescription((String) payload.get("item_description"));
        dto.setWeight(((Number) payload.get("weight")).doubleValue());
        dto.setRobotType((String) payload.get("robot_type"));
        dto.setRobotId((String) payload.get("robot_id"));
        dto.setRoute((String) payload.get("route"));
        dto.setDistance(((Number) payload.get("distance")).longValue());

        // Extract lat/lng coordinates from payload using snake_case
        dto.setFromLat(((Number) payload.get("from_lat")).doubleValue());
        dto.setFromLng(((Number) payload.get("from_lng")).doubleValue());
        dto.setToLat(((Number) payload.get("to_lat")).doubleValue());
        dto.setToLng(((Number) payload.get("to_lng")).doubleValue());

        // Get userId from session (stored in CustomUserDetails)
        String userId = userDetails.getUserId();
        Map<String, Object> result = orderService.submitOrder(userId, dto);
        
        // After transaction is committed, start the robot asynchronously
        if (result.get("success") != null && (Boolean) result.get("success")) {
            String orderId = (String) result.get("order_id");
            String robotId = (String) result.get("robot_id");
            orderService.startRobotAsync(orderId, robotId);
        }
        
        return ResponseEntity.ok(result);
    }

    // 4. GET /dashboard/orders/tracking?order_id=...
    @GetMapping("/tracking")
    public ResponseEntity<PositionResponse> getTracking(@RequestParam("id") String orderId) {
        return ResponseEntity.ok(orderService.getTrackingData(orderId));
    }
}