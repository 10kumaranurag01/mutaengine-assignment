import express from 'express';
import { createPaymentIntent } from '../services/stripe.js';

const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);

export default router;
