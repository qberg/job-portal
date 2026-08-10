# syntax=docker/dockerfile:1
# pm-web-public image: Next 16 citizen portal + Payload local-API reads (ADR-0026).
# Next standalone output. Build context = repo root.
# Real NEXT_PUBLIC_MAPBOX_TOKEN is inlined at build; server secrets are dummies at
# build (not inlined) and injected for real at runtime (Kamal).

FROM node:22-slim AS base
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable
WORKDIR /app

FROM base AS pruner
COPY . .
RUN pnpm dlx turbo@2.8.20 prune @jp/web-public --docker

FROM base AS builder
# SITE_URL + API_INTERNAL_URL (rewrite dest) baked via args. Mapbox token comes
# from Kamal builder.secrets as a BuildKit secret (mounted at /run/secrets).
# Server secrets below are build-only dummies; real ones injected at runtime.
ARG SITE_URL=https://nammaaadhav.com
ARG API_INTERNAL_URL=https://jp-app.minsky.dev
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile
COPY --from=pruner /app/out/full/ .
RUN --mount=type=secret,id=NEXT_PUBLIC_MAPBOX_TOKEN \
    --mount=type=secret,id=NEXT_PUBLIC_OLA_API_KEY \
  printf 'NODE_ENV=production\nSITE_URL=%s\nAPI_INTERNAL_URL=%s\nNEXT_PUBLIC_MAPBOX_TOKEN=%s\nNEXT_PUBLIC_OLA_API_KEY=%s\nDATABASE_URL=postgres://build:build@localhost:5432/build\nPAYLOAD_SECRET=build_dummy_secret_at_least_32_chars_xx\nOLA_API_KEY=build_dummy_ola_key\n' \
    "$SITE_URL" "$API_INTERNAL_URL" "$(cat /run/secrets/NEXT_PUBLIC_MAPBOX_TOKEN)" "$(cat /run/secrets/NEXT_PUBLIC_OLA_API_KEY)" > .env \
  && pnpm -F @jp/web-public build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
WORKDIR /app
COPY --from=builder /app/apps/web-public/.next/standalone ./
COPY --from=builder /app/apps/web-public/.next/static ./apps/web-public/.next/static
COPY --from=builder /app/apps/web-public/public ./apps/web-public/public
EXPOSE 3000
CMD ["node", "apps/web-public/server.js"]
