-- Seed data for Azora Education System

-- Insert sample users
INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES
('admin@azora.world', '$2b$10$hash', 'Admin', 'User', 'admin'),
('instructor@azora.world', '$2b$10$hash', 'John', 'Instructor', 'instructor'),
('student@azora.world', '$2b$10$hash', 'Jane', 'Student', 'student')
ON CONFLICT (email) DO NOTHING;

-- Insert courses (will be populated from JSON data)
-- This will be handled by the API service
