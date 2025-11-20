import pg from 'pg';

export const pool = new pg.Pool({

    host:"localhost",
    port:5433,
    database:"PedidosYEMM",
    user:"postgres",
    password:"root"

})