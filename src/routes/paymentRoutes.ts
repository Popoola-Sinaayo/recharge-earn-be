import express from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.post(
  '/initialize',
  authenticate,
  paymentController.initializePayment
);

router.get('/verify', paymentController.verifyPayment);

// Webhook endpoint (no authentication needed, but signature verification should be done)
router.post('/webhook', paymentController.handleWebhook);

export default router;

