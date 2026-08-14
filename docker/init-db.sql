-- Initialize database with required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgvector";

-- Create initial admin user (password: admin123456)
-- In production, change this immediately and use proper secrets
INSERT INTO users (id, email, password_hash, full_name, role, is_active, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'admin@company.com',
    '$2b$12$LQv3c1yqBo9SkvXS7QTJPe0dIN6Dh.5nR3gHnFnmN6CjJ9B/K9K3e',
    'System Administrator',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
