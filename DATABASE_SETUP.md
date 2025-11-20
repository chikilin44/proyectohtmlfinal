# Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Database name: `postgres` (or create a new database)
- Default credentials configured in `src/database/connectionPostgreSQL.js`:
  - Host: `127.0.0.1`
  - Port: `5432`
  - User: `postgres`
  - Password: `root`

## Setup Instructions

### 1. Create the Database (if not using default postgres database)
```sql
CREATE DATABASE pedidos_yemm;
```

### 2. Run the Schema
Execute the schema file to create all required tables:

```bash
psql -U postgres -d postgres -f src/database/schema.sql
```

Or connect to PostgreSQL and run:
```bash
psql -U postgres -d postgres
\i src/database/schema.sql
```

### 3. Verify Tables Created
```sql
\dt
```

You should see the following tables:
- `usuario` - User accounts
- `rol` - User roles (cliente, repartidor, admin)
- `usuario_rol` - User-role relationships
- `cliente` - Customer details
- `cliente_usuario` - Customer-user relationship
- `repartidor` - Delivery drivers
- `repartidor_usuario` - Driver-user relationship
- `tienda` - Stores/restaurants
- `producto` - Products catalog
- `estado_pedidos` - Order statuses
- `pedido` - Orders
- `ped_producto` - Order items (products in each order)

## Database Structure

### Key Tables

#### `pedido` (Orders)
This is the main table that stores all orders with:
- `id_pedido`: Unique order ID
- `cedula_cliente`: Customer ID (can be NULL for guest orders)
- `id_tienda`: Store ID
- `fhrs_pedido`: Order timestamp
- `preciototal`: Total price
- `direccion`: Delivery address
- `metodo`: Payment method (efectivo, paypal, tarjeta)
- `paypal_order_id`: PayPal transaction ID
- `datos`: Additional order data in JSON format (includes product details)
- `id_estado`: Current order status
- `cedula_rep`: Assigned delivery driver
- `fecha_entrega`: Delivery timestamp

#### `ped_producto` (Order Items)
Stores individual products in each order:
- `id_pedido`: Reference to order
- `id_producto`: Reference to product (can be NULL)
- `cantidad`: Quantity
- `precio_uni`: Unit price

## Configuration

### Update Database Credentials
Edit `src/database/connectionPostgreSQL.js` if you need to change:
- Host
- Port
- Database name
- Username
- Password

Example:
```javascript
export const pool = new pg.Pool({
    host: "your-host",
    port: 5432,
    database: "your-database-name",
    user: "your-username",
    password: "your-password"
});
```

### Environment Variables (Optional)
You can also use environment variables by creating a `.env` file:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=root
JWT_SECRET=your-secret-key
PORT=4000
```

Then update `connectionPostgreSQL.js`:
```javascript
import dotenv from 'dotenv';
dotenv.config();

export const pool = new pg.Pool({
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "root"
});
```

## Testing the Connection

### 1. Start the Server
```bash
cd src
npm install
npm start
```

The server should start on port 4000 and connect to the database.

### 2. Test the Health Endpoint
```bash
curl http://localhost:4000/api/health
```

Expected response:
```json
{"ok": true, "now": "2025-11-20T..."}
```

### 3. Test Order Creation
Create a test order:
```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "test@example.com",
    "productos": [
      {"nombre": "Pizza Margarita", "precio": 24900, "cantidad": 1}
    ],
    "total": 24900,
    "direccion": "Calle 123",
    "metodo": "efectivo"
  }'
```

### 4. Verify Order Saved
Connect to PostgreSQL and check:
```sql
SELECT * FROM pedido ORDER BY id_pedido DESC LIMIT 1;
SELECT * FROM ped_producto ORDER BY id_pedido DESC LIMIT 5;
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - Login user
- `GET /api/me` - Get current user profile

### Orders
- `POST /api/orders` - Create new order (saves to database)
- `POST /api/pedidos` - Alternative order creation endpoint

### Health
- `GET /api/health` - Check server status

## Troubleshooting

### Connection Error
If you get connection errors:
1. Verify PostgreSQL is running: `sudo systemctl status postgresql`
2. Check credentials in `connectionPostgreSQL.js`
3. Verify database exists
4. Check PostgreSQL logs

### Authentication Failed
If you get "password authentication failed":
1. Update PostgreSQL password for postgres user
2. Or update `connectionPostgreSQL.js` with correct password

### Tables Don't Exist
If you get "relation does not exist" errors:
1. Run the schema.sql file
2. Verify you're connected to the correct database
3. Check with `\dt` in psql

## How Orders are Saved

When a user completes an order in the frontend:

1. **Frontend (index.html)**: 
   - User adds items to cart
   - Clicks "Confirmar Pedido" or completes PayPal payment
   - JavaScript function `submitOrderToApi()` is called (line 855-878)

2. **API Request**:
   - POST request sent to `http://localhost:4000/api/orders`
   - Includes: products, total, address, payment method, customer email

3. **Backend (server.js)**:
   - Receives order data
   - Starts database transaction
   - Inserts into `pedido` table
   - Inserts items into `ped_producto` table
   - Commits transaction
   - Returns order ID

4. **Database**:
   - Order saved with all details
   - Can be queried for reports, delivery assignment, etc.

## Next Steps

After setting up the database:
1. ✅ Database schema created
2. ✅ Server can save orders
3. ✅ Frontend integrated with backend
4. Consider adding:
   - Order history endpoint
   - Order status updates
   - Delivery driver assignment
   - Admin dashboard queries
   - Product catalog management
