import express from 'express';
import healthRoutes from './health';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.use('/', healthRoutes);

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
