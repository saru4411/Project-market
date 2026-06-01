# Stage 1: Production Dependencies Cache
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# Stage 2: Full Source Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 3: Lightweight Production Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy strictly required production dependencies and compiled code
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 8000
CMD ["npm", "start"]
