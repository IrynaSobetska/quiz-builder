import express from 'express';
import quizRoutes from './routes/quizRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/quizzes', quizRoutes);

app.use(errorHandler);

export default app;
