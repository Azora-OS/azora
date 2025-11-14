# Use an official Node.js runtime as a parent image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Make port 3004 available to the world outside this container
EXPOSE 3004

# Define environment variable
ENV PORT 3004

# Run server.js when the container launches
CMD ["node", "server.js"]