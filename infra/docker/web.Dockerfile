FROM node:24-alpine
WORKDIR /app

COPY src/web/package.json src/web/package-lock.json ./
RUN npm ci
COPY src/web/ ./

EXPOSE 4200
CMD ["npm", "start", "--", "--host", "0.0.0.0", "--proxy-config", "proxy.compose.conf.json"]
