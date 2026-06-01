# 🚀 Setup & Installation Instructions

Follow this guide to deploy, seed, and test the containerized IndiTrade B2B marketplace sandbox on your local development workstation.

---

## 1. Prerequisites

Before starting, ensure that your host system has the following software installed:
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v20.10+ with Docker Compose v2.0+)
*   A terminal interface (PowerShell, Bash, or Zsh)

---

## 2. Local Environment Configuration

IndiTrade utilizes a single, centralized environment configuration file located at the project root directory.

Create a file named `.env` in the root workspace folder (`c:\Users\DELL\Documents\project market`) and copy the following environment variables:

```ini
# Relational Database Master Credentials
POSTGRES_DB=inditrade
POSTGRES_USER=postgres
POSTGRES_PASSWORD=inditrade_secure_db_pass_2026_xYz987

# Cryptographic Keys & Tokens
JWT_SECRET=inditrade_jwt_secret_key_2026_super_secure_sha256_hash_value

# Internal Container Routing (Used for Service-to-Service Networking)
DATABASE_URL=postgres://postgres:inditrade_secure_db_pass_2026_xYz987@inditrade-postgres:5432/inditrade
DATABASE_SSL=false

# Service Discovery Ports
PORT=8000
COMPUTE_SERVICE_URL=http://go-compute:8080

# Client Browser Direct Access (Exposed Sourcing Ports)
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_COMPUTE_URL=http://localhost:8080
```

---

## 3. Bootstrapping the Platform Stack

To build and orchestrate all four microservices in the background, run the following Docker command inside the project root directory:

```bash
docker-compose up -d --build
```

### Automatic Bootstrap Operations
When the command runs, Docker Compose handles the following operations sequentially:
1.  **Orchestrator Boot**: Launches `inditrade-postgres` database engine on internal networks.
2.  **Stateless Calc compilation**: Builds the **Go calculations binary** into an ultra-pruned container runner.
3.  **API Gateway Construction**: Compiles the Express web gateway service and exposes port `8000`.
4.  **Sourcing Storefront Assembly**: Bundles and deploys the Next.js storefront client workspace on port `3000`.
5.  **Schema Synchronizations**: Express gateway calls Sequelize ORM to compile, verify, and synchronize all database column mappings, automatically enabling audit timestamps on the fly.
6.  **Database Seeding**: Injects default sandbox accounts and records into the relational store.

### Verifying Service Health
Ensure all four containers are running and healthy:
```bash
docker-compose ps
```

The output should show:
*   `inditrade-postgres` - **Up (healthy)** - Port `5432`
*   `inditrade-go-compute` - **Up (healthy)** - Port `8080`
*   `inditrade-node-gateway` - **Up (healthy)** - Port `8000`
*   `inditrade-nextjs-storefront` - **Up (healthy)** - Port `3000`

---

## 4. Sandbox Test Credentials

Use these pre-seeded sandbox accounts to test and verify permission structures, gating, and progressive onboarding pathways:

| Account Sourcing Role | Email Address | Password | Initial State & Purpose |
| :--- | :--- | :--- | :--- |
| **Procurement Buyer** (Buyer Only) | `buyer@inditrade.com` | `password123` | Active buyer. KYC unverified. Used to test Aadhaar KYC gating. |
| **Pending Seller** (Buyer + Seller) | `pending_seller@inditrade.com` | `password123` | Buyer with a submitted seller profile. Used to test admin approvals. |
| **Verified Supplier** (Seller Only) | `seller@inditrade.com` | `password123` | Fully approved supplier profile. Used to test listings and bids. |
| **Platform Administrator** (Admin) | `admin@inditrade.com` | `admin123` | Admin access. Used to verify, approve, or reject seller onboarding. |

---

## 5. Running the Automated Testing Suite

IndiTrade includes a fast, zero-dependency native testing suite executing password hashing, JWT claims, progressive onboarding transitions, and full Sequelize integration tests on a mock database:

### Command
To execute the tests inside the Express API gateway container, run:
```bash
docker exec -it inditrade-node-gateway npm test
```

### Coverage Scope
1.  **Auth Suite (`tests/auth.test.js`)**: Asserts password security hashing via `bcryptjs` and signs, decodes, and validates claims structures inside JWT authorization tokens.
2.  **Integration Suite (`tests/integration.test.js`)**: Mounts an in-memory SQLite sandbox database, synchronizes the Sequelize relational schemas with full timestamp columns enabled, and tests end-to-end seller onboarding transitions, supplier registrations, RFQ listings, and bid updates.

---

## 6. Maintenance & Troubleshooting

### Resetting the Relational Store
When making database schema updates (such as adding/modifying model column attributes), reset the local environment to rebuild PostgreSQL configurations from scratch:
```bash
# Prune database container volume
docker-compose down -v

# Relaunch fresh cluster
docker-compose up -d --build
```

### Viewing Real-Time Logs
To stream logs from any active service, run:
```bash
docker-compose logs -f [service_name]
# Examples:
# docker-compose logs -f node-gateway
# docker-compose logs -f go-compute
```
