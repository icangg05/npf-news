# syntax=docker/dockerfile:1

# ---------- base: shared deps layer ----------
FROM node:22-alpine AS base
WORKDIR /app
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install

# ---------- dev: hot reload (source bind-mounted by compose) ----------
FROM base AS dev
ENV HOST=0.0.0.0
ENV NUXT_HOST=0.0.0.0
ENV CHOKIDAR_USEPOLLING=true
EXPOSE 3000
COPY . .
CMD ["npm", "run", "dev"]

# ---------- build: produce .output ----------
FROM base AS build
COPY . .
RUN npm run build

# ---------- production: slim runtime serving Nitro output ----------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
COPY --from=build /app/.output ./.output
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
