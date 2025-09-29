# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the application code
COPY . .

# Expose port (change if your app uses a different one)
EXPOSE 3005

# Start the server (change index.js if needed)
CMD ["node", "index.js"]
