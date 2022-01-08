FROM node:14.18.2-alpine

# the backend will be in /app/backend wd
WORKDIR /app/frontend

COPY package.json ./
RUN npm install

COPY . ./

RUN npm run build:docker

EXPOSE 3000