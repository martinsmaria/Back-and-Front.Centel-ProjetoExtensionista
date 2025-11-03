# Soft Delete Implementation

## Overview

The application now uses **soft delete** instead of permanently deleting records. When you "delete" a record, it's marked as inactive but remains in the database for audit purposes and data recovery.

---

## Database Changes

### Status Columns Added

All tables now have a status/active column:

| Table | Column Name | Type | Default | Purpose |
|-------|-------------|------|---------|---------|
| `users` | `status` | BOOLEAN | TRUE | Active user accounts |
| `clients` | `status` | BOOLEAN | TRUE | Active clients |
| `service_orders` | `active` | BOOLEAN | TRUE | Active orders |
| `items` | `status` | BOOLEAN | TRUE | Active stock items |

**Note:** Service orders use `active` instead of `status` to avoid confusion with the order status field (em-andamento, aguardando, finalizada).

---

## How It Works

### Before (Hard Delete)
```sql
DELETE FROM clients WHERE id = 1;
-- Record is permanently removed from database
-- Cannot be recovered
```

### Now (Soft Delete)
```sql
UPDATE clients SET status = FALSE WHERE id = 1;
-- Record still exists but is marked inactive
-- Can be recovered by setting status = TRUE
```

---

## API Behavior

### GET Requests - Only Active Records

All GET endpoints filter by status automatically:

```javascript
// Clients
app.get("/clients")
→ SELECT * FROM clients WHERE status = TRUE

// Orders (also filters inactive clients)
app.get("/orders")
→ WHERE so.active = TRUE AND c.status = TRUE

// Items
app.get("/items")
→ SELECT * FROM items WHERE status = TRUE

// Users (login)
app.post("/auth/login")
→ WHERE username = ? AND password = ? AND status = TRUE
```

### UPDATE Requests - Only Active Records

Updates only affect active records:

```javascript
// Can only update clients that are active
UPDATE clients SET ... WHERE id = ? AND status = TRUE

// Can only update orders that are active
UPDATE service_orders SET ... WHERE id = ? AND active = TRUE

// Can only update items that are active
UPDATE items SET ... WHERE id = ? AND status = TRUE
```

### DELETE Requests - Soft Delete

Delete operations now set status to FALSE:

```javascript
// Delete client
app.delete("/clients/:id")
→ UPDATE clients SET status = FALSE WHERE id = ?

// Delete order
app.delete("/orders/:id")
→ UPDATE service_orders SET active = FALSE WHERE id = ?

// Delete item
app.delete("/items/:id")
→ UPDATE items SET status = FALSE WHERE id = ?
```

---

## Frontend Impact

**No changes needed!** The frontend works exactly the same way:

1. List views only show active records (API filters them)
2. Edit/Update only works on active records
3. Delete hides records from the UI (but they stay in database)

---

## Migration Guide

### For New Installations

Just run the updated init script:

```bash
mysql -u root -p < database/init.sql
```

All tables will be created with status columns.

### For Existing Databases

Run the migration script to add status columns:

```bash
mysql -u root -p centel < database/add_status_columns.sql
```

This will:
- Add status/active columns to all tables
- Set all existing records to TRUE (active)
- Not affect any existing data

---

## Benefits of Soft Delete

### ✅ Data Recovery
- Accidentally deleted a client? Just set `status = TRUE`
- No backups needed for simple recovery

### ✅ Audit Trail
- See what was deleted and when
- Track historical data

### ✅ Data Integrity
- Related records don't cascade delete
- Can analyze deleted records

### ✅ Compliance
- Some regulations require keeping deleted records
- Better for financial/legal compliance

---

## Viewing Deleted Records

### See All Records (Including Deleted)

```sql
-- All clients (active and inactive)
SELECT *, IF(status, 'Active', 'Deleted') as state FROM clients;

-- All orders (active and inactive)
SELECT *, IF(active, 'Active', 'Deleted') as state FROM service_orders;

-- All items (active and inactive)
SELECT *, IF(status, 'Active', 'Deleted') as state FROM items;
```

### See Only Deleted Records

```sql
-- Deleted clients
SELECT * FROM clients WHERE status = FALSE;

-- Deleted orders
SELECT * FROM service_orders WHERE active = FALSE;

-- Deleted items
SELECT * FROM items WHERE status = FALSE;
```

---

## Recovering Deleted Records

### Restore a Client

```sql
-- Restore client with ID 5
UPDATE clients SET status = TRUE WHERE id = 5;
```

Frontend will immediately show the restored client on next refresh.

### Restore an Order

```sql
-- Restore order with ID 10
UPDATE service_orders SET active = TRUE WHERE id = 10;
```

### Restore an Item

```sql
-- Restore item with ID 3
UPDATE items SET status = TRUE WHERE id = 3;
```

---

## Permanently Deleting Records (Hard Delete)

If you really need to permanently delete:

```sql
-- WARNING: This is permanent and cannot be undone!

-- Delete a client permanently
DELETE FROM clients WHERE id = 1 AND status = FALSE;

-- Delete an order permanently
DELETE FROM service_orders WHERE id = 1 AND active = FALSE;

-- Delete an item permanently
DELETE FROM items WHERE id = 1 AND status = FALSE;
```

**Best Practice:** Only hard delete records that are already soft deleted (status = FALSE).

---

## Database Cleanup

### Find Old Deleted Records

```sql
-- Clients deleted more than 1 year ago
SELECT * FROM clients 
WHERE status = FALSE 
AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);

-- Orders deleted more than 6 months ago
SELECT * FROM service_orders 
WHERE active = FALSE 
AND created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH);
```

### Archive and Hard Delete Old Records

```sql
-- 1. Export to backup first
-- mysqldump centel clients --where="status=FALSE" > deleted_clients_backup.sql

-- 2. Then permanently delete
DELETE FROM clients 
WHERE status = FALSE 
AND created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

## Testing Soft Delete

### Test Client Soft Delete

```bash
# 1. Create a test client in UI
# 2. Note the client ID
# 3. Delete the client in UI
# 4. Check database:
```

```sql
SELECT * FROM clients WHERE name LIKE '%test%';
-- Should show status = 0 (FALSE)
```

```bash
# 5. Restore it:
```

```sql
UPDATE clients SET status = TRUE WHERE id = <test_client_id>;
```

```bash
# 6. Refresh frontend - client reappears!
```

---

## API Examples

### Create and Soft Delete a Client

```bash
# Create
curl -X POST http://localhost:4000/clients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Delete","cpf":"99999999999","phone":"31999999999","cep":"30000000","address":"Test St"}'

# Returns: {"id":10,"name":"Test Delete",...}

# List (shows new client)
curl http://localhost:4000/clients
# Contains client ID 10

# Delete
curl -X DELETE http://localhost:4000/clients/10

# List again (client no longer appears)
curl http://localhost:4000/clients
# Client ID 10 is gone from API response

# Check database (still exists!)
mysql -u root -p centel -e "SELECT * FROM clients WHERE id = 10;"
# Shows: id=10, status=0 (FALSE)
```

---

## Summary

| Operation | Old Behavior | New Behavior |
|-----------|-------------|--------------|
| **GET** | Shows all records | Shows only active records (status=TRUE) |
| **POST** | Creates with no status | Creates with status=TRUE |
| **PUT** | Updates any record | Updates only active records |
| **DELETE** | Permanently deletes | Sets status=FALSE (soft delete) |

**Result:** Data is never lost, but UI only shows active records. Perfect for audit trails and data recovery! 🎉
