# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (all, including dev for build tooling)
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build

# ── Stage 2: Production runtime ────────────────────────────────
FROM node:20-alpine AS runner

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy only production dependencies (dev deps not needed at runtime)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built output and config from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/tsconfig.json ./
COPY --from=builder /app/src/lib/mcp-slug-aliases.ts ./src/lib/

# Give non-root user write access to .next for ISR page regeneration
RUN chown -R appuser:appgroup /app/.next

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start Next.js
CMD ["npm", "run", "start"]
