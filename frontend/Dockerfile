# 1) Dev bağımlılıklar
FROM node:20-alpine AS deps_dev
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc6-compat
RUN npm config set registry https://registry.npmjs.org \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set audit false \
 && npm config set fund false
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# 2) Build — Next.js üretim derlemesi
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps_dev /app/node_modules ./node_modules
COPY package.json package-lock.json ./
RUN mkdir -p public
COPY next.config.js tsconfig.json postcss.config.js tailwind.config.js ./
COPY next-sitemap.config.js ./
COPY src ./src

# 🔧 SHIM: src/app varsa, root'a da app/ olarak kopyala ki Next mutlaka görsün
RUN if [ -d src/app ] && [ ! -d app ]; then cp -a src/app ./app; fi
ENV NEXT_TELEMETRY_DISABLED=1
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URl}
RUN npm run build

# 3) Prod bağımlılıklar (sadece prod)
FROM node:20-alpine AS deps_prod
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

# 4) Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=256

# public klasörün varsa kopyala (yoksa sorun değil)
# COPY --from=build /app/public ./public
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm","run","start"]
