FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build && npm prune --production

EXPOSE 3000

CMD ["node", "build"]