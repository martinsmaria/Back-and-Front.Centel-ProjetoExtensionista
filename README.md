# CENTEL - Frontend (React), Backend (Node/Express) e MySQL Schema

## Requisitos
- Node.js 18+
- npm 9+
- MySQL 8+

## Backend (API)
1. Acesse a pasta backend:
```bash
cd backend
```
2. Instale as dependências:
```bash
npm install
```
3. Inicie a API (porta 4000):
```bash
npm run dev
```

Endpoints principais:
- POST `/auth/login`
- CRUD `/clients`
- CRUD `/orders` + PATCH `/orders/:id/status`, `/orders/:id/payment`, `/orders/:id/observation`
- CRUD `/items` + PATCH `/items/:id/adjust`

Obs.: a API usa dados em memória para demonstração. Conecte ao MySQL conforme sua necessidade.

## Frontend (React + Vite)
1. Acesse a pasta frontend:
```bash
cd frontend
```
2. Instale as dependências:
```bash
npm install
```
3. Crie um arquivo `.env` (opcional) para apontar a API:
```bash
VITE_API_URL=http://localhost:4000
```
4. Rode o app (porta 5173):
```bash
npm run dev
```

## Banco de Dados (MySQL)
1. Rode o script SQL:
```bash
mysql -u seu_usuario -p < database/schema.sql
```
2. Tabelas criadas:
- `users`, `clients`, `service_orders`, `items`

As senhas no seed são placeholders. Gere e armazene hashes reais (ex.: bcrypt).

## Notas
- O login no frontend usa a API com usuários demo: `admin/admin123`, `atendente/ate123`, `tecnico/tec123`.
- Permissões de tela/ações seguem os papéis: admin, atendente, técnico.
- Ajuste CORS e variáveis de ambiente conforme ambiente de execução.
