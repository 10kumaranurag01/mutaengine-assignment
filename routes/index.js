import express from 'express';
import authRoutes from './authRoutes.js';
import googleAuthRoutes from './googleAuthRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import recaptcha from '../middleware/recaptcha.js';
import authMiddleware from '../middleware/auth.js';
import { ConfirmResetPassword } from '../controllers/authController.js';
import stripeWebhook from '../controllers/stripeWebhookController.js';

const rootRouter = express.Router();

// Routes
rootRouter.use('/auth', recaptcha, authRoutes);
rootRouter.use('/auth/google', googleAuthRoutes);
rootRouter.use('/payments', authMiddleware, paymentRoutes);
rootRouter.use('/stripe-webhook', stripeWebhook)
rootRouter.post('/confirm-reset-password', ConfirmResetPassword);

export default rootRouter;