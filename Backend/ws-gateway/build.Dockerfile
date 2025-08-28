## === STAGE 1: Build ===
FROM node:current-alpine AS builder

WORKDIR /services

COPY ./services .

RUN npm install

RUN npm run build

WORKDIR /app

COPY ./api-gateway/package.json .

RUN npm install

COPY ./api-gateway .

RUN npm run build

RUN npm run bundle

# === STAGE 2: Production Files ===
FROM node:current-alpine AS runner

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime \
    && echo "Asia/Kolkata" > /etc/timezone \
    && apk del tzdata

WORKDIR /app

COPY --from=builder /app/bundle ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

CMD ["node","build/app.mjs"]