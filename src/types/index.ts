import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
  referredBy?: Types.ObjectId;
  isActive: boolean;
  isEmailVerified: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWallet extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TransactionType = 'credit' | 'debit';
export type TransactionCategory = 'funding' | 'data_purchase' | 'airtime_purchase' | 'electricity_purchase' | 'cable_purchase' | 'refund' | 'withdrawal' | 'referral_reward';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface ITransaction extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: TransactionStatus;
  reference?: string;
  paystackReference?: string;
  token?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  referralCode?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<IUser, 'password'>;
  token: string;
}

export interface WalletBalanceResponse {
  balance: number;
  currency: string;
}

export interface PaymentInitializeData {
  email: string;
  amount: number;
}

export interface PaymentInitializeResponse {
  authorizationUrl: string;
  accessCode: string;
  reference: string;
}

export interface DataPurchaseData {
  productId: string;
  phoneNumber: string;
  network?: string;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    reference: string;
    amount: number;
    customer: {
      email: string;
    };
    metadata?: {
      userId?: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
}

export interface VerifyOtpData {
  email: string;
  otp: string;
}

