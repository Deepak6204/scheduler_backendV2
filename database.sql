-- 0. mysql -u scheduler -p -h localhost scheduler_db

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS scheduler_db;

-- 2. Create the user (only if it doesn't exist)
CREATE USER IF NOT EXISTS 'scheduler'@'localhost' IDENTIFIED BY 'Scheduler@123';

-- 3. Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON scheduler_db.* TO 'scheduler'@'localhost';

-- 4. Apply the changes
FLUSH PRIVILEGES;

-- 5 Create the tables
CREATE TABLE users (
    user_id BINARY(16) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phoneNumber VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE events (
    event_id BINARY(16) PRIMARY KEY,
    host_id BINARY(16) NOT NULL,
    guest_email VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_event_host FOREIGN KEY (host_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_event_time CHECK (end_time > start_time)
);

CREATE TABLE personal_tasks (
    task_id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    estimated_duration_minutes INT CHECK (estimated_duration_minutes > 0),
    preferred_start DATETIME,
    preferred_end DATETIME,
    is_scheduled BOOLEAN DEFAULT FALSE,
    scheduled_start DATETIME,
    scheduled_end DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_task_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_schedule_time CHECK (
        (scheduled_start IS NULL AND scheduled_end IS NULL)
        OR (scheduled_end > scheduled_start)
    )
);

CREATE TABLE user_availability (
    availability_id BINARY(16) PRIMARY KEY,
    user_id BINARY(16) NOT NULL,
    day_of_week ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_availability_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT chk_avail_time CHECK (end_time > start_time)
);