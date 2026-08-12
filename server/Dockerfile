FROM node:22-alpine

WORKDIR /app

# Sybase driver requires Java
# --no-check-certificate is needed because of the network's TLS certificate inspection
RUN apk --no-check-certificate update \
    && apk --no-check-certificate add openjdk17-jre \
    && java -version

COPY package*.json ./

RUN npm config set strict-ssl false && npm ci

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["node", "dist/src/index.js"]