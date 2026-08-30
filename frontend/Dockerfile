FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY frontend/package.json ./frontend/package.json
# Install only the frontend importer while using the repository lockfile.
RUN pnpm --dir frontend install \
    --ignore-workspace \
    --ignore-scripts \
    --frozen-lockfile \
    --lockfile-dir /app \
    --trust-lockfile

COPY frontend ./frontend
WORKDIR /app/frontend
# Avoid re-entering the workspace during the isolated build.
RUN ./node_modules/.bin/tsc -b && ./node_modules/.bin/vite build

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
