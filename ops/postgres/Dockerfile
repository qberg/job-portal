FROM pgvector/pgvector:0.8.5-pg18-bookworm

# Bookworm base keeps glibc (and thus text-index collation) identical to the deployed
# pgvector:pg18 image, so adding PostGIS needs no REINDEX; both pgdg12 builds verified present at
# apt.postgresql.org/pub/repos/apt/dists/bookworm-pgdg/main/binary-amd64/Packages.gz
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-18-postgis-3=3.6.4+dfsg-2.pgdg12+1 \
        postgresql-18-postgis-3-scripts=3.6.4+dfsg-2.pgdg12+1 \
    && rm -rf /var/lib/apt/lists/*
