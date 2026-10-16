# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm@10.23.0

# Native dependencies such as better-sqlite3 may need a node-gyp rebuild on
# Alpine when a matching prebuilt binary is unavailable.
RUN apk add --no-cache python3 make g++

# Install dependencies
RUN pnpm install --production=false --frozen-lockfile

# Copy source code
COPY . .

# Replace the title in the HTML file
RUN sed -i 's/<title>Jam Tools<\/title>/<title>People Queue<\/title>/' /app/node_modules/@springboardjs/platforms-browser/index.html

# Build the application
RUN pnpm build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10.23.0

# better-sqlite3 may fall back to a native node-gyp rebuild on Alpine.
# Keep the build toolchain available so the runtime install/rebuild is
# deterministic when a prebuilt binary is unavailable.
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --production=false --frozen-lockfile
RUN npm rebuild better-sqlite3

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Copy assets directory
COPY --from=builder /app/assets ./assets

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
