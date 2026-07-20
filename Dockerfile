# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1
ENV WRANGLER_SEND_METRICS=false
ENV npm_config_audit=false
ENV npm_config_fund=false

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 8787

CMD ["npx", "wrangler", "dev", "--local", "--ip", "0.0.0.0", "--port", "8787"]
