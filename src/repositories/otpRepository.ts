import Otp, {IOtp} from '../models/Otp';

export const createOtp = async (otpData: {
  email: string;
  otp: string;
  expiresAt: Date;
}): Promise<IOtp> => {
  const otp = new Otp(otpData);
  return await otp.save();
};

export const findOtpByEmailAndCode = async (
  email: string,
  otp: string
): Promise<IOtp | null> => {
  return await Otp.findOne({
    email: email.toLowerCase(),
    otp,
    isUsed: false,
    expiresAt: { $gt: new Date() },
  });
};

export const markOtpAsUsed = async (otpId: string): Promise<void> => {
  await Otp.findByIdAndUpdate(otpId, { isUsed: true });
};

export const deleteUnusedOtpsByEmail = async (email: string): Promise<void> => {
  await Otp.deleteMany({ email: email.toLowerCase(), isUsed: false });
};

