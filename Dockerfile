FROM node:20-alpine3.20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

RUN addgroup app && adduser -S -G app app
USER app

EXPOSE 4000

CMD ["node", "app.js"]