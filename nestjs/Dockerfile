FROM node:13.13.0
ENV NODE_ENV=development
WORKDIR /app
ADD . $WORKDIR
RUN yarn install
CMD ["yarn", "start:full"]

