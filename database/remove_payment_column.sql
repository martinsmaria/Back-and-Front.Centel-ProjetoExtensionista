-- Script para remover a coluna payment_status da tabela service_orders
-- Data: 2025-11-04

USE centel;

-- Remover coluna payment_status
ALTER TABLE service_orders DROP COLUMN IF EXISTS payment_status;
