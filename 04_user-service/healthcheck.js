#!/usr/bin/env node

const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Health check status: ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on('error', (err) => {
  console.error('Health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
