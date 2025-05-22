# Use official Node image
FROM node:18

WORKDIR /api

COPY package*.json ./
RUN npm install

COPY . .

# Expose the port your app uses
EXPOSE 4000

# Start the app
CMD ["node", "app.js"]
