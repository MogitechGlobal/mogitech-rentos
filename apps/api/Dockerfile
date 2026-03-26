# apps/api/Dockerfile

# Stage 1: Build (Upgraded to Node 20)
FROM node:20-alpine AS builder
WORKDIR /app

# Copy ONLY the API package files
COPY apps/api/package*.json ./

# Install API dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the API source code
COPY apps/api/ ./

# Generate Prisma Client & Build NestJS
RUN npx prisma generate
RUN npm run build

# Stage 2: Production (Upgraded to Node 20)
FROM node:20-alpine AS production
WORKDIR /app

# Set node environment
ENV NODE_ENV=production

# Copy package files and install only production dependencies
COPY apps/api/package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled build and Prisma engine from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Expose backend port
EXPOSE 3000

# Start the NestJS application
CMD ["sh", "-c", "node dist/src/main.js || node dist/main.js"]