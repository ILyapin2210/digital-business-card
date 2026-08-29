FROM node:22-bookworm-slim AS build

WORKDIR /app

RUN corepack enable

COPY frontend/package.json ./frontend/package.json
RUN pnpm --dir frontend install --ignore-workspace --no-frozen-lockfile

COPY frontend ./frontend
RUN pnpm --dir frontend build

FROM nginx:1.27-alpine

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80
