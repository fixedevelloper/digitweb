# Image de développement (serveur Next.js en mode dev, hot-reload).
# Une image de production séparée (build + next start) est un sujet à part.
FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
