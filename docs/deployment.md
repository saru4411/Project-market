# 🏭 Production Deployment Guide

Migrating the IndiTrade B2B Marketplace stack from local development environments to enterprise-grade cloud production environments requires structured planning for high availability, security hardening, database scaling, and content delivery.

---

## 1. Relational Database Hardening

In production, local SQLite sandboxes or simple file attachments must be replaced with a highly available, managed SQL cluster (such as AWS RDS PostgreSQL or GCP Cloud SQL).

### Connection Pooling Configuration
Inject production pool constraints in your database connection configurations in `gateway-nestjs/config/database.js`:
```javascript
pool: {
  max: 30,         // Maximum concurrent connections
  min: 5,          // Minimum connection pool allocations
  acquire: 30000,  // Maximum wait time (ms) to obtain connection
  idle: 10000      // Idle time (ms) before releasing connection
}
```

### SSL/TLS Encryption Enforcement
Set the database environment variable `DATABASE_SSL=true`. Sequelize is configured to enforce secure SSL handshakes and prevent unencrypted transport eavesdropping:
```javascript
dialectOptions: {
  ssl: {
    require: true,
    rejectUnauthorized: true // Reject non-verified certificates in prod
  }
}
```

---

## 2. Horizontal Microservice Scaling

The calculations microservice (`compute-service-go`) is entirely stateless. This allows it to scale horizontally under high traffic conditions without managing state synchronization.

### Scaling in Kubernetes
Deploy `compute-service-go` inside a Kubernetes pod cluster. Enable horizontal pod autoscaling (HPA) targeting high-traffic compute parameters:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: go-compute-scaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: go-compute-deployment
  minReplicas: 3
  maxReplicas: 15
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 75
```

### Local Horizontal Test (Docker Compose)
Scale the local calculations service to four concurrent container instances behind a reverse proxy:
```bash
docker-compose up -d --scale go-compute=4
```

---

## 3. Database Write/Read Split (Read Replicas)

Sequelize supports separating database operations to distribute query loads. Direct write traffic to the primary PostgreSQL node while spreading listing lookups across read replicas:

```javascript
const sequelize = new Sequelize('inditrade', 'user', 'password', {
  dialect: 'postgres',
  replication: {
    write: {
      host: 'pg-primary.inditrade.internal',
      username: 'postgres',
      password: 'prodpassword'
    },
    read: [
      { host: 'pg-replica-1.inditrade.internal', username: 'postgres', password: 'prodpassword' },
      { host: 'pg-replica-2.inditrade.internal', username: 'postgres', password: 'prodpassword' }
    ]
  }
});
```

---

## 4. Production Security Hardening

### CORS Origin Restriction
In production, restrict API access exclusively to trusted storefront and administration domains. Do not use wildcard `*` origins:
```javascript
const allowedOrigins = [
  "https://inditrade.com",
  "https://admin.inditrade.com",
  "https://store.inditrade.com"
];
```

### Secret Validation checks
The gateway is configured to throw a fatal error and halt the execution loop on boot if a production environment variable is initialized without a custom, defined `JWT_SECRET`. This prevents deployment with vulnerable defaults.

### Express Rate Limiting
Enforce strict rate limits to prevent brute-force login vectors and API exploitation:
*   **Global Route Limit**: 100 requests per 15-minute window for `/api/v1/` pathways.
*   **Authentication Portal Route Limit**: Max 5 attempts per 15-minute window for `/api/v1/auth/login`.

---

## 5. Static Assets Caching & Edge CDNs

To offload content Delivery and minimize latency across global manufacturing hubs:

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  Client browser │ ───>  │  Edge CDN Node  │ ───>  │ Next.js Origin  │
│                 │       │ (CloudFront/CF) │       │   Server/S3     │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

1.  **Next.js Storefront Cache**: Deploy storefront endpoints behind global Edge CDNs (such as Amazon CloudFront or Cloudflare). Configure long-duration cache headers for built static JS chunks.
2.  **S3 Object Storage for Images**: Public imagery and uploaded seller certificate documents must be hosted on secure object storages (such as Amazon S3) with read-only CDN distributions, keeping storage decoupled from gateway memory space.
