#!/bin/bash

cd /var/www/release-v2.0.0/uploadapi
source env/bin/activate
gunicorn -b 127.0.0.1:8002 upload:app
