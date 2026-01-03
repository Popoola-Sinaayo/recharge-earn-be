import axios from 'axios';
import crypto from 'crypto';
import { Types } from 'mongoose';
import * as walletRepository from '../repositories/walletRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import { generateReference } from '../utils/generateReference';
import { PaystackWebhookEvent, PaymentInitializeResponse } from '../types/index';
import dotenv from 'dotenv';
dotenv.config();

const PAYSTACK_BASE_URL = 'https://api.paystack.co';

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: any;
}

// Initialize Paystack payment
export const initializePayment = async (
  email: string,
  amount: number,
  userId: Types.ObjectId | string
): Promise<PaymentInitializeResponse> => {
  const reference = generateReference('PAY');
  const amountInKobo = Math.round(amount * 100); // Convert to kobo

  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined');
  }

  try {
    const response = await axios.post<PaystackInitializeResponse>(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        reference,
        callback_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/payments/verify`,
        metadata: {
          userId: userId.toString(),
          custom_fields: [
            {
              display_name: 'User ID',
              variable_name: 'user_id',
              value: userId.toString(),
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Create pending transaction
    const wallet = await walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    await transactionRepository.createTransaction({
      userId: typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
      walletId: wallet._id,
      type: 'credit',
      category: 'funding',
      amount,
      balanceBefore: wallet.balance,
      balanceAfter: wallet.balance,
      status: 'pending',
      reference,
      paystackReference: response.data.data.reference,
      description: 'Wallet funding',
      metadata: {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
      },
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code,
      reference: response.data.data.reference,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to initialize payment'
    );
  }
};

// Verify Paystack payment
export const verifyPayment = async (reference: string): Promise<PaystackVerifyResponse> => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    throw new Error('PAYSTACK_SECRET_KEY is not defined');
  }

  try {
    const response = await axios.get<PaystackVerifyResponse>(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Failed to verify payment'
    );
  }
};

// Handle Paystack webhook
export const handleWebhook = async (
  event: PaystackWebhookEvent
): Promise<{ message: string; transactionId?: Types.ObjectId }> => {
  if (event.event === 'charge.success') {
    const { reference, amount, metadata } = event.data;

    // Find transaction by Paystack reference
    const transaction = await transactionRepository.findTransactionByPaystackReference(
      reference
    );

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // If already processed, return
    if (transaction.status === 'completed') {
      return { message: 'Transaction already processed' };
    }

    const amountInNaira = amount / 100; // Convert from kobo to naira
    const userId = metadata?.userId || transaction.userId.toString();

    // Credit wallet
    const wallet = await walletRepository.findWalletByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amountInNaira;

    // Update wallet balance
    await walletRepository.updateWalletBalance(wallet._id, balanceAfter);

    // Update transaction status
    await transactionRepository.updateTransactionStatus(
      transaction._id,
      'completed',
      {
        balanceBefore,
        balanceAfter,
        amount: amountInNaira,
      }
    );

    return {
      message: 'Payment processed successfully',
      transactionId: transaction._id,
    };
  }

  return { message: 'Event not handled' };
};

// Verify webhook signature
export const verifyWebhookSignature = (payload: any, signature: string): boolean => {
  if (!process.env.PAYSTACK_WEBHOOK_SECRET) {
    throw new Error('PAYSTACK_WEBHOOK_SECRET is not defined');
  }

  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');

  return hash === signature;
};

