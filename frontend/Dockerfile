# Frontend multi-stage Dockerfile
# Builds the Vite React app and serves with nginx.

FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:stable-alpine AS production
# Copy built static files into nginx www directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: customize nginx config for SPA fallback by adding a config file if needed.
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
