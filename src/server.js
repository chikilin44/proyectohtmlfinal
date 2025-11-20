import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { pool } from './database/connectionPostgreSQL.js';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto';

// Rate limiting configuration
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Demasiadas solicitudes desde esta IP, por favor intenta de nuevo más tarde.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: 'Demasiados intentos de autenticación, por favor intenta de nuevo más tarde.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all API routes
app.use('/api/', apiLimiter);

// REGISTER
app.post('/api/register', authLimiter, async (req, res) => {
  const client = await pool.connect();
  try {
    const { email, password, role = 'cliente', cedula = null, name = null } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan campos' });

    await client.query('BEGIN');

    // comprobar existencia de usuario
    const { rows: exists } = await client.query('SELECT id_usuario FROM usuario WHERE usuario = $1', [email]);
    if (exists.length) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Usuario ya existe' }); }

    // crear usuario (hash)
    const hash = await bcrypt.hash(password, 10);
    const qUser = 'INSERT INTO usuario (usuario, contrasena) VALUES ($1,$2) RETURNING id_usuario, usuario';
    const { rows } = await client.query(qUser, [email, hash]);
    const idUsuario = rows[0].id_usuario;

    // asegurar rol existe (busca case-insensitive) o crearlo
    const { rows: rolRows } = await client.query('SELECT id_rol FROM rol WHERE lower(nombre_rol) = lower($1) LIMIT 1', [role]);
    let idRol;
    if (rolRows.length) idRol = rolRows[0].id_rol;
    else {
      const r = await client.query('INSERT INTO rol (nombre_rol) VALUES ($1) RETURNING id_rol', [role]);
      idRol = r.rows[0].id_rol;
    }

    // asignar rol al usuario (evita duplicados)
    await client.query('INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ($1,$2) ON CONFLICT DO NOTHING', [idUsuario, idRol]);

    // opcional: vincular a cliente/repartidor si se envía cédula y existe registro en Cliente/Repartidor
    if (cedula && role.toLowerCase() === 'cliente') {
      // insertar sólo si existe la cédula en Cliente
      await client.query(
        `INSERT INTO cliente_usuario (cedula_cliente, id_usuario)
         SELECT $1, $2
         WHERE EXISTS (SELECT 1 FROM cliente WHERE cedula_cliente = $1)`,
        [cedula, idUsuario]
      );
    } else if (cedula && role.toLowerCase() === 'repartidor') {
      await client.query(
        `INSERT INTO repartidor_usuario (cedula_rep, id_usuario)
         SELECT $1, $2
         WHERE EXISTS (SELECT 1 FROM repartidor WHERE cedula_rep = $1)`,
        [cedula, idUsuario]
      );
    }

    await client.query('COMMIT');

    // opcional: devolver rol asignado
    return res.status(201).json({ ok: true, user: { id: idUsuario, usuario: email, role } });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Register error:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// LOGIN
app.post('/api/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Faltan campos' });

    const q = 'SELECT id_usuario, usuario, contrasena FROM usuario WHERE usuario = $1';
    const { rows } = await pool.query(q, [email]);
    if (!rows.length) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const ok = await bcrypt.compare(password, user.contrasena);
    if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id_usuario, usuario: user.usuario }, JWT_SECRET, { expiresIn: '12h' });
    return res.json({ ok: true, token, user: { id: user.id_usuario, usuario: user.usuario } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

// CREATE PEDIDO (POST /api/pedidos) -> guarda pedido y items
app.post('/api/pedidos', async (req, res) => {
  const client = await pool.connect();
  try {
    const { cedula_cliente = null, id_tienda = null, total = 0, productos = [] } = req.body;
    await client.query('BEGIN');

    const insertPedido = `INSERT INTO pedido (cedula_cliente, id_tienda, preciototal, id_estado)
      VALUES ($1,$2,$3, (SELECT id_estado FROM estado_pedidos WHERE nom_estado='pendiente' LIMIT 1))
      RETURNING id_pedido`;
    const { rows } = await client.query(insertPedido, [cedula_cliente, id_tienda, total]);
    const idPedido = rows[0].id_pedido;

    const insertItem = `INSERT INTO ped_producto (id_pedido, id_producto, nombre_producto, cantidad, precio_uni) VALUES ($1,$2,$3,$4,$5)`;
    for (const p of productos) {
      const nombre = p.nombre || 'Producto';
      await client.query(insertItem, [idPedido, p.id_producto, nombre, p.cantidad || 1, p.precio_uni || 0]);
    }

    await client.query('COMMIT');
    return res.status(201).json({ ok: true, id_pedido: idPedido });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// CREATE ORDER (POST /api/orders) -> guarda pedido y items
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('/api/orders body:', req.body);
    const {
      cliente = null,
      cedula_cliente = null,
      id_tienda = null,
      productos = [],
      total = 0,
      fecha = null,
      direccion = null,
      metodo = null,
      paypalOrderId = null
    } = req.body;

    if (!productos || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Productos vacíos' });
    }

    await client.query('BEGIN');

    // insertar pedido y guardar el array productos en "datos" (JSONB)
    const insertPedido = `
      INSERT INTO pedido (cedula_cliente, id_tienda, fhrs_pedido, preciototal, direccion, metodo, paypal_order_id, datos, id_estado)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,
        (SELECT id_estado FROM estado_pedidos WHERE nom_estado='pendiente' LIMIT 1)
      )
      RETURNING id_pedido
    `;
    const fhrs_pedido = fecha ? new Date(fecha) : new Date();
    const datos = { productos };
    const r = await client.query(insertPedido, [
      cedula_cliente || cliente || null,
      id_tienda || null,
      fhrs_pedido,
      total || 0,
      direccion || null,
      metodo || null,
      paypalOrderId || null,
      datos
    ]);
    const idPedido = r.rows[0].id_pedido;

    // insertar items en ped_producto (usar id_producto si existe, si no insertar NULL)
    const insertItem = `INSERT INTO ped_producto (id_pedido, id_producto, nombre_producto, cantidad, precio_uni) VALUES ($1,$2,$3,$4,$5)`;
    for (const p of productos) {
      let id_producto = null;
      let nombre_producto = p.nombre || 'Producto';
      
      if (p.id_producto) {
        id_producto = p.id_producto;
      } else if (p.nombre) {
        const found = await client.query('SELECT id_producto FROM producto WHERE lower(nombre) = lower($1) LIMIT 1', [p.nombre]);
        if (found.rows && found.rows[0]) {
          id_producto = found.rows[0].id_producto;
        }
      }
      
      const cantidad = Number(p.cantidad) || 1;
      const precio_uni = (p.precio_uni != null) ? Number(p.precio_uni) : (p.precio != null ? Number(p.precio) : 0);
      await client.query(insertItem, [idPedido, id_producto, nombre_producto, cantidad, precio_uni]);
    }

    await client.query('COMMIT');
    console.log('Pedido creado id:', idPedido);
    return res.status(201).json({ ok: true, idPedido });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Error al guardar pedido:', err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PROFILE simple
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Token malformado' });
  try {
    const payload = jwt.verify(parts[1], JWT_SECRET);
    return res.json({ ok: true, user: payload });
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, now: new Date() }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));