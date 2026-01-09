# EduNexus API Dockerfile (NestJS)
# Multi-stage build for production optimization

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps
WORKDIR /app

# Install dependencies needed for native modules
RUN apk add --no-cache libc6-compat

# Copy root package files
COPY package*.json ./
COPY turbo.json ./

# Copy workspace package files
COPY apps/api/package*.json ./apps/api/
COPY packages/database/package*.json ./packages/database/

# Install all dependencies
RUN npm ci --legacy-peer-deps

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules

# Copy source code
COPY . .

# Generate Prisma client
WORKDIR /app/packages/database
RUN npx prisma generate

# Build the API
WORKDIR /app/apps/api
RUN npm run build

# ============================================
# Stage 3: Production
# ============================================
FROM node:20-alpine AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Set environment
ENV NODE_ENV=production
ENV PORT=3001

# Copy necessary files
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/packages/database/prisma ./prisma

# Change ownership
RUN chown -R nestjs:nodejs /app

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start the application
CMD ["node", "dist/main.js"]
