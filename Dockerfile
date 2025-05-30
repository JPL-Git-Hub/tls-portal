# Multi-stage Dockerfile for TLS Portal
# This file is used by GitHub Actions for automated builds
# You do NOT need Docker installed locally

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY src/shared/package.json ./src/shared/
COPY src/creator/package.json ./src/creator/
COPY src/pages/package.json ./src/pages/

# Install all dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN yarn workspace @tls-portal/shared typecheck && \
    yarn workspace @tls-portal/creator build && \
    yarn workspace @tls-portal/pages build

# Stage 2: Production stage
FROM node:18-alpine

# Install runtime dependencies
RUN apk add --no-cache tini

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY src/shared/package.json ./src/shared/
COPY src/creator/package.json ./src/creator/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built backend files
COPY --from=builder /app/src/creator/dist ./src/creator/dist
COPY --from=builder /app/src/shared ./src/shared

# Copy built frontend files to be served by Express
COPY --from=builder /app/src/pages/dist ./public

# Copy necessary config files
COPY firebase.json ./
COPY firestore.rules ./
COPY storage.rules ./

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose Cloud Run port
EXPOSE 8080

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the backend server
CMD ["node", "src/creator/dist/server.js"]