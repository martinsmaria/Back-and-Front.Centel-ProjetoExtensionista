# 🔌 Exemplos de Uso da API - Fluxo Kanban

Este documento contém exemplos práticos de como usar a API para trabalhar com o fluxo Kanban de Ordens de Serviço.

## 🌐 Base URL

```
http://localhost:4000
```

## 📝 Exemplos de Requisições

### 1. Criar Nova Ordem de Serviço

**Endpoint:** `POST /orders`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body - OS Comum:**
```json
{
  "clientId": 1,
  "product": "TV Samsung 50\"",
  "description": "Não liga, sem imagem",
  "serviceClass": "comum"
}
```

**Body - OS Urgente:**
```json
{
  "clientId": 2,
  "product": "Notebook Dell Inspiron",
  "description": "Tela quebrada, precisa urgente para trabalho",
  "serviceClass": "urgente"
}
```

**Body - OS Data Fixa:**
```json
{
  "clientId": 3,
  "product": "iPad Pro",
  "description": "Bateria viciada, cliente viaja em 5 dias",
  "serviceClass": "data-fixa"
}
```

**Resposta (201 Created):**
```json
{
  "id": 10,
  "clientId": 1,
  "clientName": "Matheus Knupp",
  "product": "TV Samsung 50\"",
  "description": "Não liga, sem imagem",
  "date": "2025-11-04",
  "status": "recebido",
  "serviceClass": "comum",
  "paymentStatus": "Pendente",
  "observation": ""
}
```

---

### 2. Listar Todas as Ordens de Serviço

**Endpoint:** `GET /orders`

**Resposta (200 OK):**
```json
[
  {
    "id": 5,
    "clientId": 2,
    "clientName": "Maria Eduarda",
    "product": "iPhone 13",
    "description": "Tela quebrada",
    "date": "2025-11-03",
    "status": "aguardando-pecas",
    "serviceClass": "urgente",
    "paymentStatus": "Pendente",
    "observation": "Tela original pedida ao fornecedor"
  },
  {
    "id": 8,
    "clientId": 1,
    "clientName": "Matheus Knupp",
    "product": "MacBook Air",
    "description": "Não carrega",
    "date": "2025-11-02",
    "status": "em-manutencao",
    "serviceClass": "data-fixa",
    "paymentStatus": "Pendente",
    "observation": "Substituindo entrada USB-C"
  },
  {
    "id": 10,
    "clientId": 3,
    "clientName": "João Silva",
    "product": "PlayStation 5",
    "description": "Não lê discos",
    "date": "2025-11-01",
    "status": "recebido",
    "serviceClass": "comum",
    "paymentStatus": "Pendente",
    "observation": ""
  }
]
```

> 💡 **Nota:** As OS são automaticamente ordenadas por classe (urgente > data-fixa > comum)

---

### 3. Atualizar Status da OS (Fluxo Kanban)

**Endpoint:** `PATCH /orders/:id/status`

#### Exemplo 1: Mover de "Recebido" para "Em Análise"

**URL:** `PATCH /orders/10/status`

**Body:**
```json
{
  "status": "em-analise"
}
```

**Resposta (200 OK):**
```json
{
  "id": 10,
  "clientId": 3,
  "clientName": "João Silva",
  "product": "PlayStation 5",
  "description": "Não lê discos",
  "date": "2025-11-01",
  "status": "em-analise",
  "serviceClass": "comum",
  "paymentStatus": "Pendente",
  "observation": ""
}
```

#### Exemplo 2: Aprovar e Aguardar Peças

**URL:** `PATCH /orders/10/status`

**Body:**
```json
{
  "status": "aguardando-pecas"
}
```

#### Exemplo 3: Iniciar Manutenção

**URL:** `PATCH /orders/10/status`

**Body:**
```json
{
  "status": "em-manutencao"
}
```

#### Exemplo 4: Finalizar OS

**URL:** `PATCH /orders/10/status`

**Body:**
```json
{
  "status": "finalizado"
}
```

