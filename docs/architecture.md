# 🏛️ BuyEway Architecture Guide — v1.1

**Last Updated:** June 2, 2026  
**Status:** ✅ Production-stable local stack. Auth fully functional.

BuyEway is an enterprise-grade, modular B2B wholesale marketplace for regional Indian manufacturing clusters. It enables bulk procurement, progressive seller onboarding, RFQ-based sourcing, and secure SafeTrade escrow contracts.

---

## 1. System Topology — How Services Connect

```
 ┌─────────────────────────────────────────────────────────────┐
 │                    USER'S BROWSER                           │
 │         Opens http://localhost:3000 (Next.js UI)            │
 └──────┬──────────────────────────┬───────────────────────────┘
        │                          │
        │ Auth/API calls           │ Freight/GST sizing calls
        │ http://localhost:8000    │ http://localhost:8080
        ▼                          ▼
 ┌─────────────────┐    ┌──────────────────────┐
 │  NODE GATEWAY   │    │   GO COMPUTE ENGINE  │
 │  Express/Node   │    │   Stateless Go HTTP  │
 │  Port: 8000     │    │   Port: 8080         │
 │  - JWT Auth     │    │   - MOQ pricing      │
 │  - RBAC roles   │    │   - GST calculation  │
 │  - Zod validate │    │   - Freight sizing   │
 │  - Rate limits  │    │   - Zero dependencies│
 └────────┬────────┘    └──────────────────────┘
          │
          │ Sequelize ORM
          ▼
 ┌──────────────────┐   ┌──────────────────┐
 │   POSTGRESQL 15  │   │   REDIS 7        │
 │   Port: 5432     │   │   Port: 6379     │
 │   Primary store  │   │   Cache layer    │
 └──────────────────┘   └──────────────────┘

 ┌─────────────────────────────────────────────────────────────┐
 │                  NGINX REVERSE PROXY                        │
 │  Port 80 — routes /api/v1/* → Gateway, / → Storefront      │
 │  /compute/* → Go Engine                                     │
 └─────────────────────────────────────────────────────────────┘
```

### ⚠️ Critical Networking Rule (MUST READ)
> `NEXT_PUBLIC_*` environment variables in Next.js are **baked into the JavaScript bundle at Docker build time**, not at runtime. They must be passed as `ARG` in the Dockerfile builder stage AND as `build.args` in docker-compose.yml.
>
> The browser runs on the **user's host machine**, not inside Docker. It cannot resolve internal Docker hostnames like `node-gateway` or `nextjs-storefront`. It can only reach **exposed host ports**: `3000`, `8000`, `8080`, `80`.
>
> Correct URL pattern: `http://localhost:8000/api/v1` (absolute, using host-exposed port)  
> Wrong URL pattern: `/api/v1` (relative — Next.js serves its own 404 HTML page for unknown routes)

---

## 2. Docker Container Map

| Container | Image | Internal Port | Host Port | Role |
|-----------|-------|--------------|-----------|------|
| `buyeway-nginx` | `nginx:1.25-alpine` | 80 | **80** | Reverse proxy ingress |
| `buyeway-nextjs-storefront` | Custom build | 3000 | **3000** | UI storefront |
| `buyeway-node-gateway` | Custom build | 8000 | **8000** | API gateway |
| `buyeway-go-compute` | Custom build | 8080 | **8080** | Calc microservice |
| `buyeway-postgres` | `postgres:15-alpine` | 5432 | **5432** | Primary database |
| `buyeway-redis` | `redis:7-alpine` | 6379 | **6379** | Cache/sessions |

### Startup Order (enforced by `depends_on` + health checks)
```
postgres, redis, go-compute → HEALTHY
        ↓
  node-gateway → HEALTHY
        ↓
nextjs-storefront → HEALTHY
        ↓
     nginx → STARTED
```

---

## 3. Service Details

### 🖥️ Next.js 14 Storefront (`/storefront-nextjs`)
- **Stack:** React 18, Next.js 14 App Router, Vanilla CSS, TanStack React Query
- **Entry:** `src/app/page.tsx` — single-page portal
- **API Layer:** `src/lib/apiClient.ts` — centralized fetch wrapper with error handling, token injection, non-JSON guard
- **Auth State:** Stored in `localStorage` under keys `buyeway_jwt_token` and `buyeway_user`
- **Key Components:**
  - `AuthModal.tsx` — Login/Register modal (uses `loginApi`, `registerApi` from apiClient)
  - `Header.tsx` — Nav with auth state
  - `Marketplace.tsx` — Product catalog grid
  - `RfqBoard.tsx` — Live sourcing RFQ feed
  - `SupplierDashboard.tsx` — Seller workspace
  - `AdminDashboard.tsx` — Admin approval console
  - `SellerOnboarding.tsx` — Multi-step seller onboarding wizard
  - `ProductDetail.tsx` — Product detail + escrow calculator

