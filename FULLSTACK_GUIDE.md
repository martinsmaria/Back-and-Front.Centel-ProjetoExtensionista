# Centel System - Full Stack Application

## Architecture Overview

This application now uses a **full MySQL database** for data persistence:

```
Frontend (React + Vite)  →  Backend (Express)  →  MySQL Database
     Port 5173                  Port 4000              Port 3306
```

## Complete Setup Guide

### Prerequisites
- Node.js 16+ installed
- MySQL 8+ installed and running
- Git (optional)

---

## 🗄️ Step 1: Database Setup

### 1.1 Initialize the MySQL Database

Run the SQL initialization script:

```bash
mysql -u root -p < database/init.sql
```

**Enter password:** `1234` (or your MySQL root password)

This will:
- Create the `centel` database
- Create tables: `users`, `clients`, `service_orders`, `items`
- Insert sample data and default users

### 1.2 Verify Database Creation

```bash
mysql -u root -p
```

Then:
```sql
USE centel;
SHOW TABLES;
SELECT * FROM users;
```

You should see 3 users (admin, atendente, tecnico).

---

## 🔧 Step 2: Backend Setup

### 2.1 Install Dependencies

```bash
cd backend
npm install
```

### 2.2 Configure Environment

The `.env` file is already created with:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=centel
PORT=4000
```

**⚠️ Update these values if your MySQL configuration differs!**

### 2.3 Start the Backend Server

```bash
npm run dev
```

Expected output:
```
✓ MySQL connected successfully
API running on http://localhost:4000
```

**If you see "✗ MySQL connection failed":**
- Verify MySQL is running
- Check credentials in `.env`
- Ensure `centel` database exists

---

## 🎨 Step 3: Frontend Setup

### 3.1 Install Dependencies

```bash
cd frontend
npm install
```

### 3.2 Configure API URL

The `.env` file is already created with:

```
VITE_API_URL=http://localhost:4000
```

This tells the frontend where to find the backend API.

### 3.3 Start the Frontend Development Server

```bash
npm run dev
```

Expected output:
```
VITE ready at http://localhost:5173
```

---

## 🚀 Step 4: Access the Application

1. **Open your browser:** http://localhost:5173

2. **Login with default credentials:**
   - **Admin:** `admin` / `admin123`
   - **Atendente:** `atendente` / `ate123`
   - **Técnico:** `tecnico` / `tec123`

3. **Test the system:**
   - Dashboard displays real data from MySQL
   - Create/edit/delete clients → saves to database
   - Create service orders → links to clients in database
   - Manage stock items → updates MySQL in real-time

---

## 📊 Data Flow

### Example: Creating a New Client

1. **Frontend:** User fills out the form in `ClientsPage.jsx`
2. **API Call:** `api('/clients', { method: 'POST', body: JSON.stringify(data) })`
3. **Backend:** Express receives POST request at `/clients` endpoint
4. **Database:** MySQL executes `INSERT INTO clients (...) VALUES (...)`
5. **Response:** Backend returns the new client with `insertId`
6. **UI Update:** Frontend refreshes the client list from database

### All API Endpoints (MySQL-backed)

**Authentication:**
- `POST /auth/login` → Queries `users` table

**Clients:**
- `GET /clients` → `SELECT * FROM clients`
- `POST /clients` → `INSERT INTO clients`
- `PUT /clients/:id` → `UPDATE clients`
- `DELETE /clients/:id` → `DELETE FROM clients` (cascades to orders)

**Service Orders:**
- `GET /orders` → `SELECT ... FROM service_orders JOIN clients`
- `POST /orders` → `INSERT INTO service_orders`
- `PATCH /orders/:id/status` → `UPDATE service_orders SET status`
- `PATCH /orders/:id/payment` → `UPDATE service_orders SET payment_status`

**Stock Items:**
- `GET /items` → `SELECT * FROM items`
- `POST /items` → `INSERT INTO items`
- `PUT /items/:id` → `UPDATE items`
- `PATCH /items/:id/adjust` → `UPDATE items SET quantity`
- `DELETE /items/:id` → `DELETE FROM items`

---

## 🔍 Verifying Database Integration

### Check that data persists:

1. Create a new client in the UI
2. Stop the backend server (Ctrl+C)
3. Restart the backend: `npm run dev`
4. Reload the frontend
5. **The client should still be there!** (stored in MySQL)

### View database directly:

```bash
mysql -u root -p centel
```

```sql
-- See all clients
SELECT * FROM clients;

-- See all service orders with client names
SELECT so.*, c.name as client_name 
FROM service_orders so 
JOIN clients c ON so.client_id = c.id;

-- Check stock
SELECT * FROM items;
```

---

## 🛠️ Troubleshooting

### Frontend shows "Network Error" or empty data

**Problem:** Frontend can't reach backend

**Solution:**
1. Verify backend is running: http://localhost:4000
2. Check console for CORS errors
3. Verify `.env` has correct `VITE_API_URL`
4. Restart frontend dev server after changing `.env`

### Backend shows "MySQL connection failed"

**Problem:** Can't connect to database

**Solution:**
1. Check MySQL is running: `mysql -u root -p`
2. Verify credentials in `backend/.env`
3. Ensure database exists: `SHOW DATABASES;`
4. Check firewall/permissions

### "Table doesn't exist" errors

**Problem:** Database schema not initialized

**Solution:**
```bash
mysql -u root -p < database/init.sql
```

### Data not persisting

**Problem:** Using wrong database or backend not started

**Solution:**
1. Check backend terminal shows "✓ MySQL connected successfully"
2. Verify you're looking at the correct database: `USE centel;`

---

## 📁 Project Structure

```
├── backend/
│   ├── .env                 # MySQL credentials (DO NOT COMMIT)
│   ├── src/
│   │   ├── server.js        # Express API with MySQL queries
│   │   └── db.js            # MySQL connection pool
│   └── package.json
│
├── frontend/
│   ├── .env                 # API URL configuration
│   ├── src/
│   │   ├── App.jsx          # Main app with routing
│   │   ├── api.js           # Fetch wrapper for backend API
│   │   ├── Nav.jsx          # Navigation component
│   │   ├── Login.jsx        # Login page
│   │   ├── Dashboard.jsx    # Dashboard with stats
│   │   ├── ClientsPage.jsx  # Client management
│   │   ├── OrdersPage.jsx   # Service order management
│   │   └── StockPage.jsx    # Inventory management
│   └── package.json
│
└── database/
    └── init.sql             # Database schema and seed data
```

---

## 🔒 Security Notes

**Current Setup (Development Only):**
- Passwords stored in plain text in database
- No JWT tokens (using demo token)
- CORS enabled for all origins

**For Production:**
- Use bcrypt to hash passwords
- Implement proper JWT authentication
- Restrict CORS to specific domains
- Use environment variables for all secrets
- Add input validation and sanitization
- Implement rate limiting

---

## 🎯 Quick Start (TL;DR)

```bash
# 1. Setup database
mysql -u root -p < database/init.sql

# 2. Start backend
cd backend
npm install
npm run dev

# 3. Start frontend (new terminal)
cd frontend
npm install
npm run dev

# 4. Open browser
# http://localhost:5173
# Login: admin / admin123
```

---

## 📝 Development Workflow

1. **Backend changes:** Edit `backend/src/server.js` → Server auto-restarts
2. **Frontend changes:** Edit any `.jsx` file → Hot reload in browser
3. **Database changes:** 
   - Edit `database/init.sql`
   - Drop and recreate: `mysql -u root -p -e "DROP DATABASE centel;"`
   - Re-run: `mysql -u root -p < database/init.sql`

---

## ✅ What's Working

- ✓ MySQL database with 4 tables
- ✓ Backend API with all CRUD operations
- ✓ Frontend components using API
- ✓ User authentication (basic)
- ✓ Client management with database persistence
- ✓ Service order tracking linked to clients
- ✓ Inventory management with quantity adjustments
- ✓ Dashboard with real-time stats from database

Everything is now **database-driven** instead of in-memory!
