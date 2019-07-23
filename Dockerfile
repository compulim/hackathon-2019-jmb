FROM node:alpine

EXPOSE 80
WORKDIR /var/bot
ADD . /var/bot
RUN npm ci
RUN npm run build
ENTRYPOINT node .
