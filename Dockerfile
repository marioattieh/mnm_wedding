ARG NODE_VERSION=22.17.1
FROM node:${NODE_VERSION}-alpine AS base

# =====================
# Dependencies
# =====================
FROM base AS deps

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* ./
RUN --mount=type=cache,id=yarn-cache,target=/root/.yarn \
  yarn install --frozen-lockfile


# =====================
# Build
# =====================
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build


# =====================
# Production (Nginx)
# =====================
FROM nginx:stable-alpine AS production

# Add group and user
RUN addgroup -S grp && adduser -S mnm_wedding -G grp

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy built static files
COPY --from=builder /app/dist/ .

# Copy Nginx config template
COPY --from=builder /app/nginx.conf.template /etc/nginx/templates/nginx.conf.template

# Fix permissions for nginx cache and logs and conf
RUN mkdir -p /run/nginx /var/run /var/cache/nginx && \
    chown -R mnm_wedding:grp /run /run/nginx /var/run /var/cache/nginx /etc/nginx/conf.d

# Use non-root user
USER mnm_wedding

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
