# Frontend → API → Database Mapping

## Overview

All frontend pages now communicate with the MySQL database through the Express API. No data is stored in memory - everything persists in the database.

---

## 🔐 Login.jsx → users table

**Component:** `Login.jsx`
**API Endpoint:** `POST /auth/login`
**Database Query:** `SELECT * FROM users WHERE username = ? AND password = ?`

### Flow:
1. User enters username and password
2. Frontend calls `api('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })`
3. Backend queries `users` table
4. Returns user object with role (admin, atendente, tecnico)

### Database Table:
```sql
users (id, username, password, role, name, created_at)
```

---

## 👥 ClientsPage.jsx → clients table

**Component:** `ClientsPage.jsx`
**API Endpoints:**
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update existing client
- `DELETE /clients/:id` - Delete client

### Database Queries:
```sql
-- Get all clients
SELECT * FROM clients ORDER BY id

-- Create client
INSERT INTO clients (name, phone, email, cpf, cep, address) VALUES (?, ?, ?, ?, ?, ?)

-- Update client
UPDATE clients SET name = ?, phone = ?, email = ?, cpf = ?, cep = ?, address = ? WHERE id = ?

-- Delete client (cascades to service_orders)
DELETE FROM clients WHERE id = ?
```

### Database Table:
```sql
clients (id, name, phone, email, cpf, cep, address, created_at, updated_at)
```

### Features:
- ✓ Create/Edit/Delete clients
- ✓ Form validation
- ✓ All data persists in MySQL
- ✓ Deleting a client also deletes their service orders (CASCADE)

---

## 📋 OrdersPage.jsx → service_orders + clients tables

**Component:** `OrdersPage.jsx`
**API Endpoints:**
- `GET /orders` - List all orders with client names (JOIN)
- `POST /orders` - Create new order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/payment` - Update payment status

### Database Queries:
```sql
-- Get all orders with client names (JOIN)
SELECT 
  so.id, 
  so.client_id as clientId, 
  c.name as clientName, 
  so.product, 
  so.description,
  so.date, 
  so.status, 
  so.payment_status as paymentStatus, 
  so.observation
FROM service_orders so
LEFT JOIN clients c ON so.client_id = c.id
ORDER BY so.id DESC

-- Create order
INSERT INTO service_orders 
  (client_id, product, description, date, status, payment_status, observation) 
VALUES (?, ?, ?, ?, 'em-andamento', 'Pendente', '')

-- Update status
UPDATE service_orders SET status = ? WHERE id = ?

-- Update payment
UPDATE service_orders SET payment_status = ? WHERE id = ?
```

### Database Tables:
```sql
service_orders (id, client_id, product, description, date, status, payment_status, observation)
clients (id, name, ...)
```

### Features:
- ✓ Create orders linked to existing clients (dropdown)
- ✓ Change status: em-andamento, aguardando, finalizada
- ✓ Update payment status: Pendente, Pago
- ✓ Foreign key relationship to clients
- ✓ Shows client name via JOIN query

---

## 📦 StockPage.jsx → items table

**Component:** `StockPage.jsx`
**API Endpoints:**
- `GET /items` - List all items
- `POST /items` - Create new item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item
- `PATCH /items/:id/adjust` - Adjust quantity (+/-)

### Database Queries:
```sql
-- Get all items
SELECT * FROM items ORDER BY id

-- Create item
INSERT INTO items (name, brand, model, quantity) VALUES (?, ?, ?, ?)

-- Update item
UPDATE items SET name = ?, brand = ?, model = ?, quantity = ? WHERE id = ?

-- Delete item
DELETE FROM items WHERE id = ?

