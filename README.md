# CENTEL - Sistema de Gestão de Ordens de Serviço

Sistema completo para gestão de assistência técnica com fluxo Kanban, incluindo Frontend (React), Backend (Node/Express) e Banco de Dados MySQL.

## 🎯 Principais Funcionalidades

- ✅ **Fluxo Kanban Completo** - 8 etapas de acompanhamento de OS
- ✅ **Classes de Serviço** - Priorização (Urgente, Data Fixa, Comum)
- ✅ **Gestão de Clientes** - CRUD completo com soft delete
- ✅ **Controle de Estoque** - Gerenciamento de peças e componentes
- ✅ **Controle de Pagamentos** - Acompanhamento financeiro
- ✅ **Múltiplas Visualizações** - Kanban Board e Tabela
- ✅ **Autenticação** - Sistema de login com perfis de acesso

## 📋 Requisitos

- Node.js 18+
- npm 9+
- MySQL 8+

## 🚀 Instalação Rápida

### 1. Banco de Dados (MySQL)

```bash
# Criar banco de dados e estrutura inicial
mysql -u root -p < database/init.sql

# OU para migração de versão anterior
mysql -u root -p centel < database/migration_kanban_flow.sql
```

### 2. Backend (API)

```bash
cd backend
npm install
npm run dev
```

O servidor estará rodando em `http://localhost:4000`

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

## 📊 Fluxo Kanban de Ordens de Serviço

O sistema implementa um fluxo Kanban com 8 etapas:

1. **Recebido** 📥 - Equipamento entregue pelo cliente
2. **Em Análise Técnica** 🔍 - Diagnóstico do problema
3. **Aguardando Aprovação** ⏳ - Orçamento enviado ao cliente
4. **Aguardando Peças** 📦 - Esperando componentes necessários
5. **Em Manutenção** 🔧 - Reparo em andamento
6. **Em Testes** ✅ - Validação do funcionamento
7. **Pronto para Entrega** 🎁 - Aguardando retirada
8. **Finalizado** ✔️ - Entregue e pago

### Classes de Serviço

- 🔴 **Urgente** - Prioridade máxima
- 🟡 **Data Fixa** - Prazo específico
- 🟢 **Comum** - Fluxo normal

📖 **Documentação completa:** Veja [KANBAN_FLOW.md](KANBAN_FLOW.md)

## 🔌 API Endpoints

### Autenticação
- `POST /auth/login` - Login de usuário

### Clientes
- `GET /clients` - Listar clientes ativos
- `POST /clients` - Criar novo cliente
- `PUT /clients/:id` - Atualizar cliente
- `DELETE /clients/:id` - Remover cliente (soft delete)

### Ordens de Serviço
- `GET /orders` - Listar OS (ordenadas por classe de serviço)
- `POST /orders` - Criar nova OS
- `PUT /orders/:id` - Atualizar OS completa
- `PATCH /orders/:id/status` - Atualizar status técnico
- `PATCH /orders/:id/payment` - Atualizar status de pagamento
- `PATCH /orders/:id/observation` - Atualizar observações
- `DELETE /orders/:id` - Remover OS (soft delete)

### Estoque (Itens)
- `GET /items` - Listar itens em estoque
- `POST /items` - Adicionar novo item
- `PUT /items/:id` - Atualizar item
- `PATCH /items/:id/adjust` - Ajustar quantidade
- `DELETE /items/:id` - Remover item (soft delete)

## 👥 Usuários Demo

| Usuário | Senha | Perfil | Permissões |
|---------|-------|--------|------------|
| admin | admin123 | Administrador | Acesso total |
| atendente | ate123 | Recepcionista | Clientes, OS, Visualizações |
| tecnico | tec123 | Técnico | OS, Estoque, Status técnicos |

⚠️ **IMPORTANTE:** Altere as senhas padrão em produção!

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- **users** - Usuários do sistema
- **clients** - Clientes da assistência técnica
- **service_orders** - Ordens de serviço (OS)
- **items** - Estoque de peças e componentes

### Campos Importantes

```sql
service_orders:
  - status: recebido | em-analise | aguardando-aprovacao | 
            aguardando-pecas | em-manutencao | em-testes | 
            pronto-entrega | finalizado
            
  - service_class: urgente | data-fixa | comum
  
  - payment_status: Pendente | Pago
```

## 📁 Estrutura do Projeto

```
.
├── backend/
│   ├── src/
│   │   ├── db.js           # Conexão MySQL
│   │   └── server.js       # API Express
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api.js          # Cliente API
│   │   ├── App.jsx         # Componente principal
│   │   ├── Login.jsx       # Tela de login
│   │   ├── Dashboard.jsx   # Dashboard inicial
│   │   ├── ClientsPage.jsx # Gestão de clientes
│   │   ├── OrdersPage.jsx  # Gestão de OS (Kanban)
│   │   ├── StockPage.jsx   # Gestão de estoque
│   │   └── Nav.jsx         # Navegação
│   ├── index.html
│   └── package.json
│
├── database/
│   ├── init.sql                    # Criação inicial do BD
│   ├── migration_kanban_flow.sql   # Migração para Kanban
│   └── schema.sql                  # Schema alternativo
│
├── KANBAN_FLOW.md          # Documentação do fluxo Kanban
├── MIGRATION_GUIDE.md      # Guia de migração
└── README.md               # Este arquivo
```

## 🔧 Configuração

### Backend (.env)

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=centel
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:4000
```

## 🔄 Migração de Versão Anterior

Se você já possui o sistema rodando com os status antigos (`em-andamento`, `aguardando`, `finalizada`), siga o guia de migração:

📖 **Guia completo:** [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md)

Resumo:
```bash
# 1. Backup
mysqldump -u root -p centel > backup.sql

# 2. Executar migração
mysql -u root -p centel < database/migration_kanban_flow.sql

# 3. Reiniciar backend e frontend
```

## 🧪 Testando o Sistema

1. Acesse `http://localhost:5173`
2. Faça login com `admin` / `admin123`
3. Navegue até "Ordens de Serviço"
4. Alterne entre visualização Kanban e Tabela
5. Crie uma nova OS e teste a movimentação entre etapas

## 📚 Documentação Adicional

- [KANBAN_FLOW.md](KANBAN_FLOW.md) - Documentação completa do fluxo Kanban
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Guia de migração de dados
- [FULLSTACK_GUIDE.md](FULLSTACK_GUIDE.md) - Guia técnico completo
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guia de testes
- [SOFT_DELETE_GUIDE.md](SOFT_DELETE_GUIDE.md) - Guia de soft delete

## ⚙️ Tecnologias Utilizadas

### Backend
- Node.js + Express
- MySQL2
- CORS
- Morgan (logging)
- dotenv

### Frontend
- React 18
- Vite
- Font Awesome (ícones)

## 🛡️ Segurança

⚠️ **Atenção para Produção:**

1. Use bcrypt para hash de senhas
2. Implemente JWT para autenticação
3. Configure CORS adequadamente
4. Use HTTPS
5. Valide e sanitize inputs
6. Implemente rate limiting
7. Use variáveis de ambiente para credenciais

## 📝 Notas

- O sistema usa soft delete para manter histórico
- As OS são ordenadas automaticamente por prioridade (classe de serviço)
- Cada mudança de status pode ter observações registradas
- O sistema suporta visualização Kanban e Tabela
- Perfis de usuário controlam acesso a funcionalidades

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido como Projeto Extensionista.

---

**Versão:** 2.0 (com Fluxo Kanban)  
**Data:** Novembro 2025  
**Sistema:** CENTEL - Gestão de Ordens de Serviço