### 🔌 API Gateway (`/gateway-nestjs`)
- **Stack:** Node.js 18, Express, Sequelize ORM, PostgreSQL/SQLite, bcryptjs, jsonwebtoken
- **Entry:** `server.js`
- **Auth Routes:** `POST /api/v1/auth/login`, `POST /api/v1/auth/register`, `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`, `POST /api/v1/auth/verify-buyer`
- **Seller Onboarding:** `POST /api/v1/auth/seller-step1`, `POST /api/v1/auth/seller-step2`, `POST /api/v1/auth/seller-approve`
- **CORS:** Explicitly allows `http://localhost:3000`, `http://localhost`, `http://127.0.0.1:3000`
- **Rate Limiting:** 100 req/15min general, 5 req/15min on auth endpoints

### 🧮 Go Compute Service (`/compute-service-go`)
- **Stack:** Go 1.20, zero-dependency native `net/http`
- **Endpoint:** `POST /calculate`
- **Logic:** MOQ tier pricing, CGST/SGST (intrastate) vs IGST (interstate), carrier freight rates

---

## 4. Database Entity Schema

```
USER ──────────────── SUPPLIER (one-to-one via userId)
  │                       │
  │                       └── PRODUCT ──── PRICE_TIER (volume tiers)
  │
  ├── RFQ ──── BID
  │
  └── ORDER
```

### Models
| Model | Key Fields |
|-------|-----------|
| `User` | `id, name, email, password(hashed), role(buyer/supplier/admin), sellerStatus, isKycVerified` |
| `Supplier` | `id, name, location, state, gstin, iso, trustScore, userId(FK)` |
| `Product` | `id, name, category, hub, moq, unit, weightPerUnit, hsn, supplierId(FK)` |
| `PriceTier` | `id, productId(FK), min, max, price` |
| `Rfq` | `id, title, category, quantity, targetPrice, buyerName, status` |
| `Bid` | `id, rfqId(FK), supplierName, bidPrice, logisticsTerms` |
| `Order` | `id, orderCode, productName, quantity, subtotal, tax, freight, total, status` |

---

## 5. Key Workflows

### 🔐 Auth Flow
1. User submits email/password via `AuthModal.tsx`
2. `loginApi()` in `apiClient.ts` POSTs to `http://localhost:8000/api/v1/auth/login`
3. Gateway validates credentials with `bcryptjs`, returns signed JWT
4. Token stored in `localStorage.buyeway_jwt_token`, user in `localStorage.buyeway_user`
5. All subsequent protected requests inject `Authorization: Bearer <token>` header
6. On logout: `logoutApi()` calls `POST /auth/logout`, then clears localStorage

### 🏭 Seller Onboarding Flow
```
Register (role: buyer)
  → Step 1: Submit GSTIN + company profile → sellerStatus: "pending_docs"
  → Step 2: Upload certificates → sellerStatus: "pending_approval"
  → Admin reviews in AdminDashboard → approves → role becomes "supplier"
```

### 💳 SafeTrade Escrow Flow
1. Buyer selects product, enters quantity
2. `handleEscrowSizing()` calls `http://localhost:8080/calculate`
3. Go engine returns: subtotal, tax (CGST+SGST or IGST), freight, total
4. Buyer confirms → `POST /api/v1/orders` → Order stored as `Escrow Funded`

---

## 6. Test Credentials (Always Available via Seeder)

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Buyer | `buyer@buyeway.com` | `password123` | KYC not verified |
| Seller | `seller@buyeway.com` | `password123` | Approved supplier, linked to Supplier record |
| Admin | `admin@buyeway.com` | `admin123` | Full platform access |
| Pending Seller | `pending_seller@buyeway.com` | `password123` | For testing admin approval flow |

> These users are seeded idempotently on every gateway startup via `runSeeder()` in `server.js`. They are **never duplicated** — only created if missing.

---

## 7. Local Development Commands

```bash
# Start full stack (uses pre-built images)
docker compose up -d

# Full rebuild (use after changing source code)
docker compose up -d --build --force-recreate

# View logs for a service
docker logs buyeway-node-gateway --tail 50
docker logs buyeway-nextjs-storefront --tail 50

# Stop everything
docker compose down

# Access app
http://localhost:3000   ← Main storefront
http://localhost:80     ← Via Nginx proxy
http://localhost:8000/health  ← Gateway health check
http://localhost/api-docs     ← Swagger UI
```
