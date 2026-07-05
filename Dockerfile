# Build stage
FROM node:24-alpine AS builder

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json

WORKDIR /app
RUN npm install

COPY . .
RUN npm run build

# Production stage
FROM nginx:1.31-alpine-slim
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8000

CMD ["nginx", "-g", "daemon off;"]
