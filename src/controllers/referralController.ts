import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response';
import * as referralService from '../services/referralService';

export const getReferralCode = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    const stats = await referralService.getReferralStats(req.user._id);

    return successResponse(res, 200, 'Referral code retrieved successfully', {
      referralCode: stats.referralCode,
    });
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const getReferralStats = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    const stats = await referralService.getReferralStats(req.user._id);

    return successResponse(res, 200, 'Referral statistics retrieved successfully', stats);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

