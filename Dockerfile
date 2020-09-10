FROM node:12-alpine
RUN mkdir /webbylab
WORKDIR /webbylab
COPY client client
COPY server server
WORKDIR client
RUN npm install
RUN npm run build
WORKDIR ../server
RUN npm install
CMD node lib/index.js
