import { pool } from '../database/connectionPostgreSQL.js';

function normalizeLocal(local) {
  return local
    .toLowerCase()
    .replace(/[\.\-_+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function findClienteCedula(client, local) {
  const tokens = local.split(' ').filter(Boolean);
  // 1) exact name / surname
  let r = await client.query(
    `SELECT cedula_cliente FROM cliente
     WHERE lower(nom_cliente) = $1 OR lower(ape_cliente) = $1 LIMIT 1`,
    [local]
  );
  if (r.rowCount) return r.rows[0].cedula_cliente;

  // 2) startswith any token
  for (const t of tokens) {
    r = await client.query(
      `SELECT cedula_cliente FROM cliente
       WHERE lower(nom_cliente) LIKE $1 OR lower(ape_cliente) LIKE $1 LIMIT 1`,
      [t + '%']
    );
    if (r.rowCount) return r.rows[0].cedula_cliente;
  }

  // 3) contains all tokens (combined)
  if (tokens.length) {
    const combined = '%' + tokens.join('%') + '%';
    r = await client.query(
      `SELECT cedula_cliente FROM cliente
       WHERE lower(coalesce(nom_cliente,'') || ' ' || coalesce(ape_cliente,'')) LIKE $1 LIMIT 1`,
      [combined]
    );
    if (r.rowCount) return r.rows[0].cedula_cliente;
  }

  return null;
}

async function findRepartidorCedula(client, local) {
  const tokens = local.split(' ').filter(Boolean);
  let r = await client.query(
    `SELECT cedula_rep FROM repartidor
     WHERE lower(nom_rep) = $1 LIMIT 1`,
    [local]
  );
  if (r.rowCount) return r.rows[0].cedula_rep;

  for (const t of tokens) {
    r = await client.query(
      `SELECT cedula_rep FROM repartidor WHERE lower(nom_rep) LIKE $1 LIMIT 1`,
      [t + '%']
    );
    if (r.rowCount) return r.rows[0].cedula_rep;
  }

  if (tokens.length) {
    const combined = '%' + tokens.join('%') + '%';
    r = await client.query(
      `SELECT cedula_rep FROM repartidor WHERE lower(nom_rep) LIKE $1 LIMIT 1`,
      [combined]
    );
    if (r.rowCount) return r.rows[0].cedula_rep;
  }

  return null;
}

async function run() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const usersRes = await client.query(`
      SELECT u.id_usuario, u.usuario, array_agg(r.nombre_rol) as roles
      FROM usuario u
      LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
      LEFT JOIN rol r ON r.id_rol = ur.id_rol
      GROUP BY u.id_usuario, u.usuario
    `);

    const stats = { linkedCliente: 0, linkedRepartidor: 0, skipped: 0 };
    const unmatched = [];

    for (const u of usersRes.rows) {
      const localRaw = u.usuario.split('@')[0] || '';
      const local = normalizeLocal(localRaw);
      const roles = (u.roles || []).map(x => x && x.toLowerCase());

      let matched = false;

      if (roles.includes('cliente')) {
        const ced = await findClienteCedula(client, local);
        if (ced) {
          await client.query(
            `INSERT INTO cliente_usuario (cedula_cliente, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [ced, u.id_usuario]
          );
          stats.linkedCliente++;
          matched = true;
          console.log(`Linked cliente: user=${u.usuario} -> cedula=${ced}`);
        }
      }

      if (roles.includes('repartidor')) {
        const ced = await findRepartidorCedula(client, local);
        if (ced) {
          await client.query(
            `INSERT INTO repartidor_usuario (cedula_rep, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [ced, u.id_usuario]
          );
          stats.linkedRepartidor++;
          matched = true;
          console.log(`Linked repartidor: user=${u.usuario} -> cedula=${ced}`);
        }
      }

      if (!matched) {
        stats.skipped++;
        unmatched.push(u.usuario);
        console.log(`No match for usuario ${u.usuario}`);
      }
    }

    await client.query('COMMIT');
    console.log('Finished. Stats:', stats);
    if (unmatched.length) console.log('Unmatched users:', unmatched);
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Error linking users:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();