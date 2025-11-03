-- Migration script to add status/active columns to existing database
-- Run this if you already have the database created without status columns
-- Usage: mysql -u root -p centel < database/add_status_columns.sql

USE centel;

-- Add status column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS status BOOLEAN NOT NULL DEFAULT TRUE;

-- Add status column to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS status BOOLEAN NOT NULL DEFAULT TRUE;

-- Add active column to service_orders table (using 'active' to avoid confusion with 'status' field)
ALTER TABLE service_orders 
ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE;

-- Add status column to items table
ALTER TABLE items 
ADD COLUMN IF NOT EXISTS status BOOLEAN NOT NULL DEFAULT TRUE;

-- Set all existing rows to active/true
UPDATE users SET status = TRUE WHERE status IS NULL;
UPDATE clients SET status = TRUE WHERE status IS NULL;
UPDATE service_orders SET active = TRUE WHERE active IS NULL;
UPDATE items SET status = TRUE WHERE status IS NULL;

SELECT 'Migration completed successfully!' as message;
