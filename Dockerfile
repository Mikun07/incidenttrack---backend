# syntax=docker/dockerfile:1

FROM node:22-alpine AS dependencies
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM dependencies AS build
WORKDIR /app

COPY prisma ./prisma
COPY src ./src
COPY tsconfig.json ./
RUN DATABASE_URL="postgresql://localhost:5432/incidenttrack?schema=public" npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY prisma ./prisma

USER node
EXPOSE 4000

CMD ["npm", "start"]
