-- ============================================================================
-- StudyTogether Database Schema
-- Social Study Session Coordination and Tracking System
-- ============================================================================
--
-- PURPOSE:
--   This schema file documents the database structure for the StudyTogether
--   application. It serves as both:
--   1. Version control for database design (tracked in Git)
--   2. Local development reference and reproduction script
--   3. Documentation of all tables, relationships, and constraints
--
-- NOTE:
--   The live database is hosted on faculty server: 88.200.63.148
--   Credentials configured in .env file
--
-- ============================================================================

-- StudyTogether Database Schema
-- Social Study Session Coordination and Tracking System

-- User Table
CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Friend Table (self-referencing many-to-many)
CREATE TABLE IF NOT EXISTS friend (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  friend_id INT NOT NULL,
  created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_friend_pair (user_id, friend_id),
  CONSTRAINT fk_friend_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_friend_friend FOREIGN KEY (friend_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_friend_user_id (user_id),
  INDEX idx_friend_friend_id (friend_id)
);

-- Study Session Table
CREATE TABLE IF NOT EXISTS study_session (
  id INT AUTO_INCREMENT PRIMARY KEY,
  creator_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_session_creator FOREIGN KEY (creator_id) REFERENCES user(id) ON DELETE CASCADE,
  INDEX idx_session_creator_id (creator_id)
);

-- Participation Table (user participation in sessions)
CREATE TABLE IF NOT EXISTS participation (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NOT NULL,
  joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  left_at DATETIME NULL,
  status ENUM('active', 'left') NOT NULL DEFAULT 'active',
  CONSTRAINT fk_participation_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_participation_session FOREIGN KEY (session_id) REFERENCES study_session(id) ON DELETE CASCADE,
  INDEX idx_participation_user_id (user_id),
  INDEX idx_participation_session_id (session_id)
);

-- Study Activity Table (study/break intervals)
CREATE TABLE IF NOT EXISTS study_activity (
  id INT AUTO_INCREMENT PRIMARY KEY,
  participation_id INT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NULL,
  type ENUM('study', 'break') NOT NULL DEFAULT 'study',
  CONSTRAINT fk_activity_participation FOREIGN KEY (participation_id) REFERENCES participation(id) ON DELETE CASCADE,
  INDEX idx_activity_participation_id (participation_id)
);

-- Calendar Event Table
CREATE TABLE IF NOT EXISTS calendar_event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  session_id INT NULL,
  title VARCHAR(255) NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_calendar_user FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  CONSTRAINT fk_calendar_session FOREIGN KEY (session_id) REFERENCES study_session(id) ON DELETE SET NULL,
  INDEX idx_calendar_user_id (user_id),
  INDEX idx_calendar_session_id (session_id)
);
