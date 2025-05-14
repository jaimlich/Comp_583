# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the port used by your Express server
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]
