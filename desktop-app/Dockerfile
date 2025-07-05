FROM node:20-alpine As deps
WORKDIR /app
COPY desktop-app/package.json ./
RUN npm install

FROM node:20-alpine As builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
WORKDIR /app/desktop-app
# Copy all desktop-app files except node_modules and .next
COPY desktop-app/ ./
RUN npm run build

FROM node:20-alpine As runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/desktop-app/.next ./desktop-app/.next
COPY --from=builder /app/desktop-app/public ./desktop-app/public
COPY --from=builder /app/desktop-app/package.json ./desktop-app/package.json
WORKDIR /app/desktop-app
EXPOSE 3000

# Install wget for healthcheck
RUN apk add --no-cache wget

CMD ["npm", "run", "start"] 