**Fluxo Completo de Status Válidos:**
```
recebido → em-analise → aguardando-aprovacao → 
aguardando-pecas → em-manutencao → em-testes → 
pronto-entrega → finalizado
```

---

### 4. Atualizar Status de Pagamento

**Endpoint:** `PATCH /orders/:id/payment`

**URL:** `PATCH /orders/10/payment`

**Body - Marcar como Pago:**
```json
{
  "paymentStatus": "Pago"
}
```

**Body - Voltar para Pendente:**
```json
{
  "paymentStatus": "Pendente"
}
```

**Resposta (200 OK):**
```json
{
  "id": 10,
  "clientId": 3,
  "clientName": "João Silva",
  "product": "PlayStation 5",
  "description": "Não lê discos",
  "date": "2025-11-01",
  "status": "finalizado",
  "serviceClass": "comum",
  "paymentStatus": "Pago",
  "observation": "Leitor de disco substituído e testado"
}
```

---

### 5. Adicionar Observação

**Endpoint:** `PATCH /orders/:id/observation`

**URL:** `PATCH /orders/10/observation`

**Body:**
```json
{
  "observation": "Cliente aprovou orçamento de R$ 350,00. Peça em estoque, início imediato."
}
```

**Resposta (200 OK):**
```json
{
  "id": 10,
  "clientId": 3,
  "clientName": "João Silva",
  "product": "PlayStation 5",
  "description": "Não lê discos",
  "date": "2025-11-01",
  "status": "em-manutencao",
  "serviceClass": "comum",
  "paymentStatus": "Pendente",
  "observation": "Cliente aprovou orçamento de R$ 350,00. Peça em estoque, início imediato."
}
```

---

### 6. Atualizar OS Completa

**Endpoint:** `PUT /orders/:id`

**URL:** `PUT /orders/10`

**Body:**
```json
{
  "product": "PlayStation 5 Digital",
  "description": "Não lê discos - Modelo Digital sem leitor",
  "status": "em-testes",
  "serviceClass": "urgente",
  "paymentStatus": "Pago",
  "observation": "Troca do HD interno. Cliente pagou antecipado."
}
```

**Resposta (200 OK):**
```json
{
  "id": 10,
  "clientId": 3,
  "clientName": "João Silva",
  "product": "PlayStation 5 Digital",
  "description": "Não lê discos - Modelo Digital sem leitor",
  "date": "2025-11-01",
  "status": "em-testes",
  "serviceClass": "urgente",
  "paymentStatus": "Pago",
  "observation": "Troca do HD interno. Cliente pagou antecipado."
}
```

---

### 7. Excluir OS (Soft Delete)

**Endpoint:** `DELETE /orders/:id`

**URL:** `DELETE /orders/10`

**Resposta (204 No Content):**
```
(sem corpo de resposta)
```

> ⚠️ **Nota:** A OS não é removida do banco, apenas marcada como `active = FALSE`

---

## 🔄 Exemplos de Fluxos Completos

### Fluxo 1: OS Urgente - Conserto Rápido

```bash
# 1. Criar OS Urgente
POST /orders
{
  "clientId": 5,
  "product": "iPhone 14 Pro",
  "description": "Tela quebrada, cliente precisa urgente",
  "serviceClass": "urgente"
}
# Status: recebido

# 2. Técnico analisa
PATCH /orders/15/status
{"status": "em-analise"}

# 3. Adiciona observação do diagnóstico
PATCH /orders/15/observation
{"observation": "Display LCD danificado. Orçamento: R$ 1.200,00"}

# 4. Cliente aprova imediatamente
PATCH /orders/15/status
{"status": "aguardando-aprovacao"}

# 5. Peça em estoque, inicia manutenção
PATCH /orders/15/status
{"status": "em-manutencao"}

# 6. Conserto concluído
PATCH /orders/15/status
{"status": "em-testes"}

# 7. Testes OK
PATCH /orders/15/status
{"status": "pronto-entrega"}

# 8. Cliente retira e paga
PATCH /orders/15/payment
{"paymentStatus": "Pago"}

PATCH /orders/15/status
{"status": "finalizado"}
```

