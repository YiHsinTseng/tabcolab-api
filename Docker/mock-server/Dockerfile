# Use an official Node.js runtime as a parent image
FROM node:21-alpine

# Set the working directory to /app
WORKDIR /app

COPY . .

# Install dependencies
RUN npm install

# Expose port 5050
EXPOSE 5050

# Start the application
CMD ["npm", "run", "mock-server"]