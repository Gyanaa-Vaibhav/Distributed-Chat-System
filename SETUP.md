# Distributed Chat System – Setup Guide

This guide walks you through setting up the **Distributed Chat System** locally (via Docker Compose) or deploying it in production (via Kubernetes).

---

## Requirements

- **Docker** & **Docker Compose v2+**
- **Node.js v20+** (if running services manually outside Docker)
- **Kubernetes (v1.27+)** with `kubectl` & (optionally) Helm
- **Redis** & **PostgreSQL** credentials (provided via `.env` files)
- **.env files** for each service (see [Environment Variables](#environment-variables))

---

## Environment Variables

### Root `.env`
Used by **Docker Compose** to wire services together.

| Variable             | Example Value                 | Description |
|-----------------------|-------------------------------|-------------|
| `FRONTEND_ENV`       | `./Frontend/.env`             | Path to frontend `.env` file |
| `API_GATEWAY_ENV`    | `./Backend/api-gateway/.env`  | Path to API Gateway `.env` file |
| `AUTH_SERVICE_ENV`   | `./Backend/auth-service/.env` | Path to Auth Service `.env` file |
| `WS_GATEWAY_ENV`     | `./Backend/ws-gateway/.env`   | Path to WS Gateway `.env` file |
| `DB_SERVICE_ENV`     | `./Backend/db-service/.env`   | Path to DB Service `.env` file |
| `FRONTEND_PORT`      | `3000`                        | Port exposed by frontend |
| `API_SERVER_PORT`    | `3001`                        | Port exposed by API Gateway |
| `WS_GATEWAY_PORT`    | `3002`                        | Port exposed by WS Gateway (via Nginx) |
| `AUTH_SERVICE_PORT`  | `3003`                        | Port exposed by Auth Service |
| `DB_SERVICE_PORT`    | `3004`                        | Port exposed by DB Service |
| `DB_USER`            | `chat_user`                   | PostgreSQL username |
| `DB_NAME`            | `chat_db`                     | PostgreSQL database name |
| `DB_PASSWORD`        | `secret`                      | PostgreSQL password |

---

### API Gateway `.env`
Located in `Backend/api-gateway/.env`.

| Variable           | Example Value | Description |
|---------------------|---------------|-------------|
| `API_SERVER_PORT`  | `3001`        | Port exposed by API Gateway |

---

### Auth Service `.env`
Located in `Backend/auth-service/.env`.

| Variable            | Example Value | Description |
|----------------------|---------------|-------------|
| `AUTH_SERVICE_PORT` | `3003`        | Port exposed by Auth Service |
| `ACCESS_SECRET`     | `supersecret` | Secret for signing access tokens |
| `REFRESH_SECRET`    | `refreshkey`  | Secret for signing refresh tokens |

---

### DB Service `.env`
Located in `Backend/db-service/.env`.

| Variable             | Example Value | Description |
|-----------------------|---------------|-------------|
| `DB_SERVICE_PORT`    | `3004`        | Port exposed by DB Service |
| `DB_WRITE_HOSTNAME`  | `psql-write`  | Hostname of PostgreSQL leader (write node) |
| `DB_READ_HOSTNAME`   | `psql-read`   | Hostname of PostgreSQL replica (read node) |
| `DB_USER`            | `chat_user`   | PostgreSQL username |
| `DB_NAME`            | `chat_db`     | PostgreSQL database name |
| `DB_PASSWORD`        | `secret`      | PostgreSQL password |

---

### WS Gateway `.env`
Located in `Backend/ws-gateway/.env`.

| Variable           | Example Value | Description |
|---------------------|---------------|-------------|
| `WS_GATEWAY_PORT`  | `3002`        | Port exposed by WS Gateway |

---

Great 🚀 let’s continue. Here’s the **Local Development** section for your `setup.md`.

---

## Local Development

The system ships with a `docker-compose.yml` for local development.
This spins up all services (frontend, API, auth, WebSocket, DB, Redis, Nginx load balancer).

---

### 1. Prepare `.env` files
- Create `.env` in the **root folder** and in each microservice (`api-gateway`, `auth-service`, `db-service`, `ws-gateway`, `Frontend`).
- See [Environment Variables](#environment-variables) for reference values.

---

### 2. Start Containers
Run the full system locally:

```bash
docker compose --env-file .env up --build
```

This starts:

* **frontend** → Astro + React UI
* **api-gateway** → routes HTTP requests
* **auth-service** → issues/validates JWTs
* **db-service** → cache-first DB layer (Redis + Postgres)
* **ws-gateway (2 pods)** → WebSocket fan-out, balanced by Nginx
* **services** → shared utility container
* **redis-cache** → caching layer
* **redis-pub-sub** → pub/sub broker
* **psql-write / psql-read** → Postgres primary + replica

---

### 3. Access the App

* Frontend: [http://localhost:3000](http://localhost:3000)
* API Gateway: [http://localhost:3001](http://localhost:3001)
* WebSocket Gateway: ws\://localhost:3002 (via Nginx load balancer)
* Auth Service: [http://localhost:3003](http://localhost:3003)
* DB Service: [http://localhost:3004](http://localhost:3004)

---

### 4. Development Notes

* **Hot Reload**:

  * Frontend auto-reloads (Astro + Vite).
  * Backend services run in watch mode inside containers.

* **Logs**:

  * Mounted to `./logs/` by default (see root `.env`).

* **Postgres Replication**:

  * `psql-write` → leader (all writes).
  * `psql-read` → replica (read-only).
  * Replication initialized via `init-repl.sh`.

---

### 5. Stop & Clean Up

To stop containers and remove volumes:

```bash
docker compose down -v
```

To prune old images:

```bash
docker image prune -f
```

---

## Production Deployment

You can deploy the **Distributed Chat System** either with **Docker Compose (production mode)** or on **Kubernetes**.

---

### Option 1: Docker Compose (Production)

A production-optimized compose file can be used (no hot reload, prebuilt frontend).

Run:
```bash
docker compose -f docker-compose-prod.yml --env-file .env up --build -d
````

Key differences vs. development:

* **Frontend** is prebuilt and served statically.
* No volume mounts (containers run standalone).
* **Redis** and **Postgres** data persisted via Docker volumes.
* **Nginx** handles WebSocket load balancing.

Stop & remove:

```bash
docker compose -f docker-compose-prod.yml down -v
```

---

### Option 2: Kubernetes Deployment

For scalable production, deploy to Kubernetes. All manifests live under `/k8s/prouction-deployment/`.

#### 1. Namespace

Ensure the namespace exists:

```bash
kubectl get ns distributed-chat-system || \
kubectl create ns distributed-chat-system
```

#### 2. Secrets

Create secrets for DB credentials and JWT keys:

```yaml
# k8s/prouction-deployment/secrets.yml
apiVersion: v1
kind: Secret
metadata:
  name: chat-secrets
  namespace: distributed-chat-system
type: Opaque
stringData:
  DB_USER: chat_user
  DB_PASSWORD: secret
  DB_NAME: chat_db
  ACCESS_SECRET: supersecret
  REFRESH_SECRET: refreshkey
```

Apply:

```bash
kubectl apply -f k8s/prouction-deployment/secrets.yml
```

#### 3. Database (Patroni + PostgreSQL)

Deploy the HA Postgres cluster:

```bash
kubectl apply -f k8s/prouction-deployment/patroni-psql.yml
```

This brings up **1 leader + replicas** with automatic failover.

#### 4. Microservices

Deploy API Gateway, Auth Service, WS Gateway (multiple replicas), DB Service, and Frontend using your existing manifests.
Each service pulls its environment variables from `chat-secrets`:

```yaml
envFrom:
  - secretRef:
      name: chat-secrets
```

#### 5. Scaling
Horizontal Pod Autoscaling (HPA) is already configured in the manifests.

If you need to adjust thresholds (CPU %, min/max replicas), update the relevant HPA YAML under:

```
k8s/prouction-deployment/
````

and re-apply:

```bash
kubectl apply -f k8s/prouction-deployment/
````


---

✅ With this setup:

* **Compose** gives you a quick production build.
* **Kubernetes** provides high availability, secrets management, and autoscaling in `distributed-chat-system` namespace.

---

