FROM node:24-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts

# Vite is a devDependency, so install everything for the build stage
COPY . .
RUN npm install && npm run build && npm prune --omit=dev

ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/data
VOLUME /data
EXPOSE 4000

CMD ["node", "server/index.js"]
