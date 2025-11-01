-- MySQL 8+ schema for CENTEL
-- Run: mysql -u user -p < schema.sql

CREATE DATABASE IF NOT EXISTS centel CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE centel;

-- Users (app credentials)
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin','atendente','tecnico') NOT NULL DEFAULT 'atendente',
  name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Clients
CREATE TABLE IF NOT EXISTS clients (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  cpf CHAR(11) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(150) NULL,
  cep CHAR(8) NOT NULL,
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clients_cpf (cpf)
);

-- Service Orders
CREATE TABLE IF NOT EXISTS service_orders (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  client_id INT UNSIGNED NOT NULL,
  product VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  status ENUM('em-andamento','aguardando','finalizada') NOT NULL DEFAULT 'em-andamento',
  payment_status ENUM('Pendente','Pago') NOT NULL DEFAULT 'Pendente',
  observation TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_orders_client (client_id),
  CONSTRAINT fk_service_orders_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Items (Stock)
CREATE TABLE IF NOT EXISTS items (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  brand VARCHAR(100) NULL,
  model VARCHAR(100) NULL,
  quantity INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
);

-- Optional seed users (passwords should be hashed in production)
INSERT INTO users (username, password_hash, role, name) VALUES
  ('admin', '$2y$10$PLACEHOLDER_HASH', 'admin', 'Admin'),
  ('atendente', '$2y$10$PLACEHOLDER_HASH', 'atendente', 'Atendente'),
  ('tecnico', '$2y$10$PLACEHOLDER_HASH', 'tecnico', 'Técnico')
ON DUPLICATE KEY UPDATE name = VALUES(name);


