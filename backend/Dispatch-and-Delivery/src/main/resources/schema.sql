-- PostgreSQL schema for hubs table (plural)
DROP TABLE IF EXISTS hubs, robots, messages, orders, packages, users, authorities;

CREATE TABLE IF NOT EXISTS hubs (
    id VARCHAR(255) PRIMARY KEY,
    address VARCHAR(500),
    hub_lat DOUBLE PRECISION,
    hub_lng DOUBLE PRECISION
);

-- PostgreSQL schema for robots table (plural)
CREATE TABLE IF NOT EXISTS robots (
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
    CONSTRAINT fk_hub FOREIGN KEY (hub_id) REFERENCES hubs (id) ON DELETE CASCADE
);

-- PostgreSQL schema for packages table (plural)
CREATE TABLE IF NOT EXISTS packages (
    id VARCHAR(255) PRIMARY KEY,
    order_id VARCHAR(255),
    item_description VARCHAR(500),
    weight DOUBLE PRECISION
);

-- PostgreSQL schema for orders table (plural)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY,
    submit_time TIMESTAMP,
    user_id VARCHAR(36),
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
    FOREIGN KEY (robot_id) REFERENCES robots(id),
    FOREIGN KEY (package_id) REFERENCES packages(id)
);


CREATE TABLE users
(
    id         VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text NOT NULL,
    email      TEXT UNIQUE          NOT NULL,
    password   TEXT                 NOT NULL,
    enabled    BOOLEAN DEFAULT TRUE NOT NULL
);

CREATE TABLE authorities
(
    id        SERIAL PRIMARY KEY NOT NULL,
    email     TEXT               NOT NULL,
    authority TEXT               NOT NULL,
    CONSTRAINT fk_customer FOREIGN KEY (email) REFERENCES users (email) ON DELETE CASCADE
);


-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(255),
    subject VARCHAR(100) NOT NULL,
    content TEXT,
    type VARCHAR(30) NOT NULL,
    action_required VARCHAR(20),
    has_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_packages_order_id ON packages(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_submit_time ON orders(submit_time);
CREATE INDEX IF NOT EXISTS idx_orders_robot_id ON orders(robot_id);
CREATE INDEX IF NOT EXISTS idx_orders_package_id ON orders(package_id);
CREATE INDEX IF NOT EXISTS idx_robots_hub_id ON robots(hub_id);
CREATE INDEX IF NOT EXISTS idx_robots_type ON robots(robot_type);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

