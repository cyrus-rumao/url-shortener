import { Router } from 'express';

import { authMiddleware } from '../../shared/middleware/auth.middleware';

import { authController } from './auth.controller';

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', authMiddleware, authController.me);

export { authRouter };
