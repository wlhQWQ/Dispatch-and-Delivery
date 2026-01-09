-- Sample hub data with real San Francisco locations
INSERT INTO hubs (id, address, hub_lat, hub_lng) VALUES
('HUB-001', 'Downtown Hub - Market St & 4th St, San Francisco, CA 94103', 37.7855, -122.4056),
('HUB-002', 'Waterfront Hub - Pier 33, San Francisco, CA 94111', 37.8068, -122.4025),
('HUB-003', 'Western Hub - 4816 Fulton St, San Francisco, CA 94121', 37.7749, -122.4194);

-- Sample robot data (robots and drones assigned to hubs)
INSERT INTO robots (id, available, battery, hub_id, current_lat, current_lng, max_weight, speed, price, robot_type) VALUES
-- Downtown Hub robots
('ROBOT-001', true, 95, 'HUB-001', 37.7855, -122.4056, 25.0, 15, 0.50, 'robot'),
('ROBOT-002', true, 88, 'HUB-001', 37.7855, -122.4056, 30.0, 12, 0.45, 'robot'),
('ROBOT-003', true, 92, 'HUB-001', 37.7855, -122.4056, 20.0, 18, 0.55, 'robot'),
('DRONE-001', true, 85, 'HUB-001', 37.7855, -122.4056, 10.0, 40, 1.20, 'drone'),
('DRONE-002', true, 90, 'HUB-001', 37.7855, -122.4056, 12.0, 45, 1.30, 'drone'),

-- Waterfront Hub robots
('ROBOT-004', true, 100, 'HUB-002', 37.8068, -122.4025, 28.0, 15, 2.50, 'robot'),
('ROBOT-005', true, 78, 'HUB-002', 37.8068, -122.4025, 22.0, 16, 0.52, 'robot'),
('ROBOT-006', true, 93, 'HUB-002', 37.8068, -122.4025, 25.0, 13, 0.47, 'robot'),
('DRONE-003', true, 82, 'HUB-002', 37.8068, -122.4025, 11.0, 42, 1.25, 'drone'),
('DRONE-004', true, 95, 'HUB-002', 37.8068, -122.4025, 15.0, 38, 1.15, 'drone'),

-- Western Hub robots
('ROBOT-007', true, 87, 'HUB-003', 37.7694, -122.4862, 26.0, 17, 0.53, 'robot'),
('ROBOT-008', true, 91, 'HUB-003', 37.7694, -122.4862, 24.0, 15, 0.49, 'robot'),
('ROBOT-009', true, 84, 'HUB-003', 37.7694, -122.4862, 30.0, 11, 0.44, 'robot'),
('DRONE-005', true, 88, 'HUB-003', 37.7694, -122.4862, 13.0, 43, 1.28, 'drone'),
('DRONE-006', true, 92, 'HUB-003', 37.7694, -122.4862, 14.0, 41, 1.22, 'drone');

-- Sample package data
INSERT INTO packages (id, order_id, item_description, weight) VALUES
('PKG-001', 'ORD-001', 'Electronics - Laptop Computer', 3.5),
('PKG-002', 'ORD-002', 'Books - Set of 5 Novels', 2.8),
('PKG-003', 'ORD-003', 'Clothing - Winter Jacket', 1.2),
('PKG-004', 'ORD-004', 'Kitchen Appliances - Blender', 4.5),
('PKG-005', 'ORD-005', 'Toys - Board Game Set', 1.8),
('PKG-006', 'ORD-006', 'Food - Gourmet Gift Basket', 2.3),
('PKG-007', 'ORD-007', 'Office Supplies - Desk Organizer Set', 3.2),
('PKG-008', 'ORD-008', 'Beauty Products - Skincare Set', 1.5),
('PKG-009', 'ORD-009', 'Electronics - Wireless Headphones', 0.8),
('PKG-010', 'ORD-010', 'Sports Equipment - Yoga Mat and Blocks', 2.5),
('PKG-011', 'ORD-011', 'Home Decor - Picture Frame Set', 3.8),
('PKG-012', 'ORD-012', 'Pet Supplies - Dog Toys and Treats', 2.1);

