import pg from 'pg';

export const pool = new pg.Pool({

    host:"127.0.0.1",
    port:5432,
    database:"postgres",
    user:"postgres",
    password:"root"

})