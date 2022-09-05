FROM node:16.15-alpine3.15

RUN mkdir -p /app
WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

LABEL maintainer="Johnny Lee Chambers Jr."

CMD ["node", "index.js"]