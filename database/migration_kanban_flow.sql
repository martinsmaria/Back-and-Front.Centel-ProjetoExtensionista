-- Migração para implementar o fluxo Kanban nas Ordens de Serviço
-- Data: 2025-11-04

USE centel;

-- Adicionar coluna service_class (classe de serviço) se não existir
ALTER TABLE service_orders 
ADD COLUMN IF NOT EXISTS service_class VARCHAR(50) NOT NULL DEFAULT 'comum' AFTER status;

-- Atualizar status existentes para o novo padrão Kanban
-- Mapeamento:
-- 'em-andamento' -> 'em-manutencao'
-- 'aguardando' -> 'aguardando-pecas'
-- 'finalizada' -> 'finalizado'

UPDATE service_orders SET status = 'em-manutencao' WHERE status = 'em-andamento';
UPDATE service_orders SET status = 'aguardando-pecas' WHERE status = 'aguardando';
UPDATE service_orders SET status = 'finalizado' WHERE status = 'finalizada';

-- Comentário sobre os status válidos no fluxo Kanban:
-- 1. 'recebido' - OS criada, equipamento recebido
-- 2. 'em-analise' - Técnico analisando o equipamento
-- 3. 'aguardando-aprovacao' - Aguardando aprovação do cliente para orçamento
-- 4. 'aguardando-pecas' - Aprovado, aguardando chegada de peças
-- 5. 'em-manutencao' - Técnico realizando o reparo
-- 6. 'em-testes' - Equipamento sendo testado
-- 7. 'pronto-entrega' - Pronto para o cliente retirar
-- 8. 'finalizado' - Cliente retirou e pagou

-- Comentário sobre as classes de serviço:
-- 'urgente' - Prioridade alta
-- 'data-fixa' - Tem prazo específico
-- 'comum' - Prioridade normal
