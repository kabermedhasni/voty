#!/bin/bash

# Start PHP built-in server in background
php -S 0.0.0.0:8080 -t . &
PHP_PID=$!

# Start Node.js API
cd apis/hedera-api
node app.js &
NODE_PID=$!

# Wait for both processes
wait $PHP_PID $NODE_PID
