FROM node:24.2.0-alpine3.22 AS builder

RUN mkdir -p /usr/service
WORKDIR /usr/service

# RUN npm install -g npm@latest

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./commands/install.non-local-deps.sh ./commands/

# install libs that do not have local libs as dependencies
COPY ./shared/libs/*.tgz ./shared/libs/
RUN npm run _install:non-local-deps

COPY ./shared ./shared
COPY ./regular-user ./regular-user
COPY ./main ./main
COPY ./commands ./commands
COPY ./config ./config
COPY ./server.ts ./server.ts
COPY ./tsconfig.json ./tsconfig.json

# install custom libs
RUN npm run _install:local-deps

RUN npm run clean
RUN npm run build
# CMD [ "npm", "run", "start" ]


FROM node:24.2.0-alpine3.22 AS production

WORKDIR /usr/service

# do not use root user for security reasons
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

COPY --from=builder /usr/service/node_modules ./node_modules
COPY --from=builder /usr/service/dist ./dist
COPY --from=builder /usr/service/commands ./commands
COPY --from=builder /usr/service/package.json ./

# do not use root user for security reasons
RUN chown -R nodejs:nodejs /usr/service
USER nodejs

ENTRYPOINT [ "npm", "run", "serve" ]
