import { Types } from 'mongoose';
import User from '../models/User';
import { IUser } from '../types';
import { RegisterUserData } from '../types';

export const createUser = async (userData: RegisterUserData): Promise<IUser> => {
  const user = new User(userData);
  return await user.save();
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return await User.findOne({ email }).select('+password');
};

export const findUserById = async (userId: Types.ObjectId | string): Promise<IUser | null> => {
  return await User.findById(userId);
};

export const updateUser = async (
  userId: Types.ObjectId | string,
  updateData: Partial<IUser>
): Promise<IUser | null> => {
  return await User.findByIdAndUpdate(userId, updateData, { new: true });
};

export const findUserByReferralCode = async (
  referralCode: string
): Promise<IUser | null> => {
  return await User.findOne({ referralCode: referralCode.toUpperCase() });
};