-- Sample UUID for demo users (you can generate new ones)
-- user-alice: '550e8400-e29b-41d4-a716-446655440001'
-- user-bob:   '550e8400-e29b-41d4-a716-446655440002'
-- user-charlie: '550e8400-e29b-41d4-a716-446655440003'
-- user-diana: '550e8400-e29b-41d4-a716-446655440004'
-- user-eve:   '550e8400-e29b-41d4-a716-446655440005'

-- Sample order data with real San Francisco locations and coordinates
INSERT INTO orders (id, submit_time, user_id, from_address, to_address, from_lat, from_lng, to_lat, to_lng, package_id, status, price, pickup_time, duration, robot_id, robot_type) VALUES
-- Order 1: Ferry Building to Golden Gate Bridge
('ORD-001', '2025-01-15 08:30:00', '550e8400-e29b-41d4-a716-446655440001', 
 'Ferry Building, 1 Ferry Building, San Francisco, CA 94111', 
 'Golden Gate Bridge Welcome Center, San Francisco, CA 94129',
 37.7955, -122.3937, 37.8199, -122.4783,
 'PKG-001', 'in transit', 45.99, '2026-01-05 00:30:00', 35, 'ROBOT-004', 'robot'),

-- Order 2: Union Square to Fisherman's Wharf
('ORD-002', '2025-01-16 09:15:00', '550e8400-e29b-41d4-a716-446655440002',
 'Union Square, 333 Post St, San Francisco, CA 94108',
 'Fisherman''s Wharf, Beach St & The Embarcadero, San Francisco, CA 94133',
 37.7880, -122.4074, 37.8080, -122.4177,
 'PKG-002', 'in transit', 32.50, '2025-01-16 09:45:00', 25, 'ROBOT-001', 'robot'),

-- Order 3: Chinatown to Mission District
('ORD-003', '2025-01-16 10:20:00', '550e8400-e29b-41d4-a716-446655440003',
 'Chinatown Gate, Grant Ave & Bush St, San Francisco, CA 94108',
 'Mission Dolores Park, 19th St & Dolores St, San Francisco, CA 94114',
 37.7909, -122.4056, 37.7596, -122.4269,
 'PKG-003', 'dispatching', 28.75, NULL, 30, NULL, 'robot'),

-- Order 4: Pier 39 to Castro District
('ORD-004', '2025-01-17 08:45:00', '550e8400-e29b-41d4-a716-446655440001',
 'Pier 39, Beach St & The Embarcadero, San Francisco, CA 94133',
 'Castro Theatre, 429 Castro St, San Francisco, CA 94114',
 37.8087, -122.4098, 37.7620, -122.4350,
 'PKG-004', 'dispatching', 38.25, NULL, 28, NULL, 'robot'),

-- Order 5: Haight-Ashbury to North Beach
('ORD-005', '2025-01-17 11:00:00', '550e8400-e29b-41d4-a716-446655440004',
 'Haight & Ashbury, San Francisco, CA 94117',
 'Washington Square, 601 Union St, San Francisco, CA 94133',
 37.7699, -122.4469, 37.8006, -122.4103,
 'PKG-005', 'dispatching', 31.00, NULL, 22, NULL, 'robot'),

-- Order 6: Alcatraz Landing to Lombard Street
('ORD-006', '2025-01-18 13:20:00', '550e8400-e29b-41d4-a716-446655440002',
 'Alcatraz Landing, Pier 33, San Francisco, CA 94111',
 'Lombard Street, 1099 Lombard St, San Francisco, CA 94109',
 37.8082, -122.4092, 37.8021, -122.4187,
 'PKG-006', 'complete', 18.50, '2025-01-18 13:45:00', 15, 'DRONE-003', 'drone'),

-- Order 7: Coit Tower to Oracle Park
('ORD-007', '2025-01-18 14:30:00', '550e8400-e29b-41d4-a716-446655440005',
 'Coit Tower, 1 Telegraph Hill Blvd, San Francisco, CA 94133',
 'Oracle Park, 24 Willie Mays Plaza, San Francisco, CA 94107',
 37.8024, -122.4058, 37.7786, -122.3893,
 'PKG-007', 'in transit', 42.00, '2025-01-18 15:00:00', 32, 'ROBOT-005', 'robot'),

-- Order 8: Japantown to Alamo Square
('ORD-008', '2025-01-19 09:00:00', '550e8400-e29b-41d4-a716-446655440006',
 'Japan Center, 1610 Geary Blvd, San Francisco, CA 94115',
 'Alamo Square (Painted Ladies), 710 Steiner St, San Francisco, CA 94117',
 37.7852, -122.4305, 37.7766, -122.4330,
 'PKG-008', 'dispatching', 22.50, NULL, 18, NULL, 'robot'),

-- Order 9: Embarcadero Center to SOMA (South of Market)
('ORD-009', '2025-01-19 10:15:00', '550e8400-e29b-41d4-a716-446655440003',
 'Embarcadero Center, 4 Embarcadero Center, San Francisco, CA 94111',
 'SFMOMA, 151 3rd St, San Francisco, CA 94103',
 37.7948, -122.3985, 37.7857, -122.4011,
 'PKG-009', 'complete', 15.75, '2025-01-19 10:30:00', 12, 'DRONE-001', 'drone'),

-- Order 10: Palace of Fine Arts to Presidio
('ORD-010', '2025-01-20 08:00:00', '550e8400-e29b-41d4-a716-446655440004',
 'Palace of Fine Arts, 3301 Lyon St, San Francisco, CA 94123',
 'Presidio Officers Club, 50 Moraga Ave, San Francisco, CA 94129',
 37.8029, -122.4486, 37.7989, -122.4662,
 'PKG-010', 'dispatching', 26.00, NULL, 20, NULL, 'robot'),

-- Order 11: Twin Peaks to Financial District
('ORD-011', '2025-01-20 12:30:00', '550e8400-e29b-41d4-a716-446655440005',
 'Twin Peaks Summit, 501 Twin Peaks Blvd, San Francisco, CA 94114',
 'Transamerica Pyramid, 600 Montgomery St, San Francisco, CA 94111',
 37.7544, -122.4477, 37.7952, -122.4028,
 'PKG-011', 'in transit', 48.50, '2025-01-20 13:00:00', 40, 'DRONE-005', 'drone'),

-- Order 12: AT&T Park area to Russian Hill
('ORD-012', '2025-01-21 09:45:00', '550e8400-e29b-41d4-a716-446655440006',
 'Oracle Park Plaza, 24 Willie Mays Plaza, San Francisco, CA 94107',
 'Russian Hill, Hyde St & Lombard St, San Francisco, CA 94109',
 37.7786, -122.3893, 37.8025, -122.4194,
 'PKG-012', 'dispatching', 35.25, NULL, 28, NULL, 'robot');

-- Sample message data
INSERT INTO messages (id, user_id, order_id, subject, content, type, action_required, has_read, created_at) VALUES
-- Message 1: Unread pickup notification
('MSG-001', '550e8400-e29b-41d4-a716-446655440002', 'ORD-002', 'Robot arrived at pickup', 'Your robot has arrived at pickup location. Please confirm pickup to continue.', 'ARRIVED', 'PICKUP', FALSE, '2025-01-16 09:40:00'),

-- Message 2: Read delivery notification
('MSG-002', '550e8400-e29b-41d4-a716-446655440002', 'ORD-006', 'Order delivered', 'Your order has been delivered. Please confirm delivery.', 'ARRIVED', 'DELIVERY', TRUE, '2025-01-18 14:00:00');
