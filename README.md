# Pedidos YEMM - Sistema de Pedidos en Línea

Sistema web para gestión de pedidos de comida con integración de base de datos PostgreSQL.

## 🚀 Características

- ✅ **Sistema de autenticación** - Registro e inicio de sesión de usuarios
- ✅ **Gestión de pedidos** - Los pedidos se guardan en base de datos PostgreSQL
- ✅ **Múltiples métodos de pago** - Efectivo y PayPal
- ✅ **Roles de usuario** - Cliente, Repartidor, Administrador
- ✅ **Seguimiento de pedidos** - Estados: pendiente, aceptado, en ruta, entregado
- ✅ **Panel de repartidor** - Asignación y seguimiento de entregas
- ✅ **Panel de administración** - Reportes y estadísticas
- ✅ **Catálogo de productos** - Hamburguesas, Pizzas, Bebidas
- ✅ **Gestión de direcciones** - Múltiples direcciones por usuario
- ✅ **Seguridad** - Rate limiting para prevenir abuso de API y ataques de fuerza bruta

## 📋 Requisitos Previos

- **Node.js** v14 o superior
- **PostgreSQL** v12 o superior
- Navegador web moderno (Chrome, Firefox, Safari, Edge)

## 🛠️ Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/chikilin44/proyectohtmlfinal.git
cd proyectohtmlfinal
```

### 2. Instalar Dependencias del Backend

```bash
cd src
npm install
```

### 3. Configurar PostgreSQL

#### Opción A: Instalación de PostgreSQL (si no está instalado)

**En Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**En macOS (con Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**En Windows:**
- Descargar desde [postgresql.org](https://www.postgresql.org/download/windows/)
- Seguir el asistente de instalación
- Recordar la contraseña del usuario `postgres`

#### Opción B: Verificar PostgreSQL existente

```bash
# Verificar si PostgreSQL está corriendo
pg_isready

# Verificar versión
psql --version
```

### 4. Configurar Credenciales de Base de Datos

Crea un archivo `.env` en la carpeta `src/`:

```bash
cd src
cp .env.example .env
```

Edita `.env` con tus credenciales:

```env
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=tu_contraseña_aquí
PORT=4000
JWT_SECRET=tu_secreto_jwt_seguro
```

**Importante:** 
- Cambia `DB_PASSWORD` por tu contraseña de PostgreSQL
- Cambia `JWT_SECRET` por un valor seguro en producción

### 5. Crear el Schema de la Base de Datos

Tienes 3 opciones para crear las tablas:

#### Opción A: Usando el script de Node.js (Recomendado)

```bash
cd src
npm run setup-db
```

#### Opción B: Usando el script de Bash

```bash
cd src
chmod +x setup_database.sh
./setup_database.sh
```

#### Opción C: Manualmente con psql

```bash
psql -U postgres -d postgres -f src/database/schema.sql
```

### 6. Verificar la Creación de Tablas

```bash
psql -U postgres -d postgres -c "\dt"
```

Deberías ver las siguientes tablas:
- `usuario`, `rol`, `usuario_rol`
- `cliente`, `cliente_usuario`
- `repartidor`, `repartidor_usuario`
- `tienda`, `producto`
- `estado_pedidos`, `pedido`, `ped_producto`

## 🚀 Uso

### 1. Iniciar el Servidor Backend

```bash
cd src
npm start
```

Deberías ver:
```
API escuchando en http://localhost:4000
```

### 2. Abrir la Aplicación Web

Abre `index.html` en tu navegador web:

**Opción A:** Doble clic en el archivo `index.html`

**Opción B:** Usar un servidor web local (recomendado para evitar problemas de CORS)

```bash
# Con Python 3
python3 -m http.server 3000

# Con Node.js (http-server)
npx http-server -p 3000
```

Luego abre: `http://localhost:3000`

## 🔒 Seguridad

El sistema incluye las siguientes medidas de seguridad:

