# Centel Backend - MySQL Setup

## Database Setup Instructions

### 1. Install MySQL
Make sure you have MySQL installed and running on your system.

### 2. Create Database and Tables
Run the SQL script to create the database and tables with initial data:

```bash
mysql -u root -p < database/init.sql
```

Or manually in MySQL:
```bash
mysql -u root -p
```

Then copy and paste the contents of `database/init.sql` into the MySQL console.

### 3. Configure Environment Variables
The `.env` file has been created in the `backend/` folder with these settings:

```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=1234
DB_NAME=centel
PORT=4000
```

**Update these values if your MySQL configuration is different.**

### 4. Install Dependencies
```bash
cd backend
npm install
```

### 5. Start the Server
```bash
npm run dev
```

The server will start on `http://localhost:4000` and automatically connect to MySQL.

## Database Schema

### Tables
- **users** - Login credentials and roles (admin, atendente, tecnico)
- **clients** - Customer information
- **service_orders** - Service orders linked to clients
- **items** - Inventory/stock items

### Default Users
- **admin** / admin123
- **atendente** / ate123
- **tecnico** / tec123

## API Endpoints

All endpoints now use MySQL database instead of in-memory storage.

### Authentication
- `POST /auth/login` - Login with username and password

### Clients
- `GET /clients` - List all clients
- `POST /clients` - Create new client
- `PUT /clients/:id` - Update client
- `DELETE /clients/:id` - Delete client (cascades to service orders)

### Service Orders
- `GET /orders` - List all service orders with client names
- `POST /orders` - Create new order
- `PUT /orders/:id` - Update order
- `PATCH /orders/:id/status` - Update order status
- `PATCH /orders/:id/payment` - Update payment status
- `PATCH /orders/:id/observation` - Update observations
- `DELETE /orders/:id` - Delete order

### Items (Stock)
- `GET /items` - List all items
- `POST /items` - Create new item
- `PUT /items/:id` - Update item
- `DELETE /items/:id` - Delete item
- `PATCH /items/:id/adjust` - Adjust quantity (+/-)

## Troubleshooting

### Connection Error
If you see "MySQL connection failed", verify:
1. MySQL is running
2. Database `centel` exists
3. Credentials in `.env` are correct
4. MySQL port (default 3306) is accessible

### Permission Error
Make sure the MySQL user has permissions:
```sql
GRANT ALL PRIVILEGES ON centel.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```
