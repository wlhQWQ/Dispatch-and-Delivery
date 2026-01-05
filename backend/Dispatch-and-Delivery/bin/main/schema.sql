-- PostgreSQL schema for hub table
CREATE TABLE IF NOT EXISTS hub (
    id VARCHAR(255) PRIMARY KEY,
    address VARCHAR(500),
    hub_lat DOUBLE PRECISION,
    hub_lng DOUBLE PRECISION
);

-- PostgreSQL schema for robot table
CREATE TABLE IF NOT EXISTS robot (
    id VARCHAR(255) PRIMARY KEY,
    available BOOLEAN DEFAULT TRUE,
    battery INTEGER DEFAULT 100,
    hub_id VARCHAR(255),
    current_lat DOUBLE PRECISION,
    current_lng DOUBLE PRECISION,
    max_weight DOUBLE PRECISION,
    speed DOUBLE PRECISION,
    price DOUBLE PRECISION,
    robot_type VARCHAR(100),
    FOREIGN KEY (hub_id) REFERENCES hub(id)
);

-- PostgreSQL schema for orders table
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    submit_time TIMESTAMP,
    user_id VARCHAR(255),
    from_address VARCHAR(500),
    to_address VARCHAR(500),
    from_lat DOUBLE PRECISION,
    from_lng DOUBLE PRECISION,
    to_lat DOUBLE PRECISION,
    to_lng DOUBLE PRECISION,
    package_id VARCHAR(255),
    status VARCHAR(50),
    price DOUBLE PRECISION,
    pickup_time TIMESTAMP,
    duration INTEGER,
    robot_id VARCHAR(255),
    robot_type VARCHAR(100),
    FOREIGN KEY (robot_id) REFERENCES robot(id)
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_submit_time ON orders(submit_time);
CREATE INDEX IF NOT EXISTS idx_orders_robot_id ON orders(robot_id);
CREATE INDEX IF NOT EXISTS idx_robot_hub_id ON robot(hub_id);
CREATE INDEX IF NOT EXISTS idx_robot_type ON robot(robot_type);

