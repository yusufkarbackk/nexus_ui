# ================================
# Nexus Next.js UI Dockerfile
# ================================
# Multi-stage build for production

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Fix SSL certificate issues
RUN npm config set strict-ssl false

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Fix SSL certificate issues
RUN npm config set strict-ssl false

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client (needs dummy DATABASE_URL for build)
ENV DATABASE_URL="mysql://user:password@localhost:3309/nexus_dummy"
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

RUN npx prisma generate

# Build Next.js app
# IMPORTANT: NEXT_PUBLIC_* vars must be set at BUILD time
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=http://localhost:8080
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set ownership
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
