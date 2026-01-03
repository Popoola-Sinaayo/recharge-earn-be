import { Request, Response } from 'express';
import { successResponse, errorResponse } from '../utils/response.js';
import { dataUpRepository } from '../repositories/dataUpRepository.js';

export const getDataPlans = async (req: Request, res: Response): Promise<Response> => {
  try {
    const data = await dataUpRepository.getDataPlans();
    return successResponse(res, 200, 'Data plans retrieved successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseData = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { phone_number, plan_id, reference } = req.body;

    if (!phone_number || !plan_id || !reference) {
      return errorResponse(res, 400, 'phone_number, plan_id, and reference are required');
    }

    const data = await dataUpRepository.purchaseData({
      phone_number,
      plan_id,
      reference,
    });

    return successResponse(res, 200, 'Data purchased successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseAirtime = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { phone_number, amount, network, reference } = req.body;

    if (!phone_number || !amount || !network || !reference) {
      return errorResponse(
        res,
        400,
        'phone_number, amount, network, and reference are required'
      );
    }

    const data = await dataUpRepository.purchaseAirtime({
      phone_number,
      amount,
      network,
      reference,
    });

    return successResponse(res, 200, 'Airtime purchased successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const verifyMeter = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { plan_id, meter_number } = req.body;

    if (!plan_id || !meter_number) {
      return errorResponse(res, 400, 'plan_id and meter_number are required');
    }

    const data = await dataUpRepository.verifyMeter({
      plan_id,
      meter_number,
    });

    return successResponse(res, 200, 'Meter verified successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseElectricity = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { phone_number, plan_id, amount, meter_number } = req.body;

    if (!phone_number || !plan_id || !amount || !meter_number) {
      return errorResponse(
        res,
        400,
        'phone_number, plan_id, amount, and meter_number are required'
      );
    }

    const data = await dataUpRepository.purchaseElectricity({
      phone_number,
      plan_id,
      amount,
      meter_number,
    });

    return successResponse(res, 200, 'Electricity purchased successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseCable = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { smartcard_number, plan_id } = req.body;

    if (!smartcard_number || !plan_id) {
      return errorResponse(res, 400, 'smartcard_number and plan_id are required');
    }

    const data = await dataUpRepository.purchaseCable({
      smartcard_number,
      plan_id,
    });

    return successResponse(res, 200, 'Cable subscription purchased successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const getTransactionByReference = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { refId } = req.params;

    if (!refId) {
      return errorResponse(res, 400, 'Reference ID is required');
    }

    const data = await dataUpRepository.getTransactionByReference(refId);

    return successResponse(res, 200, 'Transaction retrieved successfully', data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

