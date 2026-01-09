# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --prod=false --frozen-lockfile

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
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --prod=false --frozen-lockfile
RUN npm rebuild better-sqlite3

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "start"]
