import express from 'express';
import { body } from 'express-validator';
import * as actionController from '../controllers/actionController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../utils/validation.js';

const router = express.Router();

router.get('/products', authenticate, actionController.getProductList);

router.post(
  '/purchase',
  authenticate,
  [
    body('productId').notEmpty().withMessage('Product ID is required'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[0-9]{10,15}$/)
      .withMessage('Please provide a valid phone number'),
  ],
  validate,
  actionController.purchaseData
);

router.get('/history', authenticate, actionController.getPurchaseHistory);

export default router;

