import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { pool } from './database/connectionPostgreSQL.js';

dotenv.config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'cambia_esto';

// REGISTER
app.post('/api/register', async (req, res) => {
  const client = await pool.connect();
  try {
    console.log('POST /api/register body:', JSON.stringify(req.body));
    const {
      email, password, role = 'cliente', cedula = null,
      phone1 = null, phone2 = null, firstName = null, lastName = null, name = null
    } = req.body || {};

    if (!email || !password) {
      console.warn('Faltan email/password en body:', req.body);
      return res.status(400).json({ error: 'email y password requeridos' });
    }

    await client.query('BEGIN');

    const exists = await client.query('SELECT id_usuario FROM usuario WHERE usuario = $1 LIMIT 1', [email]);
    if (exists.rowCount) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Usuario ya existe' }); }

    const hash = await bcrypt.hash(password, 10);
    const u = await client.query(
      'INSERT INTO usuario (usuario, contrasena, activo) VALUES ($1, $2, TRUE) RETURNING id_usuario',
      [email, hash]
    );
    const idUsuario = u.rows[0].id_usuario;
    console.log('Usuario creado id:', idUsuario);

    const r = await client.query('SELECT id_rol FROM rol WHERE lower(nombre_rol)=lower($1) LIMIT 1', [role]);
    let idRol;
    if (r.rowCount) idRol = r.rows[0].id_rol;
    else {
      const rIns = await client.query('INSERT INTO rol (nombre_rol) VALUES ($1) RETURNING id_rol', [role]);
      idRol = rIns.rows[0].id_rol;
    }
    await client.query('INSERT INTO usuario_rol (id_usuario, id_rol) VALUES ($1, $2) ON CONFLICT DO NOTHING', [idUsuario, idRol]);

    const nom = (firstName || name || '').trim() || email.split('@')[0];
    const ape = (lastName || '').trim() || null;
    const telefono = phone1 || phone2 || null;
    const roleLower = (role || '').toLowerCase();

    if (roleLower === 'cliente') {
      if (!cedula) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'Cedula requerida para rol cliente' });
      }

      console.log('Insert/Upsert cliente:', { cedula, nom, ape, telefono });

      await client.query(
        `INSERT INTO cliente (cedula_cliente, nom_cliente, ape_cliente, calle, numero, id_mun)
         VALUES ($1, $2, $3, NULL, $4, NULL)
         ON CONFLICT (cedula_cliente) DO UPDATE
           SET nom_cliente = COALESCE(EXCLUDED.nom_cliente, cliente.nom_cliente),
               ape_cliente = COALESCE(EXCLUDED.ape_cliente, cliente.ape_cliente),
               numero = COALESCE(EXCLUDED.numero, cliente.numero)`,
        [cedula, nom, ape, telefono]
      );

      const chk = await client.query('SELECT cedula_cliente, nom_cliente, ape_cliente, numero FROM cliente WHERE cedula_cliente = $1', [cedula]);
      console.log('cliente row after upsert:', chk.rows[0] || null);

      try {
        await client.query('INSERT INTO cliente_usuario (cedula_cliente, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING', [cedula, idUsuario]);
      } catch (relErr) {
        console.warn('cliente_usuario insert failed (schema?):', relErr.message);
      }
    }

    await client.query('COMMIT');
    return res.status(201).json({ ok: true, idUsuario, role, clienteCedula: roleLower === 'cliente' ? cedula : null });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Register handler error:', err && (err.stack || err.message || err));
    // En desarrollo devolver mensaje para depurar (en producción mostrar genérico)
    return res.status(500).json({ error: err.message || 'Error interno', detail: (err.stack || '').split('\n').slice(0,5).join('\\n') });
  } finally {
    client.release();
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
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

// helpers: asegurar/obtener departamento y municipio
async function ensureDepartamento(client, nombreDep) {
  if (!nombreDep) return null;
  const q = 'SELECT id_dep FROM departamento WHERE lower(nom_dep) = lower($1) LIMIT 1';
  const { rows } = await client.query(q, [nombreDep.trim()]);
  if (rows.length) return rows[0].id_dep;
  const ins = await client.query(
    `INSERT INTO departamento (nom_dep) VALUES ($1) RETURNING id_dep`,
    [nombreDep.trim()]
  );
  return ins.rows[0].id_dep;
}

async function ensureMunicipio(client, nombreMun, id_dep) {
  if (!nombreMun) return null;
  // si tenemos id_dep, preferimos insert/search ligado a ese departamento
  if (id_dep) {
    const q = 'SELECT id_mun FROM municipio WHERE id_dep = $1 AND lower(nom_mun) = lower($2) LIMIT 1';
    const { rows } = await client.query(q, [id_dep, nombreMun.trim()]);
    if (rows.length) return rows[0].id_mun;
    const ins = await client.query(
      `INSERT INTO municipio (nom_mun, id_dep) VALUES ($1, $2) RETURNING id_mun`,
      [nombreMun.trim(), id_dep]
    );
    return ins.rows[0].id_mun;
  } else {
    const q = 'SELECT id_mun FROM municipio WHERE lower(nom_mun) = lower($1) LIMIT 1';
    const { rows } = await client.query(q, [nombreMun.trim()]);
    if (rows.length) return rows[0].id_mun;
    const ins = await client.query(
      `INSERT INTO municipio (nom_mun) VALUES ($1) RETURNING id_mun`,
      [nombreMun.trim()]
    );
    return ins.rows[0].id_mun;
  }
}

// CREATE PEDIDO (POST /api/pedidos) -> guarda pedido y items, ahora con departamento/municipio
app.post('/api/pedidos', async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      cedula_cliente,
      id_tienda,
      cedula_rep = null,
      fhrs_pedido,
      fhrs_entrega = null,
      preciototal,
      id_estado,
      departamento = null,
      municipio = null
    } = req.body;

    await client.query('BEGIN');

    const id_dep = await ensureDepartamento(client, departamento);
    const id_mun = await ensureMunicipio(client, municipio, id_dep);

    const result = await client.query(
      `INSERT INTO pedido (cedula_cliente, id_tienda, cedula_rep, fhrs_pedido, fhrs_entrega, preciototal, id_estado, id_dep, id_mun)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id_pedido`,
      [cedula_cliente, id_tienda, cedula_rep, fhrs_pedido, fhrs_entrega, preciototal, id_estado, id_dep, id_mun]
    );

    await client.query('COMMIT');
    res.json({ ok: true, id_pedido: result.rows[0].id_pedido });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ error: 'No se pudo guardar el pedido', details: err.message });
  } finally {
    client.release();
  }
});

