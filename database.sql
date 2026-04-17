CREATE DATABASE IF NOT EXISTS smart_water_ai;
USE smart_water_ai;

CREATE TABLE IF NOT EXISTS villages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    population INT DEFAULT 0,
    health_cases INT DEFAULT 0,
    risk_level ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    water_quality ENUM('Good', 'Fair', 'Poor') DEFAULT 'Good'
);

CREATE TABLE IF NOT EXISTS sensors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    status ENUM('Active', 'Warning', 'Critical') DEFAULT 'Active',
    village_id INT,
    last_update TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id)
);

CREATE TABLE IF NOT EXISTS sensor_readings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    pressure DECIMAL(10, 2),
    flow DECIMAL(10, 2),
    ph DECIMAL(4, 2),
    turbidity DECIMAL(10, 2),
    tds DECIMAL(10, 2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    priority ENUM('Low', 'Medium', 'High') DEFAULT 'Low',
    status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS health_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    contact VARCHAR(20),
    symptoms TEXT,
    village_id INT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (village_id) REFERENCES villages(id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sensor_id INT,
    type VARCHAR(255),
    severity ENUM('Low', 'Medium', 'High'),
    message TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

-- Seed Initial Data
INSERT INTO villages (name, population, health_cases, risk_level, water_quality) VALUES
('Green Valley', 1200, 2, 'Low', 'Good'),
('Riverside', 850, 15, 'Medium', 'Fair'),
('Hilltop', 500, 1, 'Low', 'Good'),
('Marshland', 1100, 30, 'High', 'Poor');

INSERT INTO sensors (name, location, lat, lng, status, village_id) VALUES
('Node 001 - Main Inlet', 'Green Valley Entrance', 12.9716, 77.5946, 'Active', 1),
('Node 002 - East Pipeline', 'Riverside Road', 12.9720, 77.5950, 'Active', 2),
('Node 003 - Hill Station', 'Hilltop Peak', 12.9700, 77.5930, 'Active', 3),
('Node 004 - Swamp Monitor', 'Marshland Center', 12.9730, 77.5960, 'Warning', 4);
