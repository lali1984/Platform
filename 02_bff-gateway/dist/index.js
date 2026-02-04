"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3003;
app.use(express_1.default.json());
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
    }
    catch (error) {
        res.status(500).json({ error: 'BFF error' });
    }
});
app.listen(PORT, () => {
    console.log(`BFF Gateway running on port ${PORT}`);
});
