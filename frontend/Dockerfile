FROM nginx

RUN apt-get update && apt-get install -y wget gnupg2 unzip git
RUN wget -O- https://deb.nodesource.com/setup_8.x | bash  # security what?
RUN apt-get install -y nodejs
RUN npm install -g npm@5.5.1
RUN npm install --global bower@1.3
RUN echo '{ "allow_root": true }' > /root/.bowerrc
WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json

RUN npm install && \
npm install inject-loader expose-loader scripts-loader

COPY . /app
RUN npm run build && \
    cp -r dist/* /usr/share/nginx/html/ && \
    rm -rf node_modules/

COPY ./nginx/nginx.conf /etc/nginx/nginx.conf
RUN sed -i 's/#charset.*$/charset utf-8;/' /etc/nginx/conf.d/default.conf

CMD nginx -g 'daemon off;'
