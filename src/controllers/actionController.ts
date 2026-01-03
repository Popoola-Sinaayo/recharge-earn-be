import { Request, Response } from 'express';
import * as dataService from "../services/dataService";
import { successResponse, errorResponse } from "../utils/response";

export const getProductList = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { category } = req.query;
    const products = await dataService.getProductList(
      category ? (category as string) : null
    );
    return successResponse(
      res,
      200,
      'Products retrieved successfully',
      products
    );
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseData = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }
    const { productId, phoneNumber, network } = req.body;
    const userId = req.user._id;

    if (!productId || !phoneNumber) {
      return errorResponse(
        res,
        400,
        'Product ID and phone number are required'
      );
    }

    const result = await dataService.purchaseData(
      userId,
      productId,
      phoneNumber,
      network || null
    );

    return successResponse(res, 200, 'Data purchased successfully', result);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const getPurchaseHistory = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }
    const limit = parseInt(req.query?.limit as string) || 50;
    const history = await dataService.getPurchaseHistory(req.user._id, limit);
    return successResponse(
      res,
      200,
      'Purchase history retrieved successfully',
      history
    );
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

