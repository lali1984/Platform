'use strict';

const http = require('http');

class HealthCheck {
  constructor() {
    this.timeout = 8000; // 8 секунд timeout
    this.port = process.env.PORT || 3006;
    this.host = 'localhost';
    this.metricsEndpoint = '/metrics';
    this.healthEndpoint = '/health';
  }

  async check() {
    try {
      // Проверка метрик
      const metricsOk = await this.checkEndpoint(this.metricsEndpoint, {
        'Accept': 'text/plain',
        'User-Agent': 'Platform-HealthCheck/1.0'
      });
      
      if (!metricsOk) {
        console.error('Metrics endpoint check failed');
        return false;
      }

      // Проверка health endpoint
      const healthOk = await this.checkEndpoint(this.healthEndpoint, {
        'Accept': 'application/json',
        'User-Agent': 'Platform-HealthCheck/1.0'
      }, true);
      
      if (!healthOk) {
        console.error('Health endpoint check failed');
        return false;
      }

      // Проверка памяти процесса (опционально)
      const memoryUsage = process.memoryUsage();
      const memoryPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      if (memoryPercent > 90) {
        console.warn(`High memory usage: ${memoryPercent.toFixed(2)}%`);
        // Не падаем, только предупреждаем
      }

      return true;
    } catch (error) {
      console.error('Health check failed with error:', error.message);
      return false;
    }
  }

  checkEndpoint(path, headers, parseJson = false) {
    return new Promise((resolve) => {
      const options = {
        hostname: this.host,
        port: this.port,
        path,
        method: 'GET',
        timeout: this.timeout,
        headers
      };

      const req = http.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            if (parseJson) {
              try {
                const jsonData = JSON.parse(data);
                if (jsonData.status === 'healthy') {
                  resolve(true);
                } else {
                  console.error(`Health endpoint returned unhealthy status: ${jsonData.status}`);
                  resolve(false);
                }
              } catch (e) {
                console.error(`Failed to parse health response: ${e.message}`);
                resolve(false);
              }
            } else {
              // Для метрик проверяем что возвращается текст
              if (res.headers['content-type'] && 
                  res.headers['content-type'].includes('text/plain') &&
                  data.length > 0) {
                resolve(true);
              } else {
                console.error(`Invalid content type for metrics: ${res.headers['content-type']}`);
                resolve(false);
              }
            }
          } else {
            console.error(`Endpoint ${path} returned status: ${res.statusCode}`);
            resolve(false);
          }
        });
      });

      req.on('error', (error) => {
        console.error(`Request to ${path} failed:`, error.message);
        resolve(false);
      });

      req.on('timeout', () => {
        console.error(`Request to ${path} timed out after ${this.timeout}ms`);
        req.destroy();
        resolve(false);
      });

      req.end();
    });
  }
}

// Запуск проверки
const healthCheck = new HealthCheck();

// Таймаут для всей проверки
const overallTimeout = setTimeout(() => {
  console.error('Health check overall timeout');
  process.exit(1);
}, 15000);

healthCheck.check()
  .then((isHealthy) => {
    clearTimeout(overallTimeout);
    if (isHealthy) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((error) => {
    clearTimeout(overallTimeout);
    console.error('Health check unexpected error:', error);
    process.exit(1);
  });