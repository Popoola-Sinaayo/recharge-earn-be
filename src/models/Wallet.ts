import mongoose, { Schema, Model } from 'mongoose';
import { IWallet } from '../types/index';

const walletSchema = new Schema<IWallet>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    currency: {
      type: String,
      default: 'NGN',
    },
  },
  {
    timestamps: true,
  }
);

const Wallet: Model<IWallet> = mongoose.model<IWallet>('Wallet', walletSchema);

export default Wallet;

