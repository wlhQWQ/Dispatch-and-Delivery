package com.flagcamp.dispatchanddelivery.service;

import com.flagcamp.dispatchanddelivery.entity.HubEntity;
import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import com.flagcamp.dispatchanddelivery.repository.HubRepository;
import com.flagcamp.dispatchanddelivery.repository.RobotRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

/**
 * RobotService - 业务逻辑
 *
 * 1. Hub 和 Robot 完整 CRUD
 * 2. 查找最近 Hub
 * 3. 推荐机器人：获取最快 / 最便宜  drone / robot
 */

@Service
public class RobotService {
    private final HubRepository hubRepository;
    private final RobotRepository robotRepository;

    public RobotService(
            HubRepository hubRepository,
            RobotRepository robotRepository) {
        this.hubRepository = hubRepository;
        this.robotRepository = robotRepository;
    }


    // ===================== Hub CRUD =====================
    public HubEntity addHub(String address, double hubLat, double hubLng) {
        HubEntity hub = new HubEntity(null, address, hubLat, hubLng);
        return hubRepository.save(hub);
    }

    public List<HubEntity> getAllHubs() {
        return hubRepository.findAll();
    }

    public Optional<HubEntity> getHubById(String hubId) {
        return hubRepository.findById(hubId);
    }

    public HubEntity updateHub(String hubId, String address, double hubLat, double hubLng) {
        HubEntity updated = new HubEntity(hubId, address, hubLat, hubLng);
        return hubRepository.save(updated);
    }

    public void deleteHub(String hubId) {
        hubRepository.deleteById(hubId);
    }


    // ===================== Robot CRUD =====================
    public RobotEntity addRobot(boolean available,
                                int battery,
                                String hubId,
                                double currentLat,
                                double currentLng,
                                double maxWeight,
                                double speed,
                                double price,
                                String robotType) {
        RobotEntity robot = new RobotEntity(null, available, battery, hubId, currentLat, currentLng, maxWeight, speed, price, robotType);
        return robotRepository.save(robot);
    }

    public List<RobotEntity> getAllRobots() {
        return (List<RobotEntity>) robotRepository.findAll();
    }

    public Optional<RobotEntity> getRobotById(String robotId) {
        return robotRepository.findById(robotId);
    }

    public RobotEntity updateRobot(String robotId,
                                   boolean available,
                                   int battery,
                                   String hubId,
                                   double currentLat,
                                   double currentLng,
                                   double maxWeight,
                                   double speed,
                                   double price,
                                   String robotType) {
        RobotEntity updated = new RobotEntity(robotId, available, battery, hubId, currentLat, currentLng, maxWeight, speed, price, robotType);
        return robotRepository.save(updated);
    }

    public void deleteRobot(String robotId) {
        robotRepository.deleteById(robotId);
    }


    // ===================== 查找最近 Hub =====================
    public Optional<HubEntity> findNearestHub(double userLat, double userLng) {
        return hubRepository.findAll().stream()
                .min(Comparator.comparingDouble(hub -> distance(hub.getHubLat(), hub.getHubLng(), userLat, userLng)));
    }

    // 简单直线距离公式
    private double distance(double lat1, double lng1, double lat2, double lng2) {
        double dx = lat1 - lat2;
        double dy = lng1 - lng2;
        return Math.sqrt(dx * dx + dy * dy);
    }


    // ===================== 推荐机器人 =====================
    // 通用方法
    private Optional<RobotEntity> findBestBy(String hubId, String type,
                                             Comparator<RobotEntity> comparator) {
        return robotRepository.findByHubIdAndAvailableTrueAndRobotType(hubId, type)
                .stream()
                .min(comparator); // 或 max，根据比较器调整
    }

    // 找最便宜的
    public Optional<RobotEntity> findCheapestRobot(String hubId) {
        return findBestBy(hubId, "robot", Comparator.comparingDouble(RobotEntity::getPrice));
    }

    public Optional<RobotEntity> findCheapestDrone(String hubId) {
        return findBestBy(hubId, "drone", Comparator.comparingDouble(RobotEntity::getPrice));
    }

    // 找最快的（这里 max 用 reverseOrder 或直接调整比较器）
    public Optional<RobotEntity> findFastestRobot(String hubId) {
        return findBestBy(hubId, "robot", Comparator.comparingDouble(RobotEntity::getSpeed).reversed());
    }

    public Optional<RobotEntity> findFastestDrone(String hubId) {
        return findBestBy(hubId, "drone", Comparator.comparingDouble(RobotEntity::getSpeed).reversed());
    }

    // 根据订单ID更新机器人位置 - 这个方法需要和RouteService配合
    public com.google.maps.model.LatLng updateRobotPositionByOrderId(String orderId) {
        // 这里应该调用RouteService来计算和更新位置
        // 为了简化，这里返回一个默认位置，实际实现应该和RouteService配合
        throw new RuntimeException("Robot position update not implemented yet - should integrate with RouteService");
    }
}