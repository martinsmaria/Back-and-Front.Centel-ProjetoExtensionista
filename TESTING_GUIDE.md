# Centel System - Quick Test Guide

## 🚀 Quick Start (3 Steps)

### Step 1: Setup Database
```bash
mysql -u root -p < database/init.sql
```
Password: `1234`

### Step 2: Start Backend
```bash
cd backend
npm install
npm run dev
```
You should see: `✓ MySQL connected successfully`

### Step 3: Start Frontend (new terminal)
```bash
cd frontend
npm install
npm run dev
```
Open: http://localhost:5173

---

## 🧪 Test the Database Integration

### Test 1: Login (users table)
1. Login with: `admin` / `admin123`
2. ✅ Success means backend queried MySQL users table

### Test 2: View Existing Data
1. Go to "Clientes" page
2. You should see 2 clients (Matheus and Maria)
3. ✅ Data loaded from MySQL clients table

### Test 3: Create a Client (INSERT)
1. Fill the form:
   - Nome: `João Silva`
   - CPF: `11122233344`
   - Telefone: `31 99999-9999`
   - CEP: `30130100`
   - Email: `joao@email.com`
   - Endereço: `Rua Teste, 100`
2. Click "Adicionar"
3. ✅ Client appears in table (saved to MySQL)

### Test 4: Verify Persistence
1. Stop backend server (Ctrl+C)
2. Restart: `npm run dev`
3. Refresh frontend
4. ✅ João Silva still appears (persisted in database)

### Test 5: Check Database Directly
```bash
mysql -u root -p centel
```
```sql
SELECT * FROM clients;
```
✅ You should see João Silva in the database!

### Test 6: Create Service Order (JOIN)
1. Go to "Ordens de Serviço"
2. Select "João Silva" from dropdown
3. Produto: `Notebook HP`
4. Descrição: `Tela preta`
5. Click "Nova OS"
6. ✅ Order created and linked to client

### Test 7: Verify Foreign Key
```sql
SELECT so.id, c.name, so.product 
FROM service_orders so 
JOIN clients c ON so.client_id = c.id;
```
✅ Shows order linked to João Silva

### Test 8: Update Order Status (UPDATE)
1. In "Ordens de Serviço", click status buttons
2. Click "Aguardando Peças" icon
3. ✅ Status changes in UI

### Test 9: Verify in Database
```sql
SELECT id, product, status FROM service_orders WHERE product = 'Notebook HP';
```
✅ Status should be 'aguardando'

### Test 10: Stock Management (items table)
1. Go to "Estoque"
2. Add item:
   - Nome: `Teclado USB`
   - Marca: `Logitech`
   - Modelo: `K120`
   - Qtd: `15`
3. Click "+1" button 5 times
4. ✅ Quantity becomes 20

### Test 11: Verify Stock in Database
```sql
SELECT name, quantity FROM items WHERE name = 'Teclado USB';
```
✅ Shows quantity = 20

### Test 12: Dashboard Stats
1. Go to "Dashboard"
2. Check the numbers:
   - "Ordens em Andamento"
   - "Aguardando Peças"
   - "Total de Itens em Estoque"
   - "Clientes Cadastrados"
3. ✅ Numbers match data in MySQL tables

---

## 🔍 Advanced Tests

### Test Database Cascade Delete
```sql
-- Before delete
SELECT COUNT(*) FROM service_orders WHERE client_id = 1;

-- Delete client (frontend or SQL)
DELETE FROM clients WHERE id = 1;

-- After delete
SELECT COUNT(*) FROM service_orders WHERE client_id = 1;
-- Should return 0 (orders deleted automatically)
```

### Test API Endpoints Directly

**Get all clients:**
```bash
curl http://localhost:4000/clients
```

**Create client:**
```bash
curl -X POST http://localhost:4000/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","cpf":"12312312312","phone":"31999999999","cep":"30000000","address":"Rua Teste, 1"}'
```

**Get all orders:**
```bash
curl http://localhost:4000/orders
```

---

## ✅ All Tests Passed?

If everything works:
- ✅ Frontend communicates with backend API
- ✅ Backend executes SQL queries on MySQL
- ✅ Data persists across restarts
- ✅ All CRUD operations work
- ✅ Foreign keys maintain data integrity
- ✅ Dashboard shows real-time stats

**Your application is fully database-driven!** 🎉

---

## 🐛 Common Issues

### "Network Error" in Frontend
- Check backend is running: `curl http://localhost:4000`
- Verify `.env` has `VITE_API_URL=http://localhost:4000`
- Restart frontend after changing `.env`

### "MySQL connection failed"
- Check MySQL is running: `mysql -u root -p`
- Verify credentials in `backend/.env`
- Ensure database exists: `SHOW DATABASES;`

### Empty dropdown in "Ordens de Serviço"
- Check clients exist: `SELECT * FROM clients;`
- Check API: `curl http://localhost:4000/clients`
- Check browser console for errors

### Changes not saving
- Check backend terminal for SQL errors
- Verify database connection: `✓ MySQL connected successfully`
- Check browser Network tab for failed requests

---

## 📊 Expected Database State After Tests

### users (3 rows)
```
id | username   | password  | role       | name
1  | admin      | admin123  | admin      | Admin
2  | atendente  | ate123    | atendente  | Atendente
3  | tecnico    | tec123    | tecnico    | Técnico
```

### clients (3+ rows)
```
id | name          | cpf         | phone
1  | Matheus Knupp | 12345678901 | 31 99973-1252
2  | Maria Eduarda | 98765432109 | 31 99326-8121
3  | João Silva    | 11122233344 | 31 99999-9999
```

### service_orders (4+ rows)
```
id | client_id | product        | status        | payment_status
1  | 1         | TV Samsung 50" | em-andamento  | Pendente
2  | 2         | Notebook Dell  | aguardando    | Pendente
3  | 1         | Soundbar JBL   | finalizada    | Pago
4  | 3         | Notebook HP    | aguardando    | Pendente
```

### items (4+ rows)
```
id | name             | brand    | quantity
1  | Tela LED 42"     | LG       | 5
2  | Capacitor 1000uF | Samsung  | 23
3  | Cabo HDMI 2m     | Philips  | 10
4  | Teclado USB      | Logitech | 20
```

---

## 🎓 Next Steps

1. ✅ All tests passed → Application is working!
2. 📖 Read `FULLSTACK_GUIDE.md` for detailed documentation
3. 📋 Read `FRONTEND_API_MAPPING.md` to understand data flow
4. 🔒 Consider adding password hashing (bcrypt) for production
5. 🚀 Deploy to production with environment variables
