import express from 'express';

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'user-service',
    timestamp: new Date().toISOString()
  });
});


import { kafkaClient } from '@platform/shared-kafka';

console.log('Kafka client:', kafkaClient);

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});