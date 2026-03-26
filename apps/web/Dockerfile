# apps/web/Dockerfile

# Stage 1: Dependencies (Upgraded to Node 20)
FROM node:20-alpine AS deps
WORKDIR /app

# Copy ONLY the Web package files
COPY apps/web/package*.json ./
RUN npm install --legacy-peer-deps

# Stage 2: Build (Upgraded to Node 20)
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules

# Copy the rest of the Web source code
COPY apps/web/ ./

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

# Stage 3: Runner (Upgraded to Node 20)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Automatically leverage output traces to reduce image size
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3001
ENV PORT 3001
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]