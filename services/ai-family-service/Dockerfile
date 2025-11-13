# Use an official Node.js runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV PORT 80

# Run family-tree-api.js when the container launches
CMD ["node", "family-tree-api.js"]
