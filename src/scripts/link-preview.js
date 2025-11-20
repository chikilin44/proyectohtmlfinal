import { pool } from '../database/connectionPostgreSQL.js';

async function run() {
  const client = await pool.connect();
  try {
    const usersRes = await client.query(`
      SELECT u.id_usuario, u.usuario, array_agg(r.nombre_rol) as roles
      FROM usuario u
      LEFT JOIN usuario_rol ur ON ur.id_usuario = u.id_usuario
      LEFT JOIN rol r ON r.id_rol = ur.id_rol
      GROUP BY u.id_usuario, u.usuario
    `);

    for (const u of usersRes.rows) {
      const local = (u.usuario.split('@')[0] || '').toLowerCase().replace(/[\.\-_+]/g,' ');
      const tokens = local.split(' ').filter(Boolean);
      console.log('\\nUsuario:', u.usuario, 'roles:', u.roles);

      for (const t of tokens) {
        const c = await client.query(`SELECT cedula_cliente, nom_cliente, ape_cliente FROM cliente WHERE lower(nom_cliente) LIKE $1 OR lower(ape_cliente) LIKE $1 LIMIT 5`, [ '%' + t + '%' ]);
        if (c.rowCount) console.log('  Coincidencias cliente token=' + t + ':', c.rows);

        const r = await client.query(`SELECT cedula_rep, nom_rep FROM repartidor WHERE lower(nom_rep) LIKE $1 LIMIT 5`, [ '%' + t + '%' ]);
        if (r.rowCount) console.log('  Coincidencias repartidor token=' + t + ':', r.rows);
      }
    }
  } catch (err) {
    console.error(err);
  } finally {
    client.release();
    process.exit();
  }
}
run();