const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/health',
  timeout: 5000,
  method: 'GET',
  headers: {
    'User-Agent': 'Docker-HealthCheck/1.0'
  }
};

const req = http.request(options, (res) => {
  console.log(`Health check: Status ${res.statusCode}`);
  
  if (res.statusCode === 200) {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        if (result.status === 'ok' || result.success === true || result.healthy === true) {
          console.log('Health check passed');
          process.exit(0);
        } else {
          console.error('Health check failed: Invalid response body', result);
          process.exit(1);
        }
      } catch (e) {
        console.log('Health check passed (non-JSON response)');
        process.exit(0);
      }
    });
  } else {
    console.error(`Health check failed: Status ${res.statusCode}`);
    process.exit(1);
  }
});

req.on('error', (err) => {
  console.error('Health check error:', err.message);
  process.exit(1);
});

req.on('timeout', () => {
  console.error('Health check timeout');
  req.destroy();
  process.exit(1);
});

req.end();

// Таймаут на весь запрос
setTimeout(() => {
  console.error('Health check overall timeout');
  process.exit(1);
}, 8000);
