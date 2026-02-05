const http = require('http');
const os = require('os');

const config = {
  hostname: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  path: '/health',
  timeout: 10000, // 10 seconds
  method: 'GET',
  headers: {
    'User-Agent': 'Docker-HealthCheck/1.0',
    'Accept': 'application/json',
    'X-Health-Check': 'true'
  }
};

console.log(`Health check for ${config.hostname}:${config.port}${config.path}`);

const req = http.request(config, (res) => {
  console.log(`Status: ${res.statusCode}, Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      
      // Validate health check response
      const isHealthy = (
        res.statusCode === 200 &&
        result.status === 'healthy' &&
        result.timestamp &&
        result.services &&
        result.services.database === 'connected'
      );
      
      if (isHealthy) {
        console.log('✅ Health check passed:', {
          status: result.status,
          timestamp: result.timestamp,
          services: result.services
        });
        process.exit(0);
      } else {
        console.error('❌ Health check failed. Response:', {
          statusCode: res.statusCode,
          body: result
        });
        process.exit(1);
      }
    } catch (e) {
      console.error('❌ Invalid JSON response:', e.message, 'Raw data:', data);
      process.exit(1);
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Health check error:', {
    message: err.message,
    code: err.code,
    syscall: err.syscall,
    address: err.address,
    port: err.port
  });
  process.exit(1);
});

req.on('timeout', () => {
  console.error('❌ Health check timeout after', config.timeout, 'ms');
  req.destroy();
  process.exit(1);
});

// Set overall timeout
const overallTimeout = setTimeout(() => {
  console.error('❌ Health check overall timeout');
  process.exit(1);
}, 15000);

req.on('close', () => {
  clearTimeout(overallTimeout);
});

req.end();