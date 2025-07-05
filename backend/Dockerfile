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
COPY --from=prisma /app/generated ./generated
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
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=prisma /app/generated ./generated
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY prisma ./prisma
WORKDIR /app/backend
EXPOSE 3001

# Install curl for healthcheck
RUN apk add --no-cache curl

CMD ["npm", "run", "start:prod"]