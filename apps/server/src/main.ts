import cookieParser from 'cookie-parser';
import express from 'express';

import { authRouter } from './modules/auth/auth.routes';
import { ENV } from './shared/config/env';
import { errorMiddleware } from './shared/middleware/error.middleware';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'URL shortener server is running.',
    data: {},
  });
});

app.use('/api/auth', authRouter);
app.use(errorMiddleware);

const server = app.listen(ENV.PORT, () => {
  console.log(`Listening at http://localhost:${ENV.PORT}/api`);
});

server.on('error', console.error);
