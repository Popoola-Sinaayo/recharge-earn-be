import express from 'express';
import { body } from 'express-validator';
import * as dataUpController from '../controllers/dataUpController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

// All routes require authentication except signin (which is handled internally)
router.get('/data', authenticate, dataUpController.getDataPlans);

router.post(
  '/data_purchase',
  authenticate,
  [
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('plan_id').notEmpty().withMessage('Plan ID is required'),
    body('reference').notEmpty().withMessage('Reference is required'),
  ],
  validate,
  dataUpController.purchaseData
);

router.post(
  '/airtime_purchase',
  authenticate,
  [
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('amount').notEmpty().withMessage('Amount is required'),
    body('network').notEmpty().withMessage('Network is required'),
    body('reference').notEmpty().withMessage('Reference is required'),
  ],
  validate,
  dataUpController.purchaseAirtime
);

router.post(
  '/verify_meter',
  authenticate,
  [
    body('plan_id').notEmpty().withMessage('Plan ID is required'),
    body('meter_number').notEmpty().withMessage('Meter number is required'),
  ],
  validate,
  dataUpController.verifyMeter
);

router.post(
  '/electric_purchase',
  authenticate,
  [
    body('phone_number').notEmpty().withMessage('Phone number is required'),
    body('plan_id').notEmpty().withMessage('Plan ID is required'),
    body('amount').notEmpty().withMessage('Amount is required'),
    body('meter_number').notEmpty().withMessage('Meter number is required'),
  ],
  validate,
  dataUpController.purchaseElectricity
);

router.post(
  '/cable_purchase',
  authenticate,
  [
    body('smartcard_number').notEmpty().withMessage('Smartcard number is required'),
    body('plan_id').notEmpty().withMessage('Plan ID is required'),
  ],
  validate,
  dataUpController.purchaseCable
);

router.get(
  '/transactions/reference/:refId',
  authenticate,
  dataUpController.getTransactionByReference
);

export default router;

