# 1) Dev bağımlılıklar (build için gerekli)
FROM node:20-alpine AS deps_dev
WORKDIR /app
RUN apk add --no-cache python3 make g++ libc6-compat
RUN npm config set registry https://registry.npmjs.org \
 && npm config set fetch-retries 5 \
 && npm config set fetch-retry-maxtimeout 120000 \
 && npm config set fetch-retry-mintimeout 20000 \
 && npm config set audit false \
 && npm config set fund false
# ⬇️ Context'e bir kez dokunuyoruz
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --no-audit --no-fund

# 2) Build — Next.js prod derleme
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps_dev /app/node_modules ./node_modules
# ⬇️ Kaynak kodu getir
COPY . .
RUN if [ -d src/app ] && [ ! -d app ]; then cp -a src/app ./app; fi
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) Prod bağımlılıklar (küçük runtime)
FROM node:20-alpine AS deps_prod
WORKDIR /app
# ⬇️ Artık context'ten değil, deps_dev'ten alıyoruz
COPY --from=deps_dev /app/package.json /app/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev --no-audit --no-fund

# 4) Runner — yalın ve sağlıklı
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS=--max-old-space-size=256
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
RUN apk add --no-cache curl

# build çıktıları + public ve prod node_modules
COPY --from=build     /app/.next         ./.next
COPY --from=build     /app/public        ./public
COPY --from=deps_prod /app/node_modules  ./node_modules
# ⬇️ package dosyalarını build stage'den al
COPY --from=build /app/package.json /app/package-lock.json ./

EXPOSE 3000
# HEALTHCHECK ... (compose'ta zaten var)
CMD ["npm","run","start"]
