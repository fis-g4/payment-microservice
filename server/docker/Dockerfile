# Use an official Node.js runtime as the base image
FROM node:21.1-slim

# Set the working directory in the container
WORKDIR /usr/src/server

# Copy the rest of the application source code to the container
COPY ./server .
COPY ./GoogleCloudKey.json ..
COPY ./.env .

# Install Node.js dependencies
RUN npm install

# Build your React application (you can customize the build command)
RUN npm run build

# Specify the command to start your React app
CMD [ "npm", "start" ]