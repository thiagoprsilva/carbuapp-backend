# ---------- build ----------
    FROM node:20-alpine AS build
    WORKDIR /app
    
    COPY package*.json ./
    COPY prisma ./prisma
    
    RUN npm ci
    
    RUN npx prisma generate
    
    COPY tsconfig.json ./
    COPY src ./src
    
    RUN npm run build
    
    # ---------- runtime ----------
    FROM node:20-alpine AS runtime
    WORKDIR /app
    ENV NODE_ENV=production
    
    COPY --from=build /app/node_modules ./node_modules
    COPY --from=build /app/prisma ./prisma
    COPY --from=build /app/dist ./dist
    COPY package*.json ./
    
    EXPOSE 3333
    
    CMD ["node", "dist/server.js"]