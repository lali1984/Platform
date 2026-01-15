import express from 'express';

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'bff-gateway',
    timestamp: new Date().toISOString()
  });
});


app.get('/api/test', async (req, res) => {
  try {
    // Пример BFF логики - агрегируем данные из разных сервисов
    res.json({
      message: 'BFF Gateway is working',
      services: ['auth', 'users', 'news']
    });
  } catch (error) {
    res.status(500).json({ error: 'BFF error' });
  }
});

app.listen(PORT, () => {
  console.log(`BFF Gateway running on port ${PORT}`);
});
