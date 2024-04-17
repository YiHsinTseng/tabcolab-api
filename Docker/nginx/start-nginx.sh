#!/bin/bash

# Check if SERVER_NAME is set. If not, use a default value.
if [ -z "$SERVER_NAME" ]; then
    SERVER_NAME="localhost"
fi

# Replace server_name and its value with server_name and the value of environment variable SERVER_NAME
sed -i 's/server_name .*/server_name '"$SERVER_NAME"';/g' /etc/nginx/conf.d/default.conf

# Start Nginx
nginx -g 'daemon off;'