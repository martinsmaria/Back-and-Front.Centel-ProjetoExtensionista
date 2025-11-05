# 🔄 Guia de Migração - Fluxo Kanban

Este guia explica como atualizar o sistema existente para implementar o novo fluxo Kanban de Ordens de Serviço.

## 📋 Pré-requisitos

- Sistema Centel em funcionamento
- Acesso ao banco de dados MySQL
- Backup do banco de dados (recomendado)

## 🗂️ Etapas de Migração

### 1. Backup do Banco de Dados

**IMPORTANTE:** Sempre faça backup antes de qualquer migração!

```powershell
# No terminal do Windows (PowerShell)
# Substitua os valores conforme sua configuração
mysqldump -u root -p centel > centel_backup_$(Get-Date -Format 'yyyyMMdd_HHmmss').sql
```

### 2. Executar Script de Migração

Execute o script SQL de migração:

```powershell
# Opção 1: Via linha de comando
mysql -u root -p centel < database/migration_kanban_flow.sql

# Opção 2: Via MySQL Workbench ou phpMyAdmin
# Abra o arquivo migration_kanban_flow.sql e execute
```

### 3. Verificar Migração

Após executar o script, verifique se:

```sql
-- 1. Coluna service_class foi adicionada
DESCRIBE service_orders;

-- 2. Status foram atualizados
SELECT DISTINCT status FROM service_orders;

-- Resultado esperado:
-- recebido, em-analise, aguardando-aprovacao, aguardando-pecas,
-- em-manutencao, em-testes, pronto-entrega, finalizado
```

### 4. Reiniciar Backend

```powershell
# Navegue até a pasta do backend
cd backend

# Reinstale dependências (se necessário)
npm install

# Reinicie o servidor
npm start
```

### 5. Reiniciar Frontend

```powershell
# Navegue até a pasta do frontend
cd frontend

# Reinstale dependências (se necessário)
npm install

# Reinicie o servidor de desenvolvimento
npm run dev
```

## 🔍 Mapeamento de Status

A migração converte automaticamente os status antigos para os novos:

| Status Antigo | Status Novo | Descrição |
|---------------|-------------|-----------|
| `em-andamento` | `em-manutencao` | Equipamento em reparo |
| `aguardando` | `aguardando-pecas` | Aguardando componentes |
| `finalizada` | `finalizado` | Serviço concluído |

### Novos Status Disponíveis

Os seguintes status foram adicionados:

1. ✅ `recebido` - Status inicial de toda OS
2. ✅ `em-analise` - Equipamento em diagnóstico
3. ✅ `aguardando-aprovacao` - Aguardando decisão do cliente
4. ✅ `em-testes` - Validação após manutenção
5. ✅ `pronto-entrega` - Aguardando retirada do cliente

## 🎯 Classes de Serviço

A migração adiciona o campo `service_class` com valor padrão `'comum'`.

Para atualizar OS existentes com outras classes:

```sql
-- Marcar OS urgentes (exemplo: OS com menos de 2 dias)
UPDATE service_orders 
SET service_class = 'urgente' 
WHERE DATEDIFF(NOW(), date) <= 2 
AND active = TRUE;

-- Marcar OS com data fixa (exemplo: manualmente)
UPDATE service_orders 
SET service_class = 'data-fixa' 
WHERE id IN (1, 5, 10); -- IDs das OS com prazo
```

## 🧪 Testar Funcionalidades

Após a migração, teste:

### No Frontend

1. ✅ Acessar página de Ordens de Serviço
2. ✅ Verificar visualização Kanban
3. ✅ Alternar para visualização em Tabela
4. ✅ Criar nova OS com classe de serviço
5. ✅ Mover OS entre colunas no Kanban
6. ✅ Atualizar status via dropdown na tabela
7. ✅ Marcar pagamento como Pago

### No Backend

1. ✅ GET /orders - Listar OS ordenadas por classe
2. ✅ POST /orders - Criar OS com service_class
3. ✅ PATCH /orders/:id/status - Atualizar com novos status
4. ✅ PATCH /orders/:id/payment - Atualizar pagamento

## ⚠️ Problemas Comuns

### Erro: "Column 'service_class' doesn't exist"

**Solução:** Execute novamente o script de migração

```sql
ALTER TABLE service_orders 
ADD COLUMN service_class VARCHAR(50) NOT NULL DEFAULT 'comum' AFTER status;
```

### Erro: "Unknown column 'status'"

**Solução:** Verifique se a tabela service_orders existe

```sql
SHOW TABLES LIKE 'service_orders';
```

### Frontend não carrega OS

**Solução:** 
1. Verifique console do navegador (F12)
2. Confirme que backend está rodando
3. Verifique se o campo `serviceClass` está sendo retornado pela API

## 🔄 Rollback (Reverter Migração)

Se necessário reverter a migração:

```sql
-- 1. Restaurar status antigos
UPDATE service_orders SET status = 'em-andamento' WHERE status = 'em-manutencao';
UPDATE service_orders SET status = 'aguardando' WHERE status = 'aguardando-pecas';
UPDATE service_orders SET status = 'finalizada' WHERE status = 'finalizado';

-- 2. Remover coluna service_class
ALTER TABLE service_orders DROP COLUMN service_class;
```

Depois restaure os arquivos antigos do backend e frontend do backup/git.

## 📝 Notas Importantes

1. **Status Padrão:** Novas OS criadas começam com status `recebido`
2. **Classe Padrão:** Se não especificada, a classe é `comum`
3. **Ordenação:** OS são automaticamente ordenadas por: urgente > data-fixa > comum
4. **Compatibilidade:** Status antigos ainda funcionam no código (para transição)
5. **Validação:** API valida apenas status válidos do fluxo Kanban

## 📊 Dados Após Migração

Estrutura completa da tabela `service_orders`:

```sql
id                 INT
client_id          INT
product            VARCHAR(100)
description        TEXT
date               DATE
status             VARCHAR(50)      -- Status técnico Kanban
service_class      VARCHAR(50)      -- Novo campo: urgente/data-fixa/comum
payment_status     VARCHAR(50)      -- Pago/Pendente
observation        TEXT
active             BOOLEAN
created_at         TIMESTAMP
```

## ✅ Checklist de Migração

- [ ] Backup do banco de dados criado
- [ ] Script de migração executado com sucesso
- [ ] Coluna `service_class` verificada
- [ ] Status convertidos corretamente
- [ ] Backend reiniciado
- [ ] Frontend reiniciado
- [ ] Testes de criação de OS realizados
- [ ] Testes de mudança de status realizados
- [ ] Visualização Kanban funcionando
- [ ] Visualização Tabela funcionando
- [ ] Documentação KANBAN_FLOW.md revisada

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs do backend no terminal
2. Verifique console do navegador (F12) no frontend
3. Consulte a documentação em `KANBAN_FLOW.md`
4. Revise este guia de migração

---

**Data de Criação:** Novembro 2025  
**Versão:** 1.0  
**Sistema:** Centel - Gestão de Ordens de Serviço
