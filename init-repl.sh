#!/bin/bash
set -e

# Create replication user
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    DO \$\$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='repl') THEN
        CREATE USER repl REPLICATION LOGIN PASSWORD 'replpass';
      END IF;
    END
    \$\$;
EOSQL

# Add pg_hba.conf entries
echo "host replication repl 0.0.0.0/0 trust" >> "$PGDATA/pg_hba.conf"
echo "host all all 0.0.0.0/0 md5" >> "$PGDATA/pg_hba.conf"