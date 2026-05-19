# Etapa 1: Construcción con Bun
FROM oven/bun:1-alpine AS builder
ENV NODE_ENV=production

WORKDIR /app
# Copiar dependencias
COPY package.json bun.lockb* ./

# Instalación optimizada
RUN bun install --frozen-lockfile

# Copiar código fuente (incluyendo directorio app/ si usas la estructura de Nuxt 4)
COPY . .

# Generar artefactos de la SPA
RUN bun run generate

# Etapa 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiar configuración de enrutamiento (requerido para Vue Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar artefactos estáticos generados por Nitro en Nuxt 4
COPY --from=builder /app/.output/public /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]