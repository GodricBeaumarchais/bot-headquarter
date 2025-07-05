FROM node:20-alpine As deps
WORKDIR /app
COPY desktop-app/package.json ./
RUN npm install

FROM node:20-alpine As builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
WORKDIR /app/desktop-app
COPY desktop-app/src ./src
COPY desktop-app/public ./public
COPY desktop-app/tsconfig.json ./tsconfig.json
COPY desktop-app/next.config.ts ./next.config.ts
COPY desktop-app/postcss.config.mjs ./postcss.config.mjs
COPY desktop-app/package.json ./package.json
COPY desktop-app/next-env.d.ts ./next-env.d.ts
COPY desktop-app/eslint.config.mjs ./eslint.config.mjs
RUN npm run build

FROM node:20-alpine As runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/desktop-app/.next ./desktop-app/.next
COPY --from=builder /app/desktop-app/public ./desktop-app/public
COPY --from=builder /app/desktop-app/package.json ./desktop-app/package.json
WORKDIR /app/desktop-app
EXPOSE 3000

CMD ["npm", "run", "start"] 