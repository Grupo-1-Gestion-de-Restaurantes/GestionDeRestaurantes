# =============================================================================
# GestionDeRestaurantes — Node.js + pnpm multi-stage
# Build context: ./GestionDeRestaurantes
# packageManager: pnpm@10.29.3 (package.json)
# =============================================================================

FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.29.3 --activate

# ----- Dependencias (caché por package.json + lockfile) -----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ----- Desarrollo (nodemon vía pnpm dev/start) -----
FROM base AS development
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY package.json pnpm-lock.yaml ./
COPY . .
EXPOSE 3006
CMD ["pnpm", "dev"]

# ----- Producción (sin nodemon; solo deps de production) -----
FROM base AS production
ENV NODE_ENV=production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY . .
EXPOSE 3006
# Healthcheck helper (wget en Alpine busybox)
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3006/gestionDeRestaurantes/v1/health || exit 1
CMD ["node", "index.js"]
