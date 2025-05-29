# Multi-stage Dockerfile for TLS Portal

# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./
COPY src/*/package.json ./src/

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN yarn build

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
COPY src/*/package.json ./src/

# Install production dependencies only
RUN yarn install --frozen-lockfile --production && \
    yarn cache clean

# Copy built files from builder
COPY --from=builder /app/src/*/dist ./src/

# Copy necessary files
COPY firebase.json ./
COPY firestore.rules ./
COPY storage.rules ./

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose backend port
EXPOSE 3001

# Use tini for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start the backend server
CMD ["node", "src/creator/dist/index.js"]
