FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY backend backend
COPY shared shared
COPY services services

RUN npm run build --workspace backend

WORKDIR /app/backend

EXPOSE 4100

CMD ["npm", "run", "start"]

