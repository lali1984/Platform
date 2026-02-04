const http = require('http');

const options = {
  hostname: 'localhost',
  port: 5173,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log(`Frontend health check status: ${res.statusCode}`);
  process.exit(res.statusCode === 200 ? 0 : 1);
});

req.on('error', (err) => {
  console.error('Frontend health check failed:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Frontend health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();
