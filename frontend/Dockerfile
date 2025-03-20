# Use Node.js official image (lighter variant for better performance)
FROM node:18-alpine AS build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --frozen-lockfile

# Copy the rest of the frontend code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight web server for serving static files
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Remove default nginx static files and replace with React build
RUN rm -rf ./*
COPY --from=build /app/build ./

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]