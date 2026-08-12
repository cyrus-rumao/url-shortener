# Backend multi-stage Dockerfile
# Builds the TypeScript app and copies runtime artifacts into a slim image.

FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies (including dev deps for build-time tools like tsx/prisma)
COPY package*.json ./
RUN npm ci

# Copy source and generate prisma client if schema exists
COPY . .
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy" npm run build
# Final runtime image


FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
# Copy built files and node_modules from build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Expose the application port (adjust if your app listens on a different port)
EXPOSE 2000

# Start the server using tsx so TypeScript runs directly (no separate build step present in package.json)
# In production it's recommended to compile to JS. This image keeps the repo's current approach.
CMD ["node", "dist/server.js"]
