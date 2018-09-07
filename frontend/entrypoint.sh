#!/bin/bash
set -euo pipefail

pushd /app

npm run build

cp -r dist/* /usr/share/nginx/html/
sed -i 's/#charset.*$/charset utf-8;/' /etc/nginx/conf.d/default.conf
nginx -g 'daemon off;'