### Rate Limiting
- **API General**: 100 solicitudes por IP cada 15 minutos
- **Autenticación**: 5 intentos por IP cada 15 minutos
- Protege contra ataques de fuerza bruta y abuso de API

### Autenticación
- Contraseñas hasheadas con **bcrypt** (10 rounds)
- Tokens JWT con expiración de 12 horas
- Validación de credenciales en cada solicitud protegida

### Base de Datos
- Transacciones para integridad de datos
- Prepared statements para prevenir SQL injection
- Validación de entrada en todos los endpoints

### Recomendaciones de Producción
1. Cambiar `JWT_SECRET` en `.env` a un valor fuerte y aleatorio
2. Usar HTTPS en producción
3. Configurar CORS con orígenes específicos
4. Implementar logging de seguridad
5. Backup regular de la base de datos

### 3. Probar el Sistema

1. **Registrarse como Cliente:**
   - Click en "Mi Perfil"
   - Seleccionar "Registrarse"
   - Llenar el formulario
   - Seleccionar rol "Cliente"

2. **Agregar Productos al Carrito:**
   - Navegar por las categorías (Hamburguesas, Pizzas, Bebidas)
   - Click en "Agregar" en los productos deseados

3. **Configurar Dirección:**
   - Click en "Ingresar dirección"
   - Llenar los datos de entrega
   - Guardar

4. **Realizar Pedido:**
   - Click en "Ver Carrito"
   - Opción 1: "Confirmar sin pagar (Efectivo)"
   - Opción 2: Pagar con PayPal

5. **Verificar Pedido en la Base de Datos:**

```sql
-- Conectar a PostgreSQL
psql -U postgres -d postgres

-- Ver todos los pedidos
SELECT * FROM pedido ORDER BY id_pedido DESC LIMIT 5;

-- Ver detalles de productos en pedidos
SELECT p.id_pedido, pp.nombre_producto, pp.cantidad, pp.precio_uni 
FROM pedido p 
JOIN ped_producto pp ON p.id_pedido = pp.id_pedido
ORDER BY p.id_pedido DESC;
```

## 📊 Estructura de la Base de Datos

### Tablas Principales

#### `pedido` - Tabla de Pedidos
Almacena todos los pedidos realizados:
- `id_pedido`: ID único del pedido
- `cedula_cliente`: Identificación del cliente (puede ser NULL para invitados)
- `id_tienda`: ID de la tienda
- `fhrs_pedido`: Fecha y hora del pedido
- `preciototal`: Total del pedido
- `direccion`: Dirección de entrega
- `metodo`: Método de pago (efectivo, paypal)
- `paypal_order_id`: ID de transacción de PayPal
- `datos`: Información adicional en JSON
- `id_estado`: Estado actual del pedido
- `cedula_rep`: Repartidor asignado
- `fecha_entrega`: Fecha de entrega

#### `ped_producto` - Productos en Pedidos
Detalle de cada producto en los pedidos:
- `id_ped_producto`: ID único
- `id_pedido`: Referencia al pedido
- `id_producto`: Referencia al catálogo (puede ser NULL)
- `nombre_producto`: Nombre del producto
- `cantidad`: Cantidad ordenada
- `precio_uni`: Precio unitario

#### `usuario` - Usuarios del Sistema
Cuentas de usuario con autenticación:
- `id_usuario`: ID único
- `usuario`: Email del usuario (único)
- `contrasena`: Contraseña hasheada con bcrypt

#### `estado_pedidos` - Estados de Pedidos
Estados predefinidos:
- `pendiente`: Pedido creado, esperando confirmación
- `pagado`: Pago confirmado (PayPal)
- `aceptado`: Pedido aceptado por la tienda
- `asignado`: Repartidor asignado
- `en_ruta`: Pedido en camino
- `entregado`: Pedido entregado
- `cancelado`: Pedido cancelado

## 🔌 API Endpoints

### Autenticación

```bash
# Registrar usuario
POST /api/register
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "contraseña123",
  "role": "cliente",
  "name": "Juan Pérez"
}

# Iniciar sesión
POST /api/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "contraseña123"
}
```

