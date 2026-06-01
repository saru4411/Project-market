# Stage 1: Production Dependencies Cache
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Stage 2: Static Bundle Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Accept public env vars at build time — required for NEXT_PUBLIC_ to be baked into bundle
ARG NEXT_PUBLIC_GATEWAY_URL
ARG NEXT_PUBLIC_COMPUTE_URL
ENV NEXT_PUBLIC_GATEWAY_URL=$NEXT_PUBLIC_GATEWAY_URL
ENV NEXT_PUBLIC_COMPUTE_URL=$NEXT_PUBLIC_COMPUTE_URL

RUN npm run build

# Stage 3: Clean Production Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy strictly compiled production code and public assets
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

EXPOSE 3000
CMD ["npm", "start"]