---

### Fluxo 2: OS Comum - Aguardando Peças

```bash
# 1. Criar OS Comum
POST /orders
{
  "clientId": 7,
  "product": "TV LG 55\"",
  "description": "Sem imagem, apenas som",
  "serviceClass": "comum"
}

# 2. Análise técnica
PATCH /orders/20/status
{"status": "em-analise"}

PATCH /orders/20/observation
{"observation": "Placa T-CON queimada. Orçamento: R$ 450,00"}

# 3. Aguardando aprovação do cliente
PATCH /orders/20/status
{"status": "aguardando-aprovacao"}

# 4. Cliente aprova, mas peça precisa ser pedida
PATCH /orders/20/status
{"status": "aguardando-pecas"}

PATCH /orders/20/observation
{"observation": "Peça pedida ao fornecedor. Prazo: 5-7 dias úteis"}

# 5. Peça chega, inicia manutenção
PATCH /orders/20/status
{"status": "em-manutencao"}

# 6. Manutenção concluída
PATCH /orders/20/status
{"status": "em-testes"}

# 7. Testes aprovados
PATCH /orders/20/status
{"status": "pronto-entrega"}

# 8. Finalização
PATCH /orders/20/payment
{"paymentStatus": "Pago"}

PATCH /orders/20/status
{"status": "finalizado"}
```

---

## ⚠️ Erros Comuns

### Erro 400: Status Inválido

**Requisição:**
```json
PATCH /orders/10/status
{
  "status": "status-invalido"
}
```

**Resposta:**
```json
{
  "message": "Status inválido"
}
```

**Solução:** Use apenas status válidos do fluxo Kanban.

---

### Erro 404: OS Não Encontrada

**Requisição:**
```json
PATCH /orders/9999/status
{
  "status": "em-analise"
}
```

**Resposta:**
```json
{
  "message": "OS não encontrada"
}
```

**Solução:** Verifique se a OS existe e está ativa (`active = TRUE`).

---

### Erro 400: Campos Obrigatórios Ausentes

**Requisição:**
```json
POST /orders
{
  "clientId": 1
}
```

**Resposta:**
```json
{
  "message": "Campos obrigatórios ausentes"
}
```

**Solução:** Envie todos os campos obrigatórios: `clientId`, `product`, `description`.

---

## 🧪 Testes com cURL

### Criar OS
```bash
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "clientId": 1,
    "product": "Teste Produto",
    "description": "Teste Descrição",
    "serviceClass": "urgente"
  }'
```

### Atualizar Status
```bash
curl -X PATCH http://localhost:4000/orders/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "em-analise"}'
```

### Listar OS
```bash
curl http://localhost:4000/orders
```

---

## 🧪 Testes com PowerShell

### Criar OS
```powershell
$body = @{
    clientId = 1
    product = "Teste Produto"
    description = "Teste Descrição"
    serviceClass = "urgente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/orders" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body
```

### Atualizar Status
```powershell
$body = @{
    status = "em-analise"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/orders/1/status" `
  -Method Patch `
  -ContentType "application/json" `
  -Body $body
```

### Listar OS
```powershell
Invoke-RestMethod -Uri "http://localhost:4000/orders"
```

---

## 📊 Status do Sistema

### Verificar API
```bash
curl http://localhost:4000/
```

**Resposta:**
```json
{
  "status": "ok",
  "service": "centel-backend"
}
```

---

## 🔐 Autenticação (Para Implementação Futura)

Atualmente a API não requer autenticação, mas quando implementar JWT:

```bash
# Login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Resposta
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "username": "admin",
    "role": "admin",
    "name": "Admin"
  }
}

# Usar token nas requisições
curl -X POST http://localhost:4000/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \
  -d '{"clientId": 1, "product": "...", ...}'
```

---

**Versão:** 1.0  
**Data:** Novembro 2025  
**Sistema:** CENTEL - API de Ordens de Serviço
