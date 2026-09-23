FROM node:20-alpine AS runner

WORKDIR /app

# Install wget for container health probe
RUN apk add --no-cache wget

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Install production dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy application source code
COPY src/ ./src/

# Run as non-root user
USER node

# Expose backend service port
EXPOSE 8080

# Container health probe
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:8080/health | grep -q '"status":"ok"' || exit 1

# Start production server
CMD ["node", "src/app.js"]
