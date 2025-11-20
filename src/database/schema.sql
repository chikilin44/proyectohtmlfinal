-- Database schema for Pedidos YEMM
-- PostgreSQL database schema

-- Table: usuario (users)
CREATE TABLE IF NOT EXISTS usuario (
    id_usuario SERIAL PRIMARY KEY,
    usuario VARCHAR(255) UNIQUE NOT NULL,  -- email
    contrasena VARCHAR(255) NOT NULL,      -- hashed password
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: rol (roles)
CREATE TABLE IF NOT EXISTS rol (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(50) UNIQUE NOT NULL  -- cliente, repartidor, admin
);

-- Table: usuario_rol (user roles relationship)
CREATE TABLE IF NOT EXISTS usuario_rol (
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    id_rol INTEGER REFERENCES rol(id_rol) ON DELETE CASCADE,
    PRIMARY KEY (id_usuario, id_rol)
);

-- Table: cliente (customers)
CREATE TABLE IF NOT EXISTS cliente (
    cedula_cliente VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255),
    telefono VARCHAR(50),
    email VARCHAR(255)
);

-- Table: cliente_usuario (customer-user relationship)
CREATE TABLE IF NOT EXISTS cliente_usuario (
    cedula_cliente VARCHAR(50) REFERENCES cliente(cedula_cliente) ON DELETE CASCADE,
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    PRIMARY KEY (cedula_cliente, id_usuario)
);

-- Table: repartidor (delivery drivers)
CREATE TABLE IF NOT EXISTS repartidor (
    cedula_rep VARCHAR(50) PRIMARY KEY,
    nombre VARCHAR(255),
    telefono VARCHAR(50),
    disponible BOOLEAN DEFAULT true
);

-- Table: repartidor_usuario (driver-user relationship)
CREATE TABLE IF NOT EXISTS repartidor_usuario (
    cedula_rep VARCHAR(50) REFERENCES repartidor(cedula_rep) ON DELETE CASCADE,
    id_usuario INTEGER REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    PRIMARY KEY (cedula_rep, id_usuario)
);

-- Table: tienda (stores/restaurants)
CREATE TABLE IF NOT EXISTS tienda (
    id_tienda SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(50),
    categoria VARCHAR(100)  -- pizzas, hamburguesas, bebidas
);

-- Table: producto (products)
CREATE TABLE IF NOT EXISTS producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2),
    categoria VARCHAR(100),
    id_tienda INTEGER REFERENCES tienda(id_tienda)
);

-- Table: estado_pedidos (order statuses)
CREATE TABLE IF NOT EXISTS estado_pedidos (
    id_estado SERIAL PRIMARY KEY,
    nom_estado VARCHAR(50) UNIQUE NOT NULL  -- pendiente, aceptado, en_ruta, entregado, cancelado
);

-- Table: pedido (orders)
CREATE TABLE IF NOT EXISTS pedido (
    id_pedido SERIAL PRIMARY KEY,
    cedula_cliente VARCHAR(50),  -- puede ser NULL si es invitado
    id_tienda INTEGER REFERENCES tienda(id_tienda),
    fhrs_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    preciototal DECIMAL(10,2) NOT NULL DEFAULT 0,
    direccion TEXT,
    metodo VARCHAR(50),  -- efectivo, paypal, tarjeta
    paypal_order_id VARCHAR(255),
    datos JSONB,  -- almacena información adicional como productos en formato JSON
    id_estado INTEGER REFERENCES estado_pedidos(id_estado),
    cedula_rep VARCHAR(50) REFERENCES repartidor(cedula_rep),  -- repartidor asignado
    fecha_entrega TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: ped_producto (order items - products in each order)
CREATE TABLE IF NOT EXISTS ped_producto (
    id_ped_producto SERIAL PRIMARY KEY,
    id_pedido INTEGER REFERENCES pedido(id_pedido) ON DELETE CASCADE,
    id_producto INTEGER REFERENCES producto(id_producto),  -- puede ser NULL si el producto no está registrado
    nombre_producto VARCHAR(255),  -- almacena nombre del producto si id_producto es NULL
    cantidad INTEGER DEFAULT 1,
    precio_uni DECIMAL(10,2) DEFAULT 0
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pedido_cliente ON pedido(cedula_cliente);
CREATE INDEX IF NOT EXISTS idx_pedido_tienda ON pedido(id_tienda);
CREATE INDEX IF NOT EXISTS idx_pedido_estado ON pedido(id_estado);
CREATE INDEX IF NOT EXISTS idx_pedido_repartidor ON pedido(cedula_rep);
CREATE INDEX IF NOT EXISTS idx_pedido_fecha ON pedido(fhrs_pedido);

-- Insert default order states
INSERT INTO estado_pedidos (nom_estado) VALUES 
    ('pendiente'),
    ('pagado'),
    ('aceptado'),
    ('asignado'),
    ('en_ruta'),
    ('entregado'),
    ('cancelado')
ON CONFLICT (nom_estado) DO NOTHING;

-- Insert default roles
INSERT INTO rol (nombre_rol) VALUES 
    ('cliente'),
    ('repartidor'),
    ('admin')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Insert sample stores (based on the frontend)
INSERT INTO tienda (nombre, direccion, categoria) VALUES 
    ('The Pizza Company', 'Cra 44 # 37 - 10, Tuluá Valle', 'pizzas'),
    ('Drive Pizza', 'Calle 26 # 35 - 41 B/ Alvernia', 'pizzas'),
    ('Oliva Pizza Garden', 'Cra 40 # 35 - Esquina B / Lomitas', 'pizzas'),
    ('ATA Burger', 'Cra 26 # 37 - 51 B / Salesianos', 'hamburguesas'),
    ('Smash Burger', 'Containers Park, Tuluá', 'hamburguesas'),
    ('La Burger', 'Cra 26 # 39 - 16 B / El Príncipe Tuluá', 'hamburguesas')
ON CONFLICT DO NOTHING;
