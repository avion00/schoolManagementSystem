# Frontend image: builds the SPA, then serves it with Caddy, which also
# terminates TLS (automatic Let's Encrypt) and proxies the API and WebSockets.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Same-origin API: the browser calls /api/v1 on the site's own domain.
ENV VITE_API_URL=/api/v1
RUN npm run build

FROM caddy:2.8-alpine
COPY --from=build /app/dist /srv
COPY Caddyfile /etc/caddy/Caddyfile
