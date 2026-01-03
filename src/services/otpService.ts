import crypto from 'crypto';
import Otp from '../models/Otp';
import { sendOtpEmail } from './emailService';

// Generate a 6-digit OTP
export const generateOtp = (): string => {
  return crypto.randomInt(100000, 999999).toString();
};

// Create and send OTP
export const createAndSendOtp = async (email: string): Promise<string> => {
  // Delete any existing unused OTPs for this email
  await Otp.deleteMany({ email, isUsed: false });

  // Generate new OTP
  const otp = generateOtp();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

  // Save OTP to database
  const otpRecord = new Otp({
    email,
    otp,
    expiresAt,
    isUsed: false,
  });

  await otpRecord.save();

  // Send OTP via email
  try {
    await sendOtpEmail(email, otp);
  } catch (error) {
    // If email fails, delete the OTP record
    await Otp.deleteOne({ _id: otpRecord._id });
    throw new Error('Failed to send OTP email. Please try again.');
  }

  return otp;
};

// Verify OTP
export const verifyOtp = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await Otp.findOne({
    email: email.toLowerCase(),
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() }, // OTP not expired
  });

  if (!otpRecord) {
    return false;
  }

  // Mark OTP as used
  otpRecord.isUsed = true;
  await otpRecord.save();

  return true;
};

// Check if OTP exists and is valid (without marking as used)
export const checkOtp = async (email: string, otp: string): Promise<boolean> => {
  const otpRecord = await Otp.findOne({
    email: email.toLowerCase(),
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });

  return !!otpRecord;
};

// Create and send OTP for password reset (returns OTP without sending email)
export const createAndSendPasswordResetOtp = async (email: string): Promise<string> => {
  // Delete any existing unused OTPs for this email
  await Otp.deleteMany({ email: email.toLowerCase(), isUsed: false });

  // Generate new OTP
  const otp = generateOtp();
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

  // Save OTP to database
  const otpRecord = new Otp({
    email: email.toLowerCase(),
    otp,
    expiresAt,
    isUsed: false,
  });

  await otpRecord.save();

  return otp;
};

