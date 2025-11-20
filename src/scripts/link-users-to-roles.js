import { pool } from '../database/connectionPostgreSQL.js';

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

    let stats = { linkedCliente: 0, linkedRepartidor: 0, skipped: 0 };
    for (const u of usersRes.rows) {
      const local = u.usuario.split('@')[0].toLowerCase();
      const roles = (u.roles || []).map(x => x && x.toLowerCase());

      if (roles.includes('cliente')) {
        // heurística: buscar cliente por nombre exacto o que empiece por local
        let cedula = null;
        let r = await client.query('SELECT cedula_cliente FROM cliente WHERE lower(nom_cliente) = $1 LIMIT 1', [local]);
        if (!r.rowCount) {
          r = await client.query('SELECT cedula_cliente FROM cliente WHERE lower(nom_cliente) LIKE $1 LIMIT 1', [local + '%']);
        }
        if (r.rowCount) cedula = r.rows[0].cedula_cliente;

        if (cedula) {
          await client.query('INSERT INTO cliente_usuario (cedula_cliente, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING', [cedula, u.id_usuario]);
          stats.linkedCliente++;
        } else {
          stats.skipped++;
          console.log(`No match cliente for usuario ${u.usuario}`);
        }
      }

      if (roles.includes('repartidor')) {
        let cedula = null;
        let r = await client.query('SELECT cedula_rep FROM repartidor WHERE lower(nom_rep) = $1 LIMIT 1', [local]);
        if (!r.rowCount) {
          r = await client.query('SELECT cedula_rep FROM repartidor WHERE lower(nom_rep) LIKE $1 LIMIT 1', [local + '%']);
        }
        if (r.rowCount) cedula = r.rows[0].cedula_rep;

        if (cedula) {
          await client.query('INSERT INTO repartidor_usuario (cedula_rep, id_usuario) VALUES ($1, $2) ON CONFLICT DO NOTHING', [cedula, u.id_usuario]);
          stats.linkedRepartidor++;
        } else {
          stats.skipped++;
          console.log(`No match repartidor for usuario ${u.usuario}`);
        }
      }
    }

    await client.query('COMMIT');
    console.log('Finished. Stats:', stats);
  } catch (err) {
    await client.query('ROLLBACK').catch(()=>{});
    console.error('Error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
}

run();