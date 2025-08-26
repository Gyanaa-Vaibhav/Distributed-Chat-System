# 🗄️ Database Layer Overview

This folder provides a modular and extendable setup for managing database connections and queries using a Singleton-based architecture.

---

## Core Concepts

### 1. `Database` Singleton

- Handles storing a single DB connection (PostgreSQL, MongoDB, etc.)
- Prevents reinitialization or multiple active DB pools.
- Use `initialiseDB(connection)` at startup and `getInstance()` elsewhere.

### 2. `PostgresDB`

- Wraps the generic Database and casts the instance to a PostgreSQL Pool.
- Allows safe, typed access to PostgreSQL-specific features.

---

## Usage Example

```ts
// Initialise once at app startup
const pool = new Pool({ /* credentials */ });
Database.initialiseDB(pool);

// Access DB instance in query classes
const db = PostgresDB.getInstance();
const result = await db.query("SELECT * FROM users");
```

---

## How to Extend for Another DB (e.g., MongoDB)

1. Create a new wrapper class:
```ts
export class MongoDB {
  public static getInstance() {
    return Database.getInstance() as MongoClient;
  }
}
```

2. Initialize once using `Database.initialiseDB(yourMongoClient)`.

3. Now all query files can use `MongoDB.getInstance()` instead.

---
## How to Switch Database Engines

Just like the cache layer, this database architecture allows you to swap database clients easily.

### Example: Switching from PostgreSQL to MongoDB

1. Create a new wrapper class:
```ts
// MongoDB.ts
export class MongoDB {
  public static getInstance() {
    return Database.getInstance() as MongoClient;
  }
}
```

2. In your app initialization:
```ts
// Use MongoClient instance here
Database.initialiseDB(mongoClientInstance);
```

3. In your query files:
```ts
// Instead of PostgresDB
import { MongoDB as Database } from './databaseExports';
```

This way, all your logic can use `Database.getInstance()` generically, and switching clients is isolated to a few lines of setup and import changes.

---

### Switching Query Logic

Organize queries per engine inside folders like this:

```
getQueries/
├── postgres/
│   └── getLink.ts
├── mongo/
│   └── getLink.ts
├── index.ts // Central export
```

In `getQueries/index.ts`, control which DB implementation to use:

```ts
// getQueries/index.ts
export * from './postgres/getLink';
// export * from './mongo/getLink';
```

Now when you switch from PostgreSQL to MongoDB, you update:

- `databaseExports.ts` to import the correct wrapper (`PostgresDB` → `MongoDB`)
- `getQueries/index.ts` to point to the new query logic

This ensures your app uses the correct queries and client with minimal changes.

---

### Benefits

- Singleton ensures a consistent, shared DB instance
- Easy to swap database engines without major rewrites
- Clear separation of concerns (add/get/etc.)
- Easy to test and extend
