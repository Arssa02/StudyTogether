-- ============================================================================
-- StudyTogether Database Schema
-- Social Study Session Coordination and Tracking System
-- ============================================================================

-- User Table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

-- Friend Table
-- Stores both pending friend requests and accepted friendships.
CREATE TABLE IF NOT EXISTS friend (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    friend_id INT NOT NULL,
    requested_by INT NOT NULL,
    status ENUM('pending', 'accepted') NOT NULL DEFAULT 'pending',
    created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_friend_pair (user_id, friend_id),

    CONSTRAINT fk_friend_user
        FOREIGN KEY (user_id)
        REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_friend_friend
        FOREIGN KEY (friend_id)
        REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_friend_requester
        FOREIGN KEY (requested_by)
        REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT chk_friend_order
        CHECK (user_id < friend_id),

    CONSTRAINT chk_friend_requester
        CHECK (requested_by = user_id OR requested_by = friend_id)
);

-- Study Session Table
CREATE TABLE IF NOT EXISTS study_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL,
    title VARCHAR(255) NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,

    CONSTRAINT fk_session_creator
        FOREIGN KEY (creator_id)
        REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_session_creator_id (creator_id)
);

-- Participation Table
CREATE TABLE IF NOT EXISTS participation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME NULL,

    CONSTRAINT fk_participation_user
        FOREIGN KEY (user_id)
        REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_participation_session
        FOREIGN KEY (session_id)
        REFERENCES study_session(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_participation_user_id (user_id),
    INDEX idx_participation_session_id (session_id)
);

-- Study Activity Table
CREATE TABLE IF NOT EXISTS study_activity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    participation_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    type ENUM('study', 'break') NOT NULL DEFAULT 'study',

    CONSTRAINT fk_activity_participation
        FOREIGN KEY (participation_id)
        REFERENCES participation(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    INDEX idx_activity_participation_id (participation_id)
);

-- Planned Session Table
CREATE TABLE IF NOT EXISTS planned_session (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    session_id INT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,

    CONSTRAINT fk_planned_user
        FOREIGN KEY (user_id)
        REFERENCES user(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_planned_session
        FOREIGN KEY (session_id)
        REFERENCES study_session(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE,

    INDEX idx_planned_user_id (user_id)
);