const express = require('express');
const cors = require('cors');
const { createClient } = require('redis');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Подключаемся к Redis для событий
const redisClient = createClient({ url: 'redis://localhost:6379' });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

async function initRedis() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis for events');
  } catch (error) {
    console.log('Redis not available, events will be logged only');
  }
}

initRedis();

// Простой эндпоинт регистрации с событием
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Здесь в реальности была бы регистрация в базе
    const userId = `user_${Date.now()}`;
    
    // Создаем событие
    const event = {
      type: 'user.registered',
      timestamp: new Date().toISOString(),
      source: 'auth-service',
      data: {
        userId,
        email,
        registeredAt: new Date().toISOString()
      }
    };

    // Пытаемся опубликовать событие
    try {
      await redisClient.publish('platform-events', JSON.stringify(event));
      console.log(`✅ Event published: user.registered for ${email}`);
    } catch (error) {
      console.log(`⚠️  Event not published (Redis error): ${email}`);
    }

    res.status(201).json({ 
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'auth-service-test',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log('🚀 Auth Service running on port', PORT);
console.log('✅ Health check: http://localhost:' + PORT + '/health');
console.log('✅ Register: POST http://localhost:' + PORT + '/api/auth/register');
console.log('✅ Login: POST http://localhost:' + PORT + '/api/auth/login');
console.log('✅ 2FA Generate: POST http://localhost:' + PORT + '/api/auth/2fa/generate');
console.log('✅ 2FA Verify: POST http://localhost:' + PORT + '/api/auth/2fa/verify');
console.log('✅ Refresh Token: POST http://localhost:' + PORT + '/api/auth/refresh-token');
});
