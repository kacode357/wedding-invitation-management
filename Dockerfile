# ============================================
# Dockerfile - Wedding Invitation Management API
# Production build - Node 20 Alpine
# ============================================
FROM node:20-alpine AS builder

WORKDIR /build

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build tools if needed)
RUN npm ci

# Copy source code
COPY . .

# ============================================
# Production Stage
# ============================================
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1000

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts && \
    npm cache clean --force

# Copy built/bundled source (from builder stage)
COPY --from=builder /build/src ./src
COPY --from=builder /build/config ./config

# Copy env file template (actual values come from docker-compose environment)
# DO NOT copy .env files - use docker-compose environment variables

# Set ownership to non-root user
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=10s --timeout=5s --start-period=30s --retries=5 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start the server
CMD ["node", "src/server.js"]
