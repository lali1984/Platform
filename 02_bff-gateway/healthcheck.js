const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/health',
  timeout: 5000,
  headers: {
    'User-Agent': 'HealthCheck/1.0'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const health = JSON.parse(data);
      if (res.statusCode === 200 && health.status === 'healthy') {
        console.log('Health check passed');
        process.exit(0);
      } else {
        console.log(`Health check failed: ${data}`);
        process.exit(1);
      }
    } catch (e) {
      console.error('Invalid JSON response:', e.message);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error(`ERROR: ${err.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('TIMEOUT: Health check timed out');
  req.destroy();
  process.exit(1);
});

req.end();
