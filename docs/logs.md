# 📝 BuyEway — Changelogs & Operational Logs

> This file is the **ground truth history** of the BuyEway platform. Any new developer or AI agent picking up this project should read this file first to understand what has been built, what broke, how it was fixed, and what's pending.

---

## [v1.2.0] — API-Ready & Mathematical Logistics Engine
**Date:** June 2, 2026  
**Status:** ✅ Released. Dynamic plug-and-play architecture & optimized freight calculations.

### Summary
This milestone introduces dynamic plug-and-play environmental configuration, preparing the platform for frictionless cloud deployment. It also significantly refines the logistics layer with a sophisticated mathematical logistics and freight optimization engine.

### Major Enhancements

#### 1. Dynamic API-Ready Architecture
- **Environment Isolation**: Refactored `docker-compose.yml` to pull Next.js build-time arguments (`NEXT_PUBLIC_GATEWAY_URL` and `NEXT_PUBLIC_COMPUTE_URL`) and backend microservice dependencies (`COMPUTE_SERVICE_URL` and `REDIS_URL`) from environment variables with robust local defaults.
- **Dynamic CORS Origin List**: Gateway refactored to read CORS allowed origins dynamically from a comma-separated list (`process.env.ALLOWED_ORIGINS`) rather than relying on a hardcoded localhost array.
- **Environment Reference**: Added `.env.example` to document local sandbox configurations and illustrate how to swap variables to deploy the storefront to Vercel and the backend to Railway/GCP in minutes.

#### 2. Advanced Mathematical Logistics Engine (Go Compute Service)
- **Geographic Distance Sizing**: Configured exact coordinate maps (latitude/longitude) for supplier hubs (Surat, Morbi, Tirupur, Aligarh, Assam, Moradabad) and buyer states. Integrated the Haversine great-circle formula to calculate route transit distance in kilometers dynamically.
- **Volumetric Weight Profiling**: Implemented chargeable weight mapping comparing physical deadweight against volumetric density based on industrial categories (e.g. textiles are bulky but light; ceramics are dense and heavy).
- **Multi-Carrier Cost Models**: Integrated dynamic cost functions for three major transport modes:
  - **V-Trans (Road LTL)**: Minimum billing weight of 50kg, ₹300 booking fee, ₹0.006/kg/km.
  - **TCI Freight (Bulk Economy)**: Minimum billing weight of 200kg, ₹600 booking fee, ₹0.0035/kg/km.
  - **Delhivery Express (Air Cargo)**: Minimum billing weight of 10kg, ₹180 booking fee, ₹0.016/kg/km.
- **Logistics Recommendation Engine**: Automatically computes freight options for all three carriers simultaneously. Evaluates the cheapest and most suitable selections, passing a recommendation reason back to the client while keeping 100% backwards compatibility for existing order gateways.

#### 3. Interactive Storefront Shipping Optimization Grid
- **Interactive Carriage Selection**: Refactored `ProductDetail.tsx` to display an elegant dynamic shipping options comparison grid card panel when calculations are active.
- **Telemetry Display**: Renders computed great-circle distance (Km), deadweight, volumetric weight, and the final billable chargeable weight.
- **Reactive UI**: Allows buyers to click any carrier option card to instantly recalculate totals, tax, and update the checkout invoice in real-time.

### Files Changed in v1.2.0
| File | Change |
|------|--------|
| `docker-compose.yml` | Swapped hardcoded ports and URLs for dynamic shell variable substitutions |
| `gateway-nestjs/server.js` | Refactored CORS to parse process.env.ALLOWED_ORIGINS |
| `compute-service-go/main.go` | Implemented Haversine math, density volumes, carrier engines, and optimization outputs |
| `storefront-nextjs/src/types/index.ts` | Expanded CalcResult, CalcSuborder, and added ShippingOption interfaces |
| `storefront-nextjs/src/components/ProductDetail.tsx` | Added advanced carriage cards, telemetry HUD, and reactive click recalculators |
| `.env` | Added dynamic variables template config |
| `.env.example` | New environment template file created |

---

## [v1.1.0] — Auth & Infrastructure Stabilization
**Date:** June 2, 2026  
**Status:** ✅ Stable. All auth flows verified end-to-end.

### Summary
This milestone focused entirely on making the authentication system and Docker infrastructure reliable. The platform was previously plagued with intermittent "Failed to fetch" and "Unexpected token '<'" errors that blocked all login/signup flows.

### Root Causes Identified & Fixed

#### Problem 1: `NEXT_PUBLIC_*` vars not baked into Docker bundle
- **What happened:** Next.js `NEXT_PUBLIC_*` environment variables are baked into the static JS bundle **at build time**, not injected at runtime. Simply setting them in `docker-compose.yml` under `environment:` has **no effect** on the production bundle.
- **Symptom:** Browser's `apiClient.ts` used a fallback or stale URL, hitting the wrong endpoint.
- **Fix:** Added `ARG NEXT_PUBLIC_GATEWAY_URL` and `ARG NEXT_PUBLIC_COMPUTE_URL` to `storefront-nextjs/Dockerfile` builder stage. Added matching `build.args` in `docker-compose.yml` so values flow through Docker build context.

#### Problem 2: Browser hitting `localhost:3000/api/v1` (relative path) instead of `localhost:8000/api/v1`
- **What happened:** A previous attempt to "secure" the stack used relative paths (`/api/v1`) in `apiClient.ts`. These paths are only valid for Next.js server-side routes. When the browser fetches `/api/v1/auth/login`, Next.js returns a 404 HTML page (starting with `<!DOCTYPE html>`). The JSON parser then throws `Unexpected token '<'`.
- **Fix:** `apiClient.ts` was rewritten to always use absolute URLs (`http://localhost:8000/api/v1`). The gateway port 8000 is explicitly exposed in `docker-compose.yml`.

#### Problem 3: CORS blocking browser requests
- **What happened:** Browser at `localhost:3000` fetching `localhost:8000` is a cross-origin request (different port). Without explicit CORS headers, the browser blocks the request entirely.
- **Fix:** Replaced `app.use(cors())` (wildcard, risky) in `server.js` with an explicit allowlist: `localhost:3000`, `localhost`, `127.0.0.1:3000`.

#### Problem 4: Hanging PowerShell background tasks
- **What happened:** PowerShell's `Invoke-WebRequest` with OPTIONS method hangs indefinitely when the server doesn't send a proper OPTIONS response. Two verification tasks sat open for 24+ minutes consuming resources.
- **Fix:** Killed hanging tasks manually. Moved to `Invoke-RestMethod` for all future API testing.

### Files Changed in v1.1.0
| File | Change |
|------|--------|
| `storefront-nextjs/Dockerfile` | Added `ARG` + `ENV` for `NEXT_PUBLIC_*` build-time vars |
| `docker-compose.yml` | Added `build.args` for storefront; exposed ports `8000` and `3000` explicitly |
| `storefront-nextjs/src/lib/apiClient.ts` | Full rewrite — absolute URLs, CORS-safe, non-JSON guard, clear error messages |
| `storefront-nextjs/.env.local` | Set to `http://localhost:8000/api/v1` for local `npm run dev` usage |
| `gateway-nestjs/server.js` | Explicit CORS origin allowlist; rebranded startup logs to BuyEway |
| `gateway-nestjs/server.js` | Auth rate limiter (5 req/15min), general limiter (100 req/15min) |
| `docs/architecture.md` | Full rewrite for v1.1 with networking rules and container map |
| `docs/logs.md` | This file |
| `docs/roadmap.md` | Updated with Phase 1 completion status |
| `docs/readme.md` | Docs index created |

### v1.1 Verification Results
```
GET  http://localhost:8000/health          → {"status":"healthy","database":"connected"}
POST http://localhost:8000/api/v1/auth/login (buyer)   → JWT token ✅
POST http://localhost:8000/api/v1/auth/login (seller)  → JWT token ✅
POST http://localhost:8000/api/v1/auth/login (admin)   → JWT token ✅
GET  http://localhost:8000/api/v1/auth/me (with token) → user object ✅
localhost:8000 confirmed baked into .next/static bundle ✅
```

---

## [v1.0.0] — Initial Platform Build & Rebranding
**Date:** May–June 2026  
**Status:** ✅ Completed

### Summary
Built the full BuyEway platform from scratch (previously codenamed IndiTrade). Implemented all core microservices, database models, and the storefront UI.

### What Was Built

#### Infrastructure
- Docker Compose stack with 6 services: Nginx, Next.js, Node Gateway, Go Compute, PostgreSQL, Redis
- Nginx reverse proxy routing `/api/v1/*` → gateway, `/compute/*` → Go engine, `/` → storefront
- Health checks and `depends_on` startup ordering
- PostgreSQL persistence via named Docker volume `postgres_data`

