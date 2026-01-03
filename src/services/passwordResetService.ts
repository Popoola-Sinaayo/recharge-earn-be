import * as userRepository from '../repositories/userRepository.js';
import * as otpService from './otpService.js';
import { sendPasswordResetOtpEmail } from './emailService.js';

// Request password reset - send OTP
export const requestPasswordReset = async (email: string): Promise<{ message: string }> => {
  // Check if user exists
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    // Don't reveal if user exists or not for security
    return { message: 'If an account with that email exists, a password reset OTP has been sent.' };
  }

  // Create OTP for password reset (without sending email)
  const otp = await otpService.createAndSendPasswordResetOtp(email);

  // Send password reset OTP email with custom template
  try {
    await sendPasswordResetOtpEmail(email, user.firstName, otp);
  } catch (error) {
    // If email fails, delete the OTP record
    const Otp = (await import('../models/Otp.js')).default;
    await Otp.deleteMany({ email: email.toLowerCase(), otp, isUsed: false });
    throw new Error('Failed to send password reset OTP email. Please try again.');
  }

  return { message: 'If an account with that email exists, a password reset OTP has been sent.' };
};

// Reset password using OTP
export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
): Promise<{ message: string }> => {
  // Verify OTP
  const isOtpValid = await otpService.verifyOtp(email, otp);
  if (!isOtpValid) {
    throw new Error('Invalid or expired OTP');
  }

  // Find user by email
  const user = await userRepository.findUserByEmail(email);
  if (!user) {
    throw new Error('User not found');
  }

  // Update user password (Mongoose will hash it automatically)
  await userRepository.updateUser(user._id, {
    password: newPassword,
  });

  return { message: 'Password has been reset successfully' };
};

