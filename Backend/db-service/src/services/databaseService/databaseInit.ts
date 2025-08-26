import {Pool} from "pg";
const host = process.env.DB_WRITE_HOSTNAME;
const password = process.env.DB_PASSWORD;
const user = process.env.DB_USER;
const port = 5432;
const database = process.env.DB_NAME;

const pool = new Pool({
    host: host,
    password: password,
    user: user,
    port: port,
    database: database,
})

const db = pool
const userInitQuery =`SELECT now()`;
const userQueryResult = await db.query(userInitQuery)
console.log(userQueryResult);
