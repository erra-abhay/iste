FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install --production

# Copy entire project
COPY . .

# Create uploads directory
RUN mkdir -p backend/uploads

# Expose internal port
EXPOSE 5000

# Set environment variables
ENV PORT=5000
ENV NODE_ENV=production

# Start the backend server
CMD ["node", "backend/server.js"]
