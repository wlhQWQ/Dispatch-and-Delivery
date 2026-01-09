package com.flagcamp.dispatchanddelivery.controller;

import com.flagcamp.dispatchanddelivery.entity.HubEntity;
import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import com.flagcamp.dispatchanddelivery.service.RobotService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AdminController
 *
 * 管理 Hub 和 Robot（包括 Drone）的增删改查接口，以及查询功能。
 *
 * 功能说明：
 * 1. Hub CRUD：
 *    - POST   /admin/hubs          : 新增 Hub
 *    - GET    /admin/hubs          : 查询所有 Hub
 *    - GET    /admin/hubs/{hubId}  : 查询单个 Hub
 *    - PUT    /admin/hubs/{hubId}  : 修改 Hub
 *    - DELETE /admin/hubs/{hubId}  : 删除 Hub
 *
 * 2. Robot / Drone CRUD：
 *    - POST   /admin/robots          : 新增 Robot / Drone
 *    - GET    /admin/robots          : 查询所有机器人
 *    - GET    /admin/robots/{robotId}: 查询单个机器人
 *    - PUT    /admin/robots/{robotId}: 修改机器人
 *    - DELETE /admin/robots/{robotId}: 删除机器人
 *
 * 3. 查询功能：
 *    - GET /admin/hubs/nearest?latitude=...&longitude=... : 查询离用户最近的 Hub
 *    例如： GET /admin/hubs/nearest?latitude=31.2&longitude=121.5
 *    - GET /admin/robots/recommend?hubId=...             : 查询该 Hub 上推荐机器人组合（最便宜 Robot + 最快 Drone）
 *    例如： GET /admin/robots/recommend?hubId=1
 */


@RestController
@RequestMapping("/admin")
public class AdminController {
    private final RobotService robotService;

    public AdminController(RobotService robotService) {
        this.robotService = robotService;
    }

    // ===================== Hub CRUD =====================
    @PostMapping("/hubs")
    @ResponseStatus(HttpStatus.CREATED)
    public HubEntity addHub(@RequestParam double latitude,
                            @RequestParam double longitude,
                            @RequestParam String address) {
        return robotService.addHub(address, latitude, longitude);
    }

    @GetMapping("/hubs")
    public List<HubEntity> getAllHubs() {
        return robotService.getAllHubs();
    }

    @GetMapping("/hubs/{hubId}")
    public HubEntity getHub(@PathVariable String hubId) {
        return robotService.getHubById(hubId)
                .orElseThrow(() -> new RuntimeException("Hub not found"));
    }

    @PutMapping("/hubs/{hubId}")
    public HubEntity updateHub(@PathVariable String hubId,
                               @RequestParam double latitude,
                               @RequestParam double longitude,
                               @RequestParam String address) {
        return robotService.updateHub(hubId, address, latitude, longitude);
    }

    @DeleteMapping("/hubs/{hubId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteHub(@PathVariable String hubId) {
        robotService.deleteHub(hubId);
    }


    // ===================== Robot CRUD =====================
    @PostMapping("/robots")
    @ResponseStatus(HttpStatus.CREATED)
    public RobotEntity addRobot(@RequestParam boolean available,
                                @RequestParam int battery,
                                @RequestParam String hubId,
                                @RequestParam double latitude,
                                @RequestParam double longitude,
                                @RequestParam double maxWeight,
                                @RequestParam double speed,
                                @RequestParam double price,
                                @RequestParam String robotType) {
        return robotService.addRobot(available, battery, hubId, latitude, longitude, maxWeight, speed, price, robotType);
    }

    @GetMapping("/robots")
    public List<RobotEntity> getAllRobots() {
        return robotService.getAllRobots();
    }

    @GetMapping("/robots/{robotId}")
    public RobotEntity getRobot(@PathVariable String robotId) {
        return robotService.getRobotById(robotId)
                .orElseThrow(() -> new RuntimeException("Robot not found"));
    }

    @PutMapping("/robots/{robotId}")
    public RobotEntity updateRobot(@PathVariable String robotId,
                                   @RequestParam boolean available,
                                   @RequestParam int battery,
                                   @RequestParam String hubId,
                                   @RequestParam double latitude,
                                   @RequestParam double longitude,
                                   @RequestParam double maxWeight,
                                   @RequestParam double speed,
                                   @RequestParam double price,
                                   @RequestParam String robotType) {
        return robotService.updateRobot(robotId, available, battery, hubId, latitude, longitude, maxWeight, speed, price, robotType);
    }

    @DeleteMapping("/robots/{robotId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRobot(@PathVariable String robotId) {
        robotService.deleteRobot(robotId);
    }

    // ===================== 查询最近 Hub =====================
    @GetMapping("/hubs/nearest")
    public HubEntity getNearestHub(@RequestParam double latitude,
                                   @RequestParam double longitude) {
        return robotService.findNearestHub(latitude, longitude)
                .orElseThrow(() -> new RuntimeException("No hubs available"));
    }
}