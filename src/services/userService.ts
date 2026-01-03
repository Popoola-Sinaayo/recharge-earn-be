import { Types } from 'mongoose';
import * as userRepository from '../repositories/userRepository';
import * as walletRepository from '../repositories/walletRepository';
import * as otpService from './otpService';
import { generateToken } from '../utils/jwt';
import { RegisterUserData, AuthResponse, IUser } from '../types/index';

// Initiate registration - send OTP
export const initiateRegistration = async (userData: RegisterUserData): Promise<{ message: string }> => {
  // Check if user already exists
  const existingUser = await userRepository.findUserByEmail(userData.email);
  if (existingUser) {
    if (existingUser.isEmailVerified) {
      throw new Error('User with this email already exists');
    } else {
      // If user exists but email not verified, allow resending OTP
      // User will be updated during verification
      
    }
  }

  // Send OTP to email
  await otpService.createAndSendOtp(userData.email);

  return { message: 'OTP sent to your email. Please verify to complete registration.' };
};

// Complete registration after OTP verification
export const completeRegistration = async (
  userData: RegisterUserData,
  otp: string
): Promise<AuthResponse> => {
  // Verify OTP
  const isOtpValid = await otpService.verifyOtp(userData.email, otp);
  if (!isOtpValid) {
    throw new Error('Invalid or expired OTP');
  }

  // Check if user already exists (unverified)
  let user = await userRepository.findUserByEmail(userData.email);
  
  if (user && !user.isEmailVerified) {
    // Update existing unverified user
    user = await userRepository.updateUser(user._id, {
      firstName: userData.firstName,
      lastName: userData.lastName,
      password: userData.password,
      phone: userData.phone,
      isEmailVerified: true,
      isActive: true,
    });
    if (!user) {
      throw new Error('Failed to update user');
    }
  } else if (!user) {
    // Create new user
    user = await userRepository.createUser(userData);
    // Update to set email as verified
    user = await userRepository.updateUser(user._id, {
      isEmailVerified: true,
    });
    if (!user) {
      throw new Error('Failed to create user');
    }
  } else {
    throw new Error('User with this email already exists');
  }

  // Create wallet for user (if it doesn't exist)
  const existingWallet = await walletRepository.findWalletByUserId(user._id);
  if (!existingWallet) {
    await walletRepository.createWallet({
      userId: user._id,
      balance: 0,
      currency: 'NGN',
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from user object
  const userResponse = user.toObject() as any;
  delete userResponse.password;

  return { user: userResponse as Omit<IUser, 'password'>, token };
};


export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  const user = await userRepository.findUserByEmail(email);

  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    throw new Error('Account is inactive');
  }

  if (!user.isEmailVerified) {
    throw new Error('Please verify your email before logging in');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password');
  }

  // Generate token
  const token = generateToken(user._id);

  // Remove password from user object
  const userResponse = user.toObject() as any;
  delete userResponse.password;

  return { user: userResponse as Omit<IUser, 'password'>, token };
};

export const getUserProfile = async (userId: Types.ObjectId | string): Promise<IUser> => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

export const changePassword = async (
  userId: Types.ObjectId | string,
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const user = await userRepository.findUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Verify current password
  const userWithPassword = await userRepository.findUserByEmail(user.email);
  if (!userWithPassword) {
    throw new Error('User not found');
  }

  const isPasswordValid = await userWithPassword.comparePassword(currentPassword);
  if (!isPasswordValid) {
    throw new Error('Current password is incorrect');
  }

  // Update password (Mongoose will hash it automatically)
  await userRepository.updateUser(userId, {
    password: newPassword,
  });

  return { message: 'Password changed successfully' };
};

