# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Add build args for NEXT_PUBLIC_* variables
ARG NEXT_PUBLIC_MAPBOX_API_KEY
ARG NEXT_PUBLIC_API_URL

# Make them available to Next.js at build time
ENV NEXT_PUBLIC_MAPBOX_API_KEY=$NEXT_PUBLIC_MAPBOX_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copy dependency definitions
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build the Next.js app
RUN npm run build

# Expose port (default Next.js port)
EXPOSE 3000

# Start the app
CMD ["npm", "start"]