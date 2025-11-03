-- Create database
CREATE DATABASE IF NOT EXISTS centel;
USE centel;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100),
  cpf VARCHAR(14) NOT NULL,
  cep VARCHAR(10) NOT NULL,
  address VARCHAR(255) NOT NULL,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Service Orders table
CREATE TABLE IF NOT EXISTS service_orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  product VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'em-andamento',
  payment_status VARCHAR(50) NOT NULL DEFAULT 'Pendente',
  observation TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- Items (Stock) table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  brand VARCHAR(50),
  model VARCHAR(50),
  quantity INT NOT NULL DEFAULT 0,
  status BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default users
INSERT INTO users (username, password, role, name) VALUES
  ('admin', 'admin123', 'admin', 'Admin'),
  ('atendente', 'ate123', 'atendente', 'Atendente'),
  ('tecnico', 'tec123', 'tecnico', 'Técnico')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample clients
INSERT INTO clients (name, phone, email, cpf, cep, address) VALUES
  ('Matheus Knupp', '31 99973-1252', 'matheus@email.com', '12345678901', '35160123', 'Rua das Flores, 123, Centro'),
  ('Maria Eduarda', '31 99326-8121', 'maria@email.com', '98765432109', '35160456', 'Avenida Principal, 456, Bairro Novo');

-- Insert sample service orders
INSERT INTO service_orders (client_id, product, description, date, status, payment_status, observation) VALUES
  (1, 'TV Samsung 50"', 'Não liga', '2025-10-01', 'em-andamento', 'Pendente', 'Cliente relata que o aparelho desligou subitamente. Suspeita de fonte.'),
  (2, 'Notebook Dell', 'Tela quebrada', '2025-10-03', 'aguardando', 'Pendente', ''),
  (1, 'Soundbar JBL', 'Sem som', '2025-09-25', 'finalizada', 'Pago', 'Troca do circuito de áudio. Testado e funcionando perfeitamente.');

-- Insert sample items
INSERT INTO items (name, brand, model, quantity) VALUES
  ('Tela LED 42"', 'LG', '42LN5400', 5),
  ('Capacitor 1000uF', 'Samsung', 'Eletrolítico', 23),
  ('Cabo HDMI 2m', 'Philips', 'Genérico', 10);
