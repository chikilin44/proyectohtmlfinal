require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// GET /api/productos  (opcional ?categoria=pizza|hamburguesa|bebidas)
app.get('/api/productos', async (req, res) => {
  try {
    const categoria = (req.query.categoria || '').toLowerCase();
    let q, params = [];
    if (categoria === 'pizza') {
      q = `SELECT p.id_producto AS id, p.nom_producto AS nombre, p.descripcion, p.precio, p.imagen AS img, 'pizza' AS categoria
           FROM producto p JOIN pizza z ON p.id_producto = z.id_producto
           ORDER BY p.nom_producto`;
    } else if (categoria === 'hamburguesa') {
      q = `SELECT p.id_producto AS id, p.nom_producto AS nombre, p.descripcion, p.precio, p.imagen AS img, 'hamburguesa' AS categoria
           FROM producto p JOIN hamburguesa h ON p.id_producto = h.id_producto
           ORDER BY p.nom_producto`;
    } else if (categoria === 'bebidas' || categoria === 'bebida') {
      q = `SELECT p.id_producto AS id, p.nom_producto AS nombre, p.descripcion, p.precio, p.imagen AS img, 'bebida' AS categoria
           FROM producto p JOIN bebidas b ON p.id_producto = b.id_producto
           ORDER BY p.nom_producto`;
    } else {
      q = `SELECT p.id_producto AS id, p.nom_producto AS nombre, p.descripcion, p.precio, p.imagen AS img, 
                  CASE 
                    WHEN EXISTS (SELECT 1 FROM pizza z WHERE z.id_producto = p.id_producto) THEN 'pizza'
                    WHEN EXISTS (SELECT 1 FROM hamburguesa h WHERE h.id_producto = p.id_producto) THEN 'hamburguesa'
                    WHEN EXISTS (SELECT 1 FROM bebidas b WHERE b.id_producto = p.id_producto) THEN 'bebida'
                    ELSE 'otro'
                  END AS categoria
           FROM producto p
           ORDER BY p.nom_producto`;
    }

    const { rows } = await pool.query(q, params);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/productos error:', err);
    res.status(500).json({ error: 'Error en BD' });
  }
});

// POST /api/pedidos
// body esperado: { cedula_cliente, id_tienda, total, productos: [{id_producto, cantidad, precio_uni}] }
app.post('/api/pedidos', async (req, res) => {
  const { cedula_cliente, id_tienda, total, productos } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const insertPedido = `
      INSERT INTO pedido (cedula_cliente, id_tienda, precioTotal, id_estado)
      VALUES ($1, $2, $3, $4) RETURNING id_pedido, fhrs_pedido`;
    // por defecto estado = 1 (ajusta según tus datos en Estado_Pedidos)
    const estadoPorDefecto = 1;
    const r = await client.query(insertPedido, [cedula_cliente || null, id_tienda || null, total || 0, estadoPorDefecto]);
    const idPedido = r.rows[0].id_pedido;

    const insertItem = `INSERT INTO ped_producto (id_pedido, id_producto, cantidad, precio_uni) VALUES ($1,$2,$3,$4)`;
    for (const it of (productos || [])) {
      await client.query(insertItem, [idPedido, it.id_producto, it.cantidad || 1, it.precio_uni || 0]);
    }

    // opcional: insertar historial estado inicial
    await client.query(
      `INSERT INTO histo_pedidos (id_pedido, id_estado) VALUES ($1,$2)`,
      [idPedido, estadoPorDefecto]
    );

    await client.query('COMMIT');
    res.json({ ok: true, id_pedido: idPedido, fhrs_pedido: r.rows[0].fhrs_pedido });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('POST /api/pedidos error:', e);
    res.status(500).json({ error: 'No se pudo crear pedido' });
  } finally {
    client.release();
  }
});

// GET /api/pedidos  (listado simple)
app.get('/api/pedidos', async (req, res) => {
  try {
    const q = `SELECT id_pedido AS id, cedula_cliente AS cliente, id_tienda AS tienda,
                      precioTotal AS total, fhrs_pedido AS fecha, id_estado AS estado
               FROM pedido
               ORDER BY fhrs_pedido DESC`;
    const { rows } = await pool.query(q);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/pedidos error:', err);
    res.status(500).json({ error: 'Error en BD' });
  }
});

app.use('/', express.static('../')); // sirve frontend si quieres
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));