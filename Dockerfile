FROM node:20.0-alpine

# Working directory
WORKDIR /app
COPY package*.json .
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN addgroup app && adduser -S -G app app
USER app

# Expose the port the app runs on
EXPOSE 4000

CMD [ "node", "app.js" ]