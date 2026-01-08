package com.flagcamp.dispatchanddelivery.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

/**
 * RobotEntity - Spring Data JDBC 版本
 * 对应 PostgreSQL robots 表
 *
 * 注意：
 *  hub_id 代替 JPA 的 HubEntity 引用
 *  Spring Data JDBC 不支持 @ManyToOne
 */

@Table("robots")
public record RobotEntity(
        @Id String robot_id,
        boolean available,
        int battery,
        String hub_id,        // 外键，指向 hubs.hub_id
        double latitude,
        double longitude,
        double max_weight,
        int speed,
        double price,
        String robot_type     // "robot" / "drone"
) {
}