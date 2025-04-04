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

