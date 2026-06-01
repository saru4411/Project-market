# 🏭 BuyEway — B2B Wholesale Sourcing & Escrow Marketplace

**Version:** v1.1.0  
**Status:** ✅ Stable — Auth, infrastructure, and core platform fully functional  
**Last Updated:** June 2, 2026

BuyEway is an enterprise-grade B2B wholesale marketplace for Indian manufacturing clusters. It enables bulk procurement sourcing, verified seller onboarding, RFQ bidding, and secure SafeTrade escrow contracts with automated GST and freight calculation.

---

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture Guide](docs/architecture.md) | System topology, containers, DB schema, networking rules |
| [Operational Logs](docs/logs.md) | Full changelog, root cause analyses, known issues |
| [Product Roadmap](docs/roadmap.md) | What's done, what's next, deployment strategy |
| [Setup Guide](docs/setup.md) | Local installation instructions |
| [Deployment Guide](docs/deployment.md) | Production deployment considerations |

> **New developer or AI agent?** Start with [`docs/architecture.md`](docs/architecture.md) and [`docs/logs.md`](docs/logs.md) — they contain everything you need to understand the system.

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/saru4411/Project-market.git
cd Project-market

# 2. Create your .env file (copy from example and fill secrets)
# See docs/setup.md for full variable reference

# 3. Start the full stack
docker compose up -d

# 4. Open in browser
# http://localhost:3000
```

---

## 🏛️ Architecture Overview

```
Browser → localhost:3000 (Next.js Storefront)
       → localhost:8000  (Node.js API Gateway)
       → localhost:8080  (Go Compute Engine)
       → localhost:80    (Nginx Proxy)
```

Six containerized services orchestrated via Docker Compose:
- **Next.js 14** storefront with React Query, Vanilla CSS
- **Node.js/Express** API gateway with JWT, RBAC, Sequelize ORM
- **Go** stateless microservice for freight + GST calculations
- **PostgreSQL 15** relational database
- **Redis 7** cache layer
- **Nginx** reverse proxy ingress

Full details → [`docs/architecture.md`](docs/architecture.md)

---

## 🧪 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| 🛒 Buyer | `buyer@buyeway.com` | `password123` |
| 🏭 Seller | `seller@buyeway.com` | `password123` |
| 🛡️ Admin | `admin@buyeway.com` | `admin123` |
| ⏳ Pending Seller | `pending_seller@buyeway.com` | `password123` |

> These are seeded automatically on every gateway startup. Safe to use in any environment.

---

## 📋 API Documentation

- **Swagger UI:** `http://localhost/api-docs`
- **OpenAPI Spec:** [`gateway-nestjs/public/openapi.yaml`](gateway-nestjs/public/openapi.yaml)

---

## 🗂️ Project Structure

```
project-market/
├── storefront-nextjs/          # Next.js 14 UI
│   ├── src/
│   │   ├── app/page.tsx        # Main portal entry
│   │   ├── components/         # AuthModal, Marketplace, RfqBoard, etc.
│   │   ├── lib/apiClient.ts    # Centralized API client (IMPORTANT)
│   │   └── types/index.ts      # Shared TypeScript types
│   ├── Dockerfile              # Multi-stage build with ARG for NEXT_PUBLIC_*
│   └── .env.local              # Local dev env vars
├── gateway-nestjs/             # Node.js Express API Gateway
│   ├── server.js               # Main entry — routes, middleware, seeder
│   ├── controllers/            # Auth, Product, RFQ, Order, Supplier
│   ├── models/                 # Sequelize models
│   ├── middlewares/auth.js     # JWT verify + RBAC
│   └── config/                 # DB, logger, metrics, cache, sentry
├── compute-service-go/         # Go freight + GST engine
│   └── main.go
├── nginx/
│   └── nginx.conf              # Proxy rules for /api/v1, /compute, /
├── docs/                       # All documentation (start here)
│   ├── architecture.md
│   ├── logs.md
│   ├── roadmap.md
│   ├── setup.md
│   └── deployment.md
├── docker-compose.yml          # Full stack orchestration
└── .env                        # Root secrets (not committed)
```

---

## 🔑 Key Development Rules

1. **Never use relative paths** (`/api/v1`) in the Next.js client — use absolute URLs (`http://localhost:8000/api/v1`)
2. **Rebuild Docker after source changes:** `docker compose up -d --build --force-recreate`
3. **Hard-refresh browser (Ctrl+F5)** after rebuilds to clear old JS bundles
4. **All API calls** must go through `src/lib/apiClient.ts` — never raw `fetch()` directly
5. **Test credentials are seeded automatically** — never hardcode or duplicate them

---

## 📦 Version History

| Version | Date | Highlights |
|---------|------|------------|
| v1.1.0 | June 2, 2026 | Auth stabilized, CORS fixed, Docker build args, full docs |
| v1.0.0 | May 2026 | Initial build, rebranded from IndiTrade to BuyEway |
