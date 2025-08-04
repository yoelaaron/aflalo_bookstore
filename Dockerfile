FROM node:24-alpine

RUN apk update && apk upgrade --no-cache

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci && npm cache clean --force

COPY . .

RUN npm run build

EXPOSE 3008

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

RUN chown -R nestjs:nodejs /usr/src/app
USER nestjs

CMD ["npm", "run", "start:prod"]