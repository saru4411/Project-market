# 🗺️ BuyEway — Product Roadmap

**Last Updated:** June 2, 2026  
**Current Version:** v1.1.0

---

## ✅ Phase 1 — Core Foundation & Stability (COMPLETE)

> **Status: Done as of v1.1.0**

- [x] Full microservices stack: Next.js, Express Gateway, Go Compute, PostgreSQL, Redis, Nginx
- [x] Docker Compose orchestration with health checks and startup ordering
- [x] Rebranded from IndiTrade → **BuyEway** (all services, DB, UI, credentials)
- [x] JWT authentication with bcrypt password hashing
- [x] Role-based access control (`buyer`, `supplier`, `admin`)
- [x] Idempotent database seeder with test credentials
- [x] Centralized `apiClient.ts` — single source of truth for all API calls
- [x] Explicit CORS configuration for cross-origin browser requests
- [x] `NEXT_PUBLIC_*` env vars correctly baked into Docker production bundle
- [x] Auth flow fully verified: login, register, token validation, logout
- [x] Documentation: architecture, logs, roadmap, readme created in `/docs`
- [x] GitHub release: v1.1.0 tagged and pushed

---

## 🟡 Phase 2 — Feature Enrichment (NEXT)

> **Priority order for upcoming development sessions**

### 2A — Auth & Session Hardening
- [ ] Migrate `sellerStatus` / `isKycVerified` from raw SQL to proper Sequelize migrations
- [ ] Add JWT refresh token with silent re-authentication
- [ ] Session expiry warning UI with auto-logout
- [ ] Migrate `AdminDashboard.tsx` and `SellerOnboarding.tsx` to use `apiClient.ts`

### 2B — Seller Onboarding (UI + Backend)
- [ ] Step 1: GSTIN verification with format validation (15-char regex)
- [ ] Step 2: Document upload (ISO cert, manufacturing license) — file upload endpoint
- [ ] Admin approval queue in `AdminDashboard` — approve / reject with reason
- [ ] Email notification on seller approval (optional: SendGrid integration)

### 2C — RFQ Board (Live Features)
- [ ] Real-time RFQ feed using WebSockets (Socket.io on Gateway)
- [ ] RFQ expiry dates and auto-close inactive RFQs
- [ ] Supplier bid comparison view for buyers
- [ ] Bid acceptance/rejection flow

### 2D — Product Catalog Improvements
- [ ] Elasticsearch or PostgreSQL full-text search (`pg_trgm` already enabled)
- [ ] Product image gallery (multi-image support — model field `images` already exists)
- [ ] Bulk CSV import for supplier product listings
- [ ] Product review and trust score system

### 2E — Escrow & Orders
- [ ] Order status lifecycle: `Escrow Funded → Dispatched → Delivered → Released`
- [ ] Admin escrow dispute resolution flow
- [ ] Downloadable invoice PDF generation
- [ ] Payment gateway stub integration (Razorpay sandbox)

---

## 🔵 Phase 3 — Enterprise Scale (FUTURE)

- [ ] KYC: DigiLocker API integration for real Aadhaar/PAN verification
- [ ] ERP sync APIs (Tally, SAP B1 connector)
- [ ] AI-powered supplier–RFQ matching engine
- [ ] Multi-currency and international freight (FedEx/DHL APIs)
- [ ] Kubernetes migration (EKS/GKE) with horizontal pod autoscaling
- [ ] Vercel deployment for storefront + managed cloud DB (Supabase/Neon)
- [ ] CI/CD pipeline: GitHub Actions → build → test → deploy

---

## 🚀 Vercel + Cloud Deployment Strategy (When Ready)

The user has asked about deploying to Vercel while keeping dev changes live. Recommended approach:

```
GitHub main branch
     │
     ├── Vercel (storefront only — Next.js)
     │     └── NEXT_PUBLIC_GATEWAY_URL=https://your-api-domain.com/api/v1
     │
     └── Render / Railway / Fly.io (Node Gateway + Go Compute + Postgres + Redis)
           └── Docker Compose or separate services
```

- Storefront on Vercel auto-deploys on every `git push` to `main`
- API Gateway and databases stay on a cloud VM/PaaS
- `.env` on Vercel dashboard stores production secrets
- Feature work done on `dev` branch → PR → merge to `main` → auto-deploy
