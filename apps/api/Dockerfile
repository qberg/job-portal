# syntax=docker/dockerfile:1
# pm-api image: Hono api + web-admin SPA served same-origin (ADR-0013).
# Build context = repo root. Build on laptop -> GHCR -> droplet pulls (ADR-0044).

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.8.20 prune @jp/api @jp/web-admin --docker

FROM base AS builder
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN pnpm -F @jp/web-admin build && pnpm -F @jp/api build
RUN pnpm --filter @jp/api deploy --prod --legacy /prod

FROM base AS runner
ENV NODE_ENV=production
ENV STATIC_DIR=/app/public
WORKDIR /app
COPY --from=builder /prod/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/web-admin/dist ./public
EXPOSE 3001
CMD ["node", "apps/api/dist/index.mjs"]
