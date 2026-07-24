import cookieParser from 'cookie-parser';
import express from 'express';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client.js';
const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

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
app.get('/api/users', async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.post('/api/users', async (req, res) => {
  console.log(req.headers['content-type']);
  console.log(req.body);
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required.',
    });
  }

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  res.status(201).json(user);
  return;
});

app.use('/api/auth', authRouter);
app.use(errorMiddleware);

const server = app.listen(ENV.PORT, () => {
  console.log(`Listening at http://localhost:${ENV.PORT}/api`);
});

server.on('error', console.error);
