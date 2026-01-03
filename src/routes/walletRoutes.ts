import express from 'express';
import * as walletController from '../controllers/walletController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/balance', authenticate, walletController.getBalance);
router.get('/transactions', authenticate, walletController.getTransactions);

export default router;

