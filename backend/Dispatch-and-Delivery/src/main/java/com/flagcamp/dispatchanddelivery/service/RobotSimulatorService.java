package com.flagcamp.dispatchanddelivery.service;
import java.util.NoSuchElementException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.flagcamp.dispatchanddelivery.entity.RobotEntity;
import com.flagcamp.dispatchanddelivery.manager.RobotSignalManager;
import com.flagcamp.dispatchanddelivery.model.event.RobotArrivedEvent;
import com.flagcamp.dispatchanddelivery.repository.RobotRepository;
import com.google.maps.model.LatLng;

@Service
//模拟机器人线程
public class RobotSimulatorService {
    
    private static final Logger logger = LoggerFactory.getLogger(RobotSimulatorService.class);
    private final RobotSignalManager signalManager;
    private final RouteService routeService; 
    private final ApplicationEventPublisher publisher; // 通知服务
    private final RobotRepository robotRepository;

    public RobotSimulatorService(RobotSignalManager signalManager, RouteService routeService,
        ApplicationEventPublisher publisher,
        RobotRepository robotRepository) {
        this.signalManager = signalManager;
        this.routeService = routeService;
        this.publisher = publisher;
        this.robotRepository = robotRepository;
    }

    @Async
    public void startRobotMission(String orderId, String robotId) {
        try {
            //找到机器人,速度
            RobotEntity robot = robotRepository.findById(robotId)
                .orElseThrow(()-> new NoSuchElementException("Robot not found"));         
            double speed = robot.speed();

            // //计算已经过去的时间
            // Instant timeNow = Instant.now();
            // int hasElapsed = (int) Duration.between(submitTime, timeNow).toSeconds();

            //走
            simulateMovement(orderId, robotId, speed, 0, true);
            
            //到了，发布消息，机器人线程休眠
            publisher.publishEvent(new RobotArrivedEvent(orderId, "PICKUP"));
            signalManager.awaitPickup(orderId);
            
            //出发去deliver
            simulateMovement(orderId, robotId, speed, 0, false);

            //到了，发布消息，机器人线程休眠
            publisher.publishEvent(new RobotArrivedEvent(orderId, "DELIVERED"));
            signalManager.awaitDeliver(orderId);

            //机器人结束订单回家
            //do nothing
        } catch (NoSuchElementException e) {
            logger.error("Robot not found for orderId: {}, robotId: {}", orderId, robotId, e);
        } catch (InterruptedException e) {
            logger.warn("Robot mission interrupted for orderId: {}", orderId, e);
            Thread.currentThread().interrupt(); // 恢复中断状态
        }

    }

    public boolean simulateMovement(String orderId, String robotId, double speed, int hasElapsed, 
        boolean pickup) throws InterruptedException{
        
        boolean arrived = false;
        
        //5秒算一次
        int intervalSeconds = 5;
        int currentElapsed = hasElapsed;

        while(!arrived){
            Thread.sleep(intervalSeconds * 1000);
            currentElapsed += intervalSeconds;
            //计算出现在位置,写入robot.
            RouteService.PositionResult result = routeService.computeAndStorePosition(orderId, speed, currentElapsed, pickup);
            LatLng position = result.getCurrentPosition();
            arrived = result.isArrived();
            robotRepository.updatePositionByRobotId(robotId, position.lat, position.lng);
        }
        
        return arrived;
    }
}
