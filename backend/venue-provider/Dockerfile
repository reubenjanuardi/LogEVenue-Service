FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

# Copy wait-for-it or similar if needed for DB dependency, though we'll rely on compose restart policies for simplicity
EXPOSE 4002

CMD ["node", "index.js"]
