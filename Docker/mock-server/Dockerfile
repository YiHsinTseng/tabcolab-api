# Use an official Node.js runtime as a parent image
FROM node:21-alpine

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json to /app
COPY mock-server/package*.json .

# Copy the rest of the application code to /app
COPY mock-server ./mock-server
COPY routes ./routes
COPY controllers ./controllers
COPY models/mock-server ./models/mock-server 
COPY utils ./utils
COPY configs ./configs
COPY middlewares ./middlewares
COPY swaggers ./swaggers
COPY validations ./validations

# Install dependencies
RUN npm install

# Expose port 4000
EXPOSE 4000

# Start the application
CMD ["npm", "run", "dockerStart"]