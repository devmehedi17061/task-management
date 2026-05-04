import 'dotenv/config';
import express, { type ErrorRequestHandler } from 'express';
import cors from 'cors';

import bootstrap from './routes/bootstrap.js';
import tasks from './routes/tasks.js';
import dropdowns from './routes/dropdowns.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/bootstrap', bootstrap);
app.use('/api/tasks', tasks);
app.use('/api/dropdowns', dropdowns);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error('[api error]', err);
  const status = (err as { status?: number }).status || 500;
  res.status(status).json({ error: (err as Error).message || 'Internal error' });
};
app.use(errorHandler);

export default app;
