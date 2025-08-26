import {Pool} from 'pg';
import dotenv from 'dotenv';
import {logError} from '../../serviceImports.js';
dotenv.config()

/**
 * Core Database holder class following the Singleton pattern.
 *
 * - Stores a single database instance, agnostic to the DB engine (PostgreSQL, MongoDB, etc.)
 * - Enforces one-time initialization using `initialiseDB()`
 * - Use `getInstance()` to access the stored DB instance
 *
 * Designed to be extended or wrapped by DB-specific service classes (e.g., PostgresDB, MongoDB).
 */
class Database{
    private static database: { [key: string]: unknown } = {};

    /**
     * Returns the initialized database instance.
     * Throws an error if called before initialization.
     */
    public static getInstance(name: string) {
        if (!Database.database[name]) {
            logError(`Database "${name}" not initialised`);
            throw new Error(`Database "${name}" not initialised`);
        }
        return Database.database[name];
    }

    /**
     * Initializes the database instance once.
     * Subsequent calls with a connection will throw an error.
     *
     * @param name
     * @param DBConnection - The DB connection object to store (e.g., Pool, MongoClient)
     */
    public static initialiseDB(name:string,DBConnection:unknown){
        if (Database.database[name]) {
            logError(`Database "${name}" already initialised`);
            throw new Error(`Database "${name}" already initialised`);
        }
        Database.database[name] = DBConnection;
        if(DBConnection instanceof Pool)
            DBConnection.query("SELECT NOW()")
                .catch((err: unknown) => {
                    if (err instanceof Error) {
                        logError(`Database connection failed: ${err.message}`);
                    } else {
                        logError("Database connection failed with unknown error type.");
                    }

                    throw new Error("Database Connection Failed");
                });
        }
}

/**
 * PostgreSQL-specific database accessor.
 *
 * - Wraps the core `Database` singleton.
 * - Casts the instance to `pg.Pool` for type-safe PostgreSQL usage.
 *
 * Extend this pattern to support other databases:
 * e.g., MongoDB class wrapping `MongoClient`, reusing the same `Database` core.
 */
export class PostgresDB{
    /**
     * Returns the database instance as a PostgreSQL Pool.
     */
    public static getInstance(name:string){
        return Database.getInstance(name) as Pool;
    }
}

const writeHost = process.env.DB_WRITE_HOSTNAME
const readHost = process.env.DB_READ_HOSTNAME
const user = process.env.DB_USER;
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME;
const port = 5432

if(!database || !writeHost || !password || !user || !port || !readHost){
    logError("env's not configured, make sure you have .env available")
}

const writePool = new Pool({
    host: writeHost,
    password: password,
    user: user,
    port: port,
    database: database,
})

const readPool = new Pool({
    host: readHost,
    password: password,
    user: user,
    port: port,
    database: database,
})

Database.initialiseDB('write', writePool)
Database.initialiseDB('read', readPool)

// Example test
const writeDb = PostgresDB.getInstance("write")
const write = await writeDb.query("Select now()")
console.log("Write",write.rows)

const readDb = PostgresDB.getInstance("read")
const read = await readDb.query("Select now()")
console.log("Read",read.rows)

