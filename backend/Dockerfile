FROM node:20-alpine As deps
WORKDIR /app
COPY backend/package.json ./
RUN npm install

FROM node:20-alpine As prisma
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY prisma ./prisma
RUN npx prisma generate

FROM node:20-alpine As builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=prisma /app/generate ./generate
WORKDIR /app/backend
COPY backend/src ./src
COPY backend/tsconfig.json ./tsconfig.json
COPY backend/tsconfig.build.json ./tsconfig.build.json
COPY backend/nest-cli.json ./nest-cli.json
COPY backend/package.json ./package.json
RUN npm run build

FROM node:20-alpine As runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY prisma ./prisma

EXPOSE 3001

CMD ["npm", "run", "start:prod"]