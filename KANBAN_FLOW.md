# 📊 Fluxo Kanban - Ordens de Serviço

## Visão Geral

O sistema de Ordens de Serviço (OS) da Centel agora segue um fluxo Kanban estruturado, garantindo clareza no processo de manutenção e entrega dos equipamentos.

## 🎯 Classes de Serviço

Cada OS possui uma classificação que define sua prioridade:

| Classe | Ícone | Descrição | Prioridade |
|--------|-------|-----------|------------|
| **Urgente** | 🔴 | Serviços que precisam de atenção imediata | Alta |
| **Data Fixa** | 🟡 | Serviços com prazo específico acordado | Média |
| **Comum** | 🟢 | Serviços sem urgência específica | Normal |

> 💡 **Nota:** As OS são automaticamente ordenadas por classe de serviço (urgente > data fixa > comum)

## 📋 Fluxo de Status (Kanban)

### 1️⃣ Recebido 📥
**Status inicial:** `recebido`

- A OS é criada pela recepcionista quando o cliente entrega o equipamento
- Cada OS recebe um número único
- Informações básicas são registradas: cliente, produto, descrição do problema

**Próximo passo:** Técnico confirma recebimento → `em-analise`

---

### 2️⃣ Em Análise Técnica 🔍
**Status:** `em-analise`

- Técnico analisa o equipamento
- Identifica o problema
- Prepara diagnóstico e orçamento

**Próximo passo:** Enviar orçamento → `aguardando-aprovacao`

---

### 3️⃣ Aguardando Aprovação ⏳
**Status:** `aguardando-aprovacao`

- Recepcionista entra em contato com o cliente
- Apresenta diagnóstico e orçamento
- Aguarda decisão do cliente

**Possíveis próximos passos:**
- Cliente aprova + precisa de peças → `aguardando-pecas`
- Cliente aprova + não precisa de peças → `em-manutencao`
- Cliente não aprova → OS cancelada ou volta para `recebido`

---

### 4️⃣ Aguardando Peças 📦
**Status:** `aguardando-pecas`

- Peças necessárias foram solicitadas
- Aguardando chegada dos componentes
- OS fica em espera temporária

**Próximo passo:** Peças chegam → `em-manutencao`

---

### 5️⃣ Em Manutenção 🔧
**Status:** `em-manutencao`

- Técnico está realizando o reparo
- Substituição de componentes
- Ajustes e consertos

**Próximo passo:** Reparo concluído → `em-testes`

---

### 6️⃣ Em Testes ✅
**Status:** `em-testes`

- Equipamento passou por manutenção
- Técnico realiza testes de funcionamento
- Validação de qualidade

**Próximo passo:** Testes aprovados → `pronto-entrega`

---

### 7️⃣ Pronto para Entrega 🎁
**Status:** `pronto-entrega`

- Equipamento testado e funcionando
- Recepcionista entra em contato com cliente
- Aguardando retirada do equipamento

**Próximo passo:** Cliente retira e paga → `finalizado`

---

### 8️⃣ Finalizado ✔️
**Status:** `finalizado`

- Cliente retirou o equipamento
- Pagamento realizado
- OS encerrada com sucesso

---

## 🔄 Movimentação dos Cards

| De | Para | Condição |
|----|------|----------|
| Recebido | Em Análise Técnica | Técnico confirma recebimento |
| Em Análise Técnica | Aguardando Aprovação | Técnico envia diagnóstico e orçamento |
| Aguardando Aprovação | Aguardando Peças | Cliente aprova + precisa de peças |
| Aguardando Aprovação | Em Manutenção | Cliente aprova + não precisa de peças |
| Aguardando Peças | Em Manutenção | Peças chegam |
| Em Manutenção | Em Testes | Técnico conclui conserto |
| Em Testes | Pronto para Entrega | Equipamento validado |
| Pronto para Entrega | Finalizado | Cliente retira e paga |

## 💰 Status de Pagamento

Independente do status técnico, cada OS possui um status de pagamento:

- **Pendente:** Aguardando pagamento
- **Pago:** Pagamento realizado

> ⚠️ **Importante:** Uma OS só deve ser marcada como `finalizado` após o pagamento estar marcado como `Pago`.

## 🖥️ Interface do Sistema

### Visualização Kanban
- Colunas representam cada etapa do fluxo
- Cards coloridos por classe de serviço
- Contador de OS por coluna
- Botões de navegação entre etapas
- Botão de pagamento rápido

### Visualização em Tabela
- Lista completa de todas as OS
- Filtros e ordenação
- Dropdown para mudança rápida de status
- Informações consolidadas

## 🔐 Controle de Acesso

Diferentes perfis têm diferentes permissões:

| Perfil | Permissões |
|--------|------------|
| **Recepcionista** | Criar OS, Contatar cliente, Registrar aprovação, Finalizar OS |
| **Técnico** | Analisar, Diagnosticar, Reparar, Testar, Atualizar status técnico |
| **Admin** | Acesso completo a todas as funcionalidades |

## 📊 Métricas e Indicadores

O fluxo Kanban permite acompanhar:

- Tempo médio em cada etapa
- Gargalos no processo
- Taxa de aprovação de orçamentos
- Tempo total de atendimento
- OS por classe de serviço

## 🛠️ Implementação Técnica

### Banco de Dados
```sql
-- Campos principais na tabela service_orders
status VARCHAR(50) DEFAULT 'recebido'
service_class VARCHAR(50) DEFAULT 'comum'
payment_status VARCHAR(50) DEFAULT 'Pendente'
```

### API Endpoints
- `GET /orders` - Lista todas as OS (ordenadas por classe)
- `POST /orders` - Cria nova OS
- `PATCH /orders/:id/status` - Atualiza status técnico
- `PATCH /orders/:id/payment` - Atualiza status de pagamento

### Frontend
- Componente `OrdersPage` com visualização dupla (Kanban/Tabela)
- Navegação entre etapas com validação
- Interface responsiva e intuitiva

## 📝 Boas Práticas

1. **Sempre registrar observações** importantes em cada mudança de status
2. **Atualizar o cliente** em cada etapa crítica (aprovação, pronto para entrega)
3. **Validar testes** antes de marcar como pronto para entrega
4. **Confirmar pagamento** antes de finalizar a OS
5. **Manter a classe de serviço** atualizada para priorização correta

---

**Versão:** 1.0  
**Data:** Novembro 2025  
**Sistema:** Centel - Gestão de Ordens de Serviço
