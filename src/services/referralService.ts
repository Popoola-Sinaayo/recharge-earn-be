import { Types } from 'mongoose';
import * as userRepository from '../repositories/userRepository';
import * as walletService from './walletService';

const REFERRAL_REWARD_PERCENTAGE = 0.01; // 1%

/**
 * Process referral reward when a referred user makes a purchase
 * @param userId - The user who made the purchase
 * @param purchaseAmount - The amount of the purchase
 * @param purchaseType - Type of purchase (data, airtime, cable, electricity)
 * @param purchaseDetails - Additional details about the purchase
 */
export const processReferralReward = async (
  userId: Types.ObjectId | string,
  purchaseAmount: number,
  purchaseType: string,
  purchaseDetails: Record<string, any> = {}
): Promise<void> => {
  try {
    // Find the user who made the purchase
    const user = await userRepository.findUserById(userId);
    if (!user || !user.referredBy) {
      // User not found or not referred by anyone
      return;
    }

    // Calculate referral reward (1% of purchase amount)
    const rewardAmount = purchaseAmount * REFERRAL_REWARD_PERCENTAGE;

    // Round to 2 decimal places
    const roundedReward = Math.round(rewardAmount * 100) / 100;

    if (roundedReward <= 0) {
      return;
    }

    // Credit the referrer's wallet
    await walletService.creditWallet(
      user.referredBy,
      roundedReward,
      'referral_reward',
      {
        description: `Referral reward from ${purchaseType} purchase`,
        referredUserId: user._id.toString(),
        referredUserEmail: user.email,
        purchaseAmount,
        purchaseType,
        rewardAmount: roundedReward,
        ...purchaseDetails,
      }
    );
  } catch (error: any) {
    // Log error but don't throw - referral rewards should not break the purchase flow
    console.error('Error processing referral reward:', error.message);
  }
};

/**
 * Get referral statistics for a user
 */
export const getReferralStats = async (
  userId: Types.ObjectId | string
): Promise<{
  referralCode: string | undefined;
  totalReferrals: number;
  totalRewards: number;
}> => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Count users referred by this user
  const User = (await import('../models/User')).default;
  const totalReferrals = await User.countDocuments({ referredBy: user._id });

  // Calculate total rewards from transactions
  const Transaction = (await import('../models/Transaction')).default;
  const rewardTransactions = await Transaction.find({
    userId: user._id,
    category: 'referral_reward',
    status: 'completed',
  });

  const totalRewards = rewardTransactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0
  );

  return {
    referralCode: user.referralCode,
    totalReferrals,
    totalRewards: Math.round(totalRewards * 100) / 100,
  };
};

