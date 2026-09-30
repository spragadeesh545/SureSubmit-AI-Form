CREATE DATABASE IF NOT EXISTS suresubmit_db;
USE suresubmit_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS forms (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'DRAFT',
    user_id BIGINT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS fields (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    label VARCHAR(255) NOT NULL,
    input_type VARCHAR(50) NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    visible_when_field_id BIGINT,
    visible_when_operator VARCHAR(50),
    visible_when_value VARCHAR(255),
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (visible_when_field_id) REFERENCES fields(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS field_options (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    field_id BIGINT NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS cross_field_rules (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    primary_field_id BIGINT NOT NULL,
    operator VARCHAR(50) NOT NULL,
    secondary_field_id BIGINT,
    static_value VARCHAR(255),
    error_message TEXT NOT NULL,
    description TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE,
    FOREIGN KEY (primary_field_id) REFERENCES fields(id) ON DELETE CASCADE,
    FOREIGN KEY (secondary_field_id) REFERENCES fields(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS form_submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    form_id BIGINT NOT NULL,
    payload_json TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

-- Older installs were created by Hibernate ddl-auto=update, which added submitted_at
-- without a default, so historical rows can be NULL. Backfill them once.
UPDATE form_submissions SET submitted_at = NOW() WHERE submitted_at IS NULL;
