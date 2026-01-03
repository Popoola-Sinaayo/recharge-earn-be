import crypto from 'crypto';

/**
 * Generate a unique 6-character alphanumeric referral code
 * Format: 3 uppercase letters + 3 numbers (e.g., ABC123)
 */
export const generateReferralCode = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  // Generate 3 random letters
  let code = '';
  for (let i = 0; i < 3; i++) {
    code += letters[crypto.randomInt(0, letters.length)];
  }
  
  // Generate 3 random numbers
  for (let i = 0; i < 3; i++) {
    code += numbers[crypto.randomInt(0, numbers.length)];
  }
  
  return code;
};

/**
 * Validate referral code format (6 alphanumeric characters)
 */
export const isValidReferralCode = (code: string): boolean => {
  return /^[A-Z0-9]{6}$/.test(code.toUpperCase());
};

