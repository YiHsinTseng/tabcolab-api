# Use an official Node.js runtime as a parent image
FROM node:21-alpine

# Set the working directory to /app
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Expose port 4000
EXPOSE 4000

# Start the application
CMD ["npm", "run", "server"]