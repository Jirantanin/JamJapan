FROM node:22

WORKDIR /app

# Install OpenSSL required by Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Generate Prisma client (uses prisma/schema.prisma = PostgreSQL)
RUN npx prisma generate

# Build Nuxt app
COPY . .
ENV NODE_ENV=production
RUN npm run build

# Make start script executable (strip Windows CRLF if needed) and run it
COPY start.sh ./
RUN sed -i 's/\r//' start.sh && chmod +x start.sh
CMD ["./start.sh"]
