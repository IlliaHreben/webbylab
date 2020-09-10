FROM node:12-alpine
ENV NODE_ENV production
RUN mkdir /webbylab
WORKDIR /webbylab
COPY client client
COPY server server
WORKDIR client
RUN npm ci
RUN npm run build
WORKDIR ../server
RUN npm ci
CMD node lib/index.js
