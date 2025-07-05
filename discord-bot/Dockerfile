FROM node:20-alpine As deps
WORKDIR /app
COPY discord-bot/package.json ./
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
WORKDIR /app/discord-bot
COPY discord-bot/src ./src
COPY discord-bot/tsconfig.json ./tsconfig.json
COPY discord-bot/package.json ./package.json
RUN npm run build

FROM node:20-alpine As runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/discord-bot/dist ./discord-bot/dist
COPY --from=prisma /app/generated ./generated
COPY --from=builder /app/discord-bot/package.json ./discord-bot/package.json
COPY prisma ./prisma
WORKDIR /app/discord-bot

CMD ["npm", "run", "start"] 