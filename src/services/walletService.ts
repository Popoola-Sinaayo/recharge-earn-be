import { Types } from 'mongoose';
import * as walletRepository from '../repositories/walletRepository';
import * as transactionRepository from '../repositories/transactionRepository';
import { generateReference } from '../utils/generateReference';
import { IWallet, ITransaction, TransactionCategory } from '../types/index';

export const getWalletBalance = async (
  userId: Types.ObjectId | string
): Promise<IWallet> => {
  let wallet = await walletRepository.findWalletByUserId(userId);

  if (!wallet) {
    // Create wallet if it doesn't exist
    wallet = await walletRepository.createWallet({
      userId: typeof userId === 'string' ? new Types.ObjectId(userId) : userId,
      balance: 0,
      currency: 'NGN',
    });
  }

  return wallet;
};

export const creditWallet = async (
  userId: Types.ObjectId | string,
  amount: number,
  category: TransactionCategory,
  metadata: Record<string, any> = {}
): Promise<{ wallet: IWallet; transaction: ITransaction }> => {
  const wallet = await walletRepository.findWalletByUserId(userId);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore + amount;

  // Update wallet balance
  await walletRepository.updateWalletBalance(wallet._id, balanceAfter);

  // Create transaction record
  const transaction = await transactionRepository.createTransaction({
    userId: typeof userId === "string" ? new Types.ObjectId(userId) : userId,
    walletId: wallet._id,
    type: "credit",
    category,
    amount,
    balanceBefore,
    balanceAfter,
    status: "completed",
    reference: generateReference("CR"),
    description: metadata.description || "Wallet credited",
    token: metadata.token,
    metadata,
  });

  const updatedWallet = await walletRepository.findWalletById(wallet._id);
  if (!updatedWallet) {
    throw new Error("Wallet not found after update");
  }

  return { wallet: updatedWallet, transaction };
};

export const debitWallet = async (
  userId: Types.ObjectId | string,
  amount: number,
  category: TransactionCategory,
  metadata: Record<string, any> = {}
): Promise<{ wallet: IWallet; transaction: ITransaction }> => {
  const wallet = await walletRepository.findWalletByUserId(userId);

  if (!wallet) {
    throw new Error("Wallet not found");
  }

  if (wallet.balance < amount) {
    throw new Error("Insufficient wallet balance");
  }

  const balanceBefore = wallet.balance;
  const balanceAfter = balanceBefore - amount;

  // Update wallet balance
  await walletRepository.updateWalletBalance(wallet._id, balanceAfter);

  // Create transaction record
  const transaction = await transactionRepository.createTransaction({
    userId: typeof userId === "string" ? new Types.ObjectId(userId) : userId,
    walletId: wallet._id,
    type: "debit",
    category,
    amount,
    balanceBefore,
    balanceAfter,
    status: "completed",
    reference: generateReference("DB"),
    description: metadata.description || "Wallet debited",
    token: metadata.token,
    metadata,
  });

  const updatedWallet = await walletRepository.findWalletById(wallet._id);
  if (!updatedWallet) {
    throw new Error("Wallet not found after update");
  }

  return { wallet: updatedWallet, transaction };
};

export const getWalletTransactions = async (
  userId: Types.ObjectId | string,
  limit: number = 50,
  skip: number = 0
): Promise<ITransaction[]> => {
  return await transactionRepository.findTransactionsByUserId(userId, limit, skip);
};