#### Backend — Node.js Gateway
- Express server with Helmet security headers, Pino structured logging, Prometheus metrics
- JWT authentication (`jsonwebtoken`) + bcrypt password hashing
- Role-based access control: `buyer`, `supplier`, `admin`
- Sequelize ORM models: `User`, `Supplier`, `Product`, `PriceTier`, `Rfq`, `Bid`, `Order`
- Idempotent database seeder with test users + sample catalog data
- Zod payload validators
- Swagger/OpenAPI 3.0 docs at `/api-docs`

#### Backend — Go Compute Engine
- Zero-dependency Go microservice for mathematical calculations
- MOQ volume-tier pricing, CGST+SGST vs IGST tax classification, carrier freight rates
- Endpoint: `POST /calculate`

#### Frontend — Next.js 14 Storefront
- App Router, TanStack React Query, Vanilla CSS design system
- Auth modal (login/register) with test credential hints
- Marketplace product catalog with search, hub filters, category filters
- RFQ sourcing board with bid submission
- Supplier dashboard with order management and inquiry leads
- Admin dashboard for seller approval workflow
- Seller onboarding multi-step wizard (GSTIN → documents → approval)
- SafeTrade escrow calculator with Go microservice integration
- Live sourcing activity simulator (background inquiry generator)

#### Rebranding
- Full rename from IndiTrade → **BuyEway** across all services, database seeders, UI, logs, credentials, and documentation
- New test credentials: `@buyeway.com` domain

---

## Known Issues & Technical Debt (As of v1.1)

| Issue | Severity | Notes |
|-------|----------|-------|
| Auth rate limiter blocks repeat testing | Low | 5 req/15min on `/auth/login`. May hit this during rapid dev testing. |
| `sellerStatus` and `isKycVerified` added via raw SQL migrations in `runSeeder()` | Medium | Should be moved to proper Sequelize migrations |
| No refresh token — JWT expires in 7 days | Medium | Logged-out users see no expiry warning |
| Go compute service has no auth | Low | Fine for now since it's internal, but should be protected in production |
| `docker-compose.yml` still has obsolete `version:` key | Low | Causes warning on every compose command |
| AdminDashboard and SellerOnboarding still use raw `fetch()` | Medium | Should be migrated to `apiClient.ts` |

---

## Environment Variables Reference

### Root `.env` (docker-compose picks this up)
```env
POSTGRES_DB=buyeway
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your_password>
DATABASE_URL=postgresql://postgres:<password>@db:5432/buyeway
DATABASE_SSL=false
JWT_SECRET=<your_jwt_secret>
```

### `storefront-nextjs/.env.local` (for local `npm run dev`)
```env
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_COMPUTE_URL=http://localhost:8080
```

### docker-compose.yml build args (baked into Next.js bundle)
```yaml
build:
  args:
    NEXT_PUBLIC_GATEWAY_URL: http://localhost:8000/api/v1
    NEXT_PUBLIC_COMPUTE_URL: http://localhost:8080
```

## [v1.2.1] - Enterprise Features & Security Hardening
**Date:** June 2, 2026
**Status:** ? Released. Beckn ONDC protocol Engine, Escrow UI, and Security Patches.

### Summary
This release expands the platform's robust feature set for enterprise usage and hardens the architecture against vulnerabilities.

### Major Enhancements

#### 1. Core Beckn Protocol Engine (ONDC)
- **Asynchronous Gateway Handlers**: Outbound controllers built for /search, /select, /init, and /confirm. Configured standalone, high-performance listening webhooks (/on_search, /on_select, /on_init, /on_confirm) to accept asynchronous responses from Indian supplier nodes.
- **State Machine Caching**: Integrated a Redis cache layer. Assigned unique 	ransaction_id tracking tokens for incoming server payloads, allowing the frontend to securely poll live results.

#### 2. Enterprise B2B Features (UI/UX)
- **Sourcing Radar**: Built an interactive map telemetry view.
- **AI HSN Expert**: Added an AI-powered classification and tax ledger UI component.
- **SafeTrade Escrow**: Developed smart contract and dispute resolution workspace interface.

#### 3. Cryptographic Security & Stability Patch (Autonomous Audit fixes)
- **Cryptographic Validation Bypass Fix**: Mitigated a BLAKE2b-512 signature bypass vulnerability by extracting exact raw Buffer payloads via Express's erify hook, guarding against JSON serialization distortion.
- **Cache Race Condition Fix**: Refactored Redis array mutations (setCachedData) into atomic list operations (push via cacheAppend) inside BecknController.js to ensure concurrent supplier webhooks do not cause catastrophic catalog data loss.

