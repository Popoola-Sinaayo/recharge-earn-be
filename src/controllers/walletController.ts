import { Request, Response } from 'express';
import * as walletService from "../services/walletService";
import { successResponse, errorResponse } from "../utils/response";

export const getBalance = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }
    const wallet = await walletService.getWalletBalance(req.user._id);
    return successResponse(res, 200, 'Wallet balance retrieved successfully', {
      balance: wallet.balance,
      currency: wallet.currency,
    });
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }
    const limit = parseInt(req.query?.limit as string) || 50;
    const skip = parseInt(req.query?.skip as string) || 0;
    const transactions = await walletService.getWalletTransactions(
      req.user._id,
      limit,
      skip
    );
    return successResponse(
      res,
      200,
      'Transactions retrieved successfully',
      transactions
    );
  } catch (error: any) {
    return errorResponse(res, 500, error.message);
  }
};

