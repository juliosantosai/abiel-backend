FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

COPY prisma ./prisma
COPY prisma.config.cjs ./prisma.config.cjs
COPY tsconfig.json ./
COPY src ./src

RUN npx prisma generate
RUN npm run build
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]
