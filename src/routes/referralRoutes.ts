import express from 'express';
import * as referralController from '../controllers/referralController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.get('/code', authenticate, referralController.getReferralCode);
router.get('/stats', authenticate, referralController.getReferralStats);

export default router;

