FROM node:13.13.0 AS build-env
WORKDIR /app
ENV NODE_ENV=development
ADD . $WORKDIR
RUN npm install

FROM extremesolution/nodejs-nginx:node13.3.0-5949bda
COPY --from=build-env /app /app
WORKDIR /app
ADD wait-for.sh /wait-for.sh
ADD deployment-configs/nginx-app.conf /etc/nginx/conf.d/nginx-app.conf
ADD deployment-configs/supervisor.pm2.conf /etc/supervisor/conf.d/supervisor.pm2.conf
RUN npm install -g knex
RUN npm install -g @sublet/data-layer --unsafe-perm
ENTRYPOINT ["/app/dbsetup.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
#CMD ["npm", "start"]

