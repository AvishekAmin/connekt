# Stage 1: Build static assets
FROM node:20-alpine AS builder

WORKDIR /app

# Non-secret build-time arguments baked into the static bundle
ARG VITE_BACKEND_URL=http://localhost:8080

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL

# Install dependencies first for layer caching
COPY package*.json ./
RUN npm ci

# Copy source code and build production assets
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine AS runner

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled static assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
