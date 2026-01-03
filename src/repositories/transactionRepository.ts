import { Types } from 'mongoose';
import Transaction from '../models/Transaction';
import { ITransaction, TransactionCategory } from "../types";
import { TransactionStatus } from '../types';

interface TransactionData {
  userId: Types.ObjectId;
  walletId: Types.ObjectId;
  type: "credit" | "debit";
  category: TransactionCategory;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status?: TransactionStatus;
  reference?: string;
  paystackReference?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export const createTransaction = async (
  transactionData: TransactionData
): Promise<ITransaction> => {
  const transaction = new Transaction(transactionData);
  return await transaction.save();
};

export const findTransactionByReference = async (
  reference: string
): Promise<ITransaction | null> => {
  return await Transaction.findOne({ reference });
};

export const findTransactionByPaystackReference = async (
  paystackReference: string
): Promise<ITransaction | null> => {
  return await Transaction.findOne({ paystackReference });
};

export const findTransactionsByUserId = async (
  userId: Types.ObjectId | string,
  limit: number = 50,
  skip: number = 0
): Promise<ITransaction[]> => {
  return await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('walletId', 'balance');
};

export const updateTransactionStatus = async (
  transactionId: Types.ObjectId | string,
  status: TransactionStatus,
  metadata: Record<string, any> = {}
): Promise<ITransaction | null> => {
  return await Transaction.findByIdAndUpdate(
    transactionId,
    { status, ...metadata },
    { new: true }
  );
};