-- Adjust quantity (add or subtract)
SELECT * FROM items WHERE id = ?
UPDATE items SET quantity = ? WHERE id = ?
```

### Database Table:
```sql
items (id, name, brand, model, quantity, created_at, updated_at)
```

### Features:
- ✓ Create/Edit/Delete stock items
- ✓ Quick +1/-1 quantity buttons
- ✓ Prevents negative quantities
- ✓ All changes persist in MySQL

---

## 📊 Dashboard.jsx → Computed from database

**Component:** `Dashboard.jsx`
**Data Source:** Props from `App.jsx` which fetches from API

### Data Flow:
1. `App.jsx` calls `refreshAll()` on login:
   ```javascript
   const [o, c, i] = await Promise.all([
     api('/orders'),   // FROM service_orders table
     api('/clients'),  // FROM clients table
     api('/items'),    // FROM items table
   ]);
   ```

2. Dashboard computes statistics from real database data:
   - **Orders in Progress:** Filters where `status = 'em-andamento'`
   - **Waiting for Parts:** Filters where `status = 'aguardando'`
   - **Total Stock Items:** Sums `quantity` from all items
   - **Registered Clients:** Counts total clients

### Features:
- ✓ Real-time stats from MySQL
- ✓ Updates when data changes
- ✓ No hardcoded values

---

## 🔄 Complete Data Flow Example

### Creating a Service Order:

```
1. USER ACTION (Frontend)
   └─ User selects client from dropdown
   └─ Enters product and description
   └─ Clicks "Nova OS"

2. FRONTEND (OrdersPage.jsx)
   └─ form.clientId = "1"
   └─ form.product = "TV Samsung"
   └─ form.description = "Não liga"
   └─ api('/orders', { method: 'POST', body: JSON.stringify(form) })

3. BACKEND (server.js)
   └─ Receives POST /orders
   └─ Validates clientId exists in database
   └─ Executes: INSERT INTO service_orders (...) VALUES (...)

4. MYSQL DATABASE
   └─ Inserts new row into service_orders table
   └─ Returns insertId (e.g., 4)

5. BACKEND RESPONSE
   └─ Returns JSON: { id: 4, clientId: 1, clientName: "Matheus", ... }

6. FRONTEND UPDATE
   └─ Calls load() to refresh list
   └─ Executes: GET /orders
   └─ Backend queries: SELECT ... FROM service_orders JOIN clients
   └─ UI displays updated list with new order
```

---

## 🌐 API Configuration

### Frontend (`frontend/.env`)
```
VITE_API_URL=http://localhost:4000
```

### Backend (`backend/.env`)
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=centel
PORT=4000
```

### API Client (`frontend/src/api.js`)
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  // Error handling and JSON parsing
  return res.json();
}
```

---

## ✅ Verification Checklist

### Test that everything uses the database:

1. **Login Test:**
   - [ ] Can login with `admin` / `admin123`
   - [ ] Check backend queries users table

2. **Client Persistence:**
   - [ ] Create a new client
   - [ ] Restart backend server
   - [ ] Client still appears (stored in MySQL)

3. **Order Linking:**
   - [ ] Create order for a client
   - [ ] Check database: `SELECT * FROM service_orders WHERE client_id = 1;`
   - [ ] Frontend shows correct client name

4. **Stock Updates:**
   - [ ] Add item, set quantity to 10
   - [ ] Click +1 button 3 times
   - [ ] Check database: `SELECT quantity FROM items WHERE id = 1;`
   - [ ] Should show 13

5. **Dashboard Stats:**
   - [ ] Create 3 orders with status "em-andamento"
   - [ ] Dashboard shows "3" in "Ordens em Andamento"
   - [ ] Change one to "finalizada"
   - [ ] Dashboard updates to "2"

---

## 🎯 Key Differences from Before

### BEFORE (In-Memory):
```javascript
let clients = [
  { id: 1, name: 'Matheus', ... },
  { id: 2, name: 'Maria', ... }
];

// Data lost on server restart!
```

### NOW (MySQL):
```javascript
const [rows] = await db.query('SELECT * FROM clients');
// Data persists forever!
```

---

## 📝 Summary

**Every frontend component now:**
1. ✅ Uses `api()` function to call backend
2. ✅ Backend executes SQL queries on MySQL
3. ✅ Data persists across restarts
4. ✅ All CRUD operations work end-to-end
5. ✅ Foreign key relationships maintained
6. ✅ Real-time updates reflected in UI

**The entire application is now database-driven!** 🎉
