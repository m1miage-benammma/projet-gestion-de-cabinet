# ─── FRONTEND : build ────────────────────────────────────────
FROM node:20-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./
RUN npm ci

COPY frontend .
RUN npm run build

# ─── FRONTEND : runtime ──────────────────────────────────────
FROM nginx:alpine AS frontend

COPY --from=frontend-builder /app/dist/frontend/browser /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# ─── BACKEND : build ─────────────────────────────────────────
FROM composer:2 AS backend-builder

WORKDIR /app

COPY backend/composer*.json ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-scripts

COPY backend .
RUN composer dump-autoload --optimize


# ─── BACKEND : runtime ───────────────────────────────────────
FROM php:8.4-fpm-alpine AS backend

WORKDIR /var/www/html

RUN apk add --no-cache \
    nginx \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    oniguruma-dev

RUN docker-php-ext-install \
    pdo \
    pdo_mysql \
    mbstring \
    exif \
    pcntl \
    bcmath \
    gd \
    zip

RUN addgroup -S appuser && adduser -S -G appuser appuser

COPY --from=backend-builder /app .

RUN mkdir -p storage/framework/{sessions,views,cache} bootstrap/cache \
    /var/lib/nginx/tmp/client_body \
    /var/lib/nginx/tmp/proxy \
    /var/lib/nginx/tmp/fastcgi \
    /var/log/nginx \
    && chown -R appuser:appuser /var/www/html \
    && chown -R appuser:appuser /var/lib/nginx /var/log/nginx \
    && chmod -R 775 storage bootstrap/cache

RUN printf 'pid /tmp/nginx.pid;\n\
    error_log /var/log/nginx/error.log;\n\
    \n\
    events { worker_connections 1024; }\n\
    \n\
    http {\n\
    include /etc/nginx/mime.types;\n\
    client_body_temp_path /var/lib/nginx/tmp/client_body;\n\
    proxy_temp_path       /var/lib/nginx/tmp/proxy;\n\
    fastcgi_temp_path     /var/lib/nginx/tmp/fastcgi;\n\
    access_log /var/log/nginx/access.log;\n\
    \n\
    server {\n\
    listen 8000;\n\
    server_name _;\n\
    root /var/www/html/public;\n\
    index index.php;\n\
    location / { try_files $uri $uri/ /index.php?$query_string; }\n\
    location ~ \\.php$ {\n\
    fastcgi_pass 127.0.0.1:9000;\n\
    fastcgi_index index.php;\n\
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;\n\
    include fastcgi_params;\n\
    }\n\
    }\n\
    }\n' > /etc/nginx/nginx.conf

RUN printf '#!/bin/sh\nset -e\nphp artisan key:generate --force\nphp artisan migrate --force || echo "[WARNING] Migration skipped (DB not ready)"\nphp-fpm -D\nnginx -g "daemon off;"\n' > /entrypoint.sh \
    && chmod +x /entrypoint.sh

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/up || exit 1

ENTRYPOINT ["/entrypoint.sh"]
