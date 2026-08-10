FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm config set strict-ssl false && npm ci       

COPY . .

RUN npm run build

EXPOSE 8000

CMD ["npm", "start"]