package com.flagcamp.dispatchanddelivery.model.dto;

import com.flagcamp.dispatchanddelivery.entity.RobotEntity;

/**
 * RecommendedRobots - 用于返回推荐的机器人组合
 *
 * 包含两个机器人：
 * 1. robot - Hub 上最便宜的普通机器人
 * 2. drone - Hub 上最快的无人机
 *
 * 在 AdminController 中使用 GET /robots/recommend 接口返回此 DTO
 */

public record RecommendedRobotsDto(RobotEntity robot, RobotEntity drone) {}