### Pedidos

```bash
# Crear pedido
POST /api/orders
Content-Type: application/json
{
  "cliente": "user@example.com",
  "productos": [
    {
      "nombre": "Pizza Margarita",
      "precio": 24900,
      "cantidad": 1
    }
  ],
  "total": 24900,
  "direccion": "Calle 123, Ciudad",
  "metodo": "efectivo"
}
```

### Utilidades

```bash
# Health check
GET /api/health

# Perfil de usuario (requiere token)
GET /api/me
Authorization: Bearer <token>
```

## 🧪 Testing

### Probar Conexión a la Base de Datos

```bash
cd src
node -e "import('./database/connectionPostgreSQL.js').then(m => m.pool.query('SELECT NOW()')).then(r => console.log('✓ Conectado:', r.rows[0].now)).catch(e => console.error('✗ Error:', e.message))"
```

### Probar el Servidor

```bash
# Terminal 1: Iniciar servidor
cd src
npm start

# Terminal 2: Probar endpoint
curl http://localhost:4000/api/health
```

Respuesta esperada:
```json
{"ok":true,"now":"2025-11-20T01:30:00.000Z"}
```

### Probar Creación de Pedido

```bash
curl -X POST http://localhost:4000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cliente": "test@example.com",
    "productos": [
      {"nombre": "Pizza Pepperoni", "precio": 26900, "cantidad": 2},
      {"nombre": "Coca Cola", "precio": 3900, "cantidad": 1}
    ],
    "total": 57700,
    "direccion": "Av. Siempre Viva 742, Cali",
    "metodo": "efectivo"
  }'
```

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

1. Verificar que PostgreSQL esté corriendo:
   ```bash
   sudo systemctl status postgresql  # Linux
   brew services list  # macOS
   ```

2. Verificar credenciales en `.env`

3. Verificar que el puerto 5432 esté disponible:
   ```bash
   sudo lsof -i :5432
   ```

### Error: "relation does not exist"

Las tablas no están creadas. Ejecutar:
```bash
cd src
npm run setup-db
```

### Error: "password authentication failed"

Actualizar la contraseña en `.env` o cambiar la contraseña de PostgreSQL:
```bash
sudo -u postgres psql
ALTER USER postgres PASSWORD 'nueva_contraseña';
```

### El frontend no se conecta al backend

1. Verificar que el servidor esté corriendo en puerto 4000
2. Verificar la constante `API_BASE` en `index.html` (línea 537):
   ```javascript
   const API_BASE = 'http://localhost:4000/api';
   ```
3. Si usas otro puerto, actualizar en `.env` y en `index.html`

### CORS errors

Si abres `index.html` directamente desde el disco, puedes tener problemas de CORS. 
Solución: Usar un servidor web local:
```bash
npx http-server -p 3000
```

## 📝 Documentación Adicional

- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Guía detallada de configuración de base de datos
- [src/database/schema.sql](src/database/schema.sql) - Esquema completo de la base de datos

## 🤝 Contribuir

1. Fork el proyecto
2. Crear una rama de característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit los cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto es parte de un proyecto académico.

## 👥 Autores

- [@chikilin44](https://github.com/chikilin44)
- [@YarethLc](https://github.com/YarethLc)

## 🎯 Estado del Proyecto

✅ **COMPLETADO** - La base de datos está conectada y funcional

- ✅ Backend con Express.js y PostgreSQL
- ✅ Esquema de base de datos completo
- ✅ API RESTful para pedidos
- ✅ Sistema de autenticación
- ✅ Frontend integrado con backend
- ✅ Guardado de pedidos en base de datos
- ✅ Documentación completa

## 📞 Soporte

Si tienes problemas:
1. Revisa la sección [Solución de Problemas](#-solución-de-problemas)
2. Revisa [DATABASE_SETUP.md](DATABASE_SETUP.md)
3. Abre un issue en GitHub
