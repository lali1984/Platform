import { Router } from 'express';

const router = Router();

// Простые заглушки для тестирования
router.post('/register', (req, res) => {
  res.status(201).json({ 
    message: 'User registered (stub)',
    user: { 
      id: 'stub-id', 
      email: req.body.email || 'test@example.com' 
    }
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'auth-service',
    timestamp: new Date().toISOString(),
    path: '/api/auth/health'
  });
});

router.post('/login', (req, res) => {
  res.json({
    message: 'Login successful (stub)',
    accessToken: 'stub-jwt-token',
    refreshToken: 'stub-refresh-token'
  });
});

router.post('/refresh-token', (req, res) => {
  res.json({
    message: 'Token refreshed (stub)',
    accessToken: 'stub-new-jwt-token',
    refreshToken: 'stub-new-refresh-token'
  });
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out (stub)' });
});

export default router;