import jwt from 'jsonwebtoken';
import { Types } from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  userId: string | Types.ObjectId;
}

export const generateToken = (userId: Types.ObjectId | string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' as any,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
};