// CREATE ORDER (POST /api/orders) -> guarda pedido y items, ahora con departamento/municipio
app.post('/api/orders', async (req, res) => {
  const client = await pool.connect();
  try {
    const { productos, total, fecha, direccion, metodo, cliente, tienda, departamento = null, municipio = null } = req.body;

    await client.query('BEGIN');

    const id_dep = await ensureDepartamento(client, departamento);
    const id_mun = await ensureMunicipio(client, municipio, id_dep);

    // Guarda el pedido principal incluyendo referencias
    const pedidoRes = await client.query(
      `INSERT INTO pedido (cliente, fecha, direccion, metodo, total, tienda, id_dep, id_mun)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id_pedido`,
      [cliente, fecha, direccion, metodo, total, tienda, id_dep, id_mun]
    );
    const idPedido = pedidoRes.rows[0].id_pedido;

    // Guarda los productos del pedido
    for (const prod of productos) {
      await client.query(
        `INSERT INTO pedido_producto (id_pedido, nombre, precio, cantidad, tienda)
         VALUES ($1, $2, $3, $4, $5)`,
        [idPedido, prod.nombre, prod.precio, prod.cantidad || 1, prod.tienda || tienda]
      );
    }

    await client.query('COMMIT');
    res.json({ ok: true, idPedido });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ error: 'No se pudo guardar el pedido', details: err.message });
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

// LISTAR departamentos
app.get('/api/departamentos', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id_dep, nom_dep FROM departamento ORDER BY nom_dep');
    res.json({ ok: true, departamentos: rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// LISTAR municipios (opcional id_dep query)
app.get('/api/municipios', async (req, res) => {
  try {
    const { id_dep } = req.query;
    let result;
    if (id_dep) {
      result = await pool.query('SELECT id_mun, nom_mun, id_dep FROM municipio WHERE id_dep = $1 ORDER BY nom_mun', [id_dep]);
    } else {
      result = await pool.query('SELECT id_mun, nom_mun, id_dep FROM municipio ORDER BY nom_mun');
    }
    res.json({ ok: true, municipios: result.rows });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// CREAR departamento (si no existe)
app.post('/api/departamentos', async (req, res) => {
  const client = await pool.connect();
  try {
    const { nom_dep } = req.body;
    if (!nom_dep) return res.status(400).json({ ok: false, error: 'nom_dep requerido' });

    // buscar por nombre case-insensitive
    const sel = await client.query('SELECT id_dep FROM departamento WHERE lower(nom_dep) = lower($1) LIMIT 1', [nom_dep.trim()]);
    if (sel.rowCount) return res.json({ ok: true, id_dep: sel.rows[0].id_dep, existed: true });

    const ins = await client.query('INSERT INTO departamento (nom_dep) VALUES ($1) RETURNING id_dep', [nom_dep.trim()]);
    res.status(201).json({ ok: true, id_dep: ins.rows[0].id_dep, existed: false });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

// CREAR municipio (si no existe), opcionalmente ligado a id_dep
app.post('/api/municipios', async (req, res) => {
  const client = await pool.connect();
  try {
    const { nom_mun, id_dep = null } = req.body;
    if (!nom_mun) return res.status(400).json({ ok: false, error: 'nom_mun requerido' });

    // si se pasó id_dep, validar existencia
    if (id_dep) {
      const depCheck = await client.query('SELECT id_dep FROM departamento WHERE id_dep = $1 LIMIT 1', [id_dep]);
      if (!depCheck.rowCount) return res.status(400).json({ ok: false, error: 'id_dep no existe' });
    }

    // buscar existente (preferir con id_dep)
    let sel;
    if (id_dep) {
      sel = await client.query('SELECT id_mun FROM municipio WHERE id_dep = $1 AND lower(nom_mun) = lower($2) LIMIT 1', [id_dep, nom_mun.trim()]);
    } else {
      sel = await client.query('SELECT id_mun FROM municipio WHERE lower(nom_mun) = lower($1) LIMIT 1', [nom_mun.trim()]);
    }
    if (sel.rowCount) return res.json({ ok: true, id_mun: sel.rows[0].id_mun, existed: true });

    const ins = await client.query('INSERT INTO municipio (nom_mun, id_dep) VALUES ($1, $2) RETURNING id_mun', [nom_mun.trim(), id_dep]);
    res.status(201).json({ ok: true, id_mun: ins.rows[0].id_mun, existed: false });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

// Bulk import departamentos/municipios
// Body esperado: { departamentos: { "Valle del Cauca": ["Cali","Palmira"], "Antioquia": ["Medellín"] } }
app.post('/api/import-locations', async (req, res) => {
  const client = await pool.connect();
  try {
    const { departamentos } = req.body;
    if (!departamentos || typeof departamentos !== 'object') {
      return res.status(400).json({ ok: false, error: 'Objeto departamentos requerido' });
    }

    await client.query('BEGIN');
    let processedDeps = 0;
    let processedMuns = 0;

    for (const [depName, municipios] of Object.entries(departamentos)) {
      const id_dep = await ensureDepartamento(client, depName);
      processedDeps++;
      if (Array.isArray(municipios)) {
        for (const m of municipios) {
          await ensureMunicipio(client, m, id_dep);
          processedMuns++;
        }
      }
    }

    await client.query('COMMIT');
    res.json({ ok: true, processedDeps, processedMuns });
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    res.status(500).json({ ok: false, error: err.message });
  } finally {
    client.release();
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));