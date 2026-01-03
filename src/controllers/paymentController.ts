import { Request, Response } from 'express';
import * as paymentService from "../services/paymentService";
import { successResponse, errorResponse } from "../utils/response";
import { PaystackWebhookEvent } from "../types/index";

export const initializePayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }
    const { amount } = req.body;
    const userId = req.user._id;
    const email = req.user.email;

    if (!amount || amount <= 0) {
      return errorResponse(res, 400, 'Invalid amount');
    }

    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    const paymentData = await paymentService.initializePayment(
      email,
      amount,
      userId
    );

    return successResponse(
      res,
      200,
      'Payment initialized successfully',
      paymentData
    );
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const verifyPayment = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { reference } = req.query;
    if (!reference || typeof reference !== 'string') {
      return errorResponse(res, 400, 'Reference is required');
    }

    const verification = await paymentService.verifyPayment(reference);
    return successResponse(
      res,
      200,
      'Payment verified successfully',
      verification
    );
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const handleWebhook = async (req: Request, res: Response): Promise<Response> => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;

    // Parse the raw body (it's already parsed by express.json middleware)
    let payload: PaystackWebhookEvent;
    if (typeof req.body === 'string') {
      payload = JSON.parse(req.body);
    } else {
      payload = req.body as PaystackWebhookEvent;
    }

    // Verify webhook signature
    if (process.env.PAYSTACK_WEBHOOK_SECRET) {
      const isValid = paymentService.verifyWebhookSignature(payload, signature);
      if (!isValid) {
        return errorResponse(res, 401, 'Invalid webhook signature');
      }
    }

    const result = await paymentService.handleWebhook(payload);
    return successResponse(res, 200, 'Webhook processed successfully', result);
  } catch (error: any) {
    console.error('Webhook error:', error);
    return errorResponse(res, 400, error.message);
  }
};

