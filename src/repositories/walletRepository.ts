import { Types } from 'mongoose';
import Wallet from '../models/Wallet';
import { IWallet } from '../types/index';

interface WalletData {
  userId: Types.ObjectId;
  balance?: number;
  currency?: string;
}

export const createWallet = async (walletData: WalletData): Promise<IWallet> => {
  const wallet = new Wallet(walletData);
  return await wallet.save();
};

export const findWalletByUserId = async (
  userId: Types.ObjectId | string
): Promise<IWallet | null> => {
  return await Wallet.findOne({ userId });
};

export const updateWalletBalance = async (
  walletId: Types.ObjectId | string,
  newBalance: number
): Promise<IWallet | null> => {
  return await Wallet.findByIdAndUpdate(
    walletId,
    { balance: newBalance },
    { new: true }
  );
};

export const findWalletById = async (
  walletId: Types.ObjectId | string
): Promise<IWallet | null> => {
  return await Wallet.findById(walletId);
};

