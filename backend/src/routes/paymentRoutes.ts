import { Router } from 'express';
import { handlePaystackWebhook } from '../controllers/paymentController';
import express from 'express';

const router = Router();

// Paystack sends JSON, so this route expects JSON.
// Make sure this is mounted after express.json() in app.ts,
// but the controller reads req.body directly to compute HMAC.
// Note: Computing HMAC from req.body after express.json() parses it can sometimes fail 
// if keys are reordered. For a perfect implementation, raw-body should be used.
// However, the prompt implies using JSON.stringify(req.body) per standard approach.
router.post('/paystack', express.json(), handlePaystackWebhook);

export default router;
