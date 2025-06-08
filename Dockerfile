FROM node:20-alpine3.20

# Working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create non-root user for security
RUN addgroup app && adduser -S -G app app
# USER app

# Expose the port the app runs on
EXPOSE 4000

# Start the app
CMD ["node", "app.js"]