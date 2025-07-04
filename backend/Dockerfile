FROM node:20-alpine As deps
WORKDIR /app
COPY package.json ./
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
COPY . .
RUN npm run build

FROM node:20-alpine As runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/tsconfig.app.json ./tsconfig.app.json

EXPOSE 3001

CMD ["npm", "run", "start:prod"]