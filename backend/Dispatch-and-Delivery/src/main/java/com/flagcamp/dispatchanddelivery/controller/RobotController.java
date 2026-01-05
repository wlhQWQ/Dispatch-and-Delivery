package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.model.ErrorResponse;
import com.flagcamp.dispatchanddelivery.model.RobotOptionsResponse;
import com.flagcamp.dispatchanddelivery.service.RobotService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/robots")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class RobotController {
    
    private final RobotService robotService;
    
    public RobotController(RobotService robotService) {
        this.robotService = robotService;
    }
    
    /**
     * Get robot delivery options for a specific hub.
     * Returns the cheapest robot and fastest drone available in the hub.
     * 
     * @param hubId The ID of the hub
     * @return RobotOptionsResponse containing cheapest robot and fastest drone
     */
    @GetMapping("/options/{hubId}")
    public ResponseEntity<?> getRobotOptions(@PathVariable String hubId) {
        try {
            RobotOptionsResponse options = robotService.findRobotsByHubId(hubId);
            return ResponseEntity.ok(options);
        } catch (IllegalArgumentException e) {
            return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorResponse("Failed to get robot options: " + e.getMessage()));
        }
    }
}
