import crypto from 'crypto';

export const generateReference = (prefix: string = 'REF'): string => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${timestamp}-${randomString}`;
};

