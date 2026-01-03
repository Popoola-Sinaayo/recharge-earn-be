import { Request, Response } from 'express';
import { successResponse, errorResponse } from "../utils/response";
import { dataUpRepository } from "../repositories/dataUpRepository";
import * as referralService from "../services/referralService";
import * as walletService from "../services/walletService";

export const getDataPlans = async (
  _req: Request,
  res: Response
): Promise<Response> => {
  try {
    const data = await dataUpRepository.getDataPlans();
    return successResponse(res, 200, "Data plans retrieved successfully", data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseData = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "User not authenticated");
    }

    const { phone_number, plan_id, reference, network } = req.body;

    if (!phone_number || !plan_id || !reference || !network) {
      return errorResponse(
        res,
        400,
        "phone_number, plan_id, reference, and network are required"
      );
    }

    // Get purchase amount from data plans before making purchase
    const dataPlans = await dataUpRepository.getDataPlans();
    let purchaseAmount = 0;
    let planDetails: any = null;

    // Find the plan to get its price
    if (dataPlans) {
      const plan = dataPlans.data.data_plans[network].find(
        (p: any) => p.id === Number(plan_id)
      );
      if (plan) {
        planDetails = plan;
        purchaseAmount = parseFloat(
          plan.api_price || plan.wallet_price || plan.price || "0"
        );
      }
    }

    if (purchaseAmount <= 0) {
      return errorResponse(res, 400, "Invalid plan or plan price not found");
    }

    // Debit wallet before making purchase
    await walletService.debitWallet(
      req.user._id,
      purchaseAmount,
      "data_purchase",
      {
        phone_number,
        plan_id: String(plan_id),
        reference,
        description: `Data purchase: ${
          planDetails?.name || planDetails?.master_name || "Data Plan"
        }`,
        network: planDetails?.network,
      }
    );

    // Make purchase request to Data Up API
    let data;
    try {
      data = await dataUpRepository.purchaseData({
        phone_number,
        plan_id,
        reference,
      });
    } catch (error: any) {
      // If purchase fails, refund the wallet
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "data_purchase",
        reason: "Third-party API purchase failed",
        phone_number,
        plan_id: String(plan_id),
        reference,
        error: error.message,
      });
      throw error;
    }

    // If purchase fails, refund the wallet
    if (data.status !== "success") {
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "data_purchase",
        reason: "Third-party API purchase failed",
        phone_number,
        plan_id: String(plan_id),
        reference,
        thirdPartyResponse: data,
      });
      return errorResponse(res, 400, data.message || "Purchase failed");
    }

    // Process referral reward after successful purchase
    if (purchaseAmount > 0) {
      await referralService.processReferralReward(
        req.user._id,
        purchaseAmount,
        "data",
        {
          phone_number,
          plan_id,
          reference,
        }
      );
    }

    return successResponse(res, 200, "Data purchased successfully", data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseAirtime = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "User not authenticated");
    }

    const { phone_number, amount, network, reference } = req.body;

    if (!phone_number || !amount || !network || !reference) {
      return errorResponse(
        res,
        400,
        "phone_number, amount, network, and reference are required"
      );
    }

    const purchaseAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    if (purchaseAmount <= 0) {
      return errorResponse(res, 400, "Amount must be greater than 0");
    }

    // Debit wallet before making purchase
    await walletService.debitWallet(
      req.user._id,
      purchaseAmount,
      "airtime_purchase",
      {
        phone_number,
        amount: String(amount),
        network,
        reference,
        description: `Airtime purchase: ${network} - ${phone_number}`,
      }
    );

    // Make purchase request to Data Up API
    let data;
    try {
      data = await dataUpRepository.purchaseAirtime({
        phone_number,
        amount,
        network,
        reference,
      });
    } catch (error: any) {
      // If purchase fails, refund the wallet
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "airtime_purchase",
        reason: "Third-party API purchase failed",
        phone_number,
        network,
        reference,
        error: error.message,
      });
      throw error;
    }

    // If purchase fails, refund the wallet
    if (data.status !== "success") {
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "airtime_purchase",
        reason: "Third-party API purchase failed",
        phone_number,
        network,
        reference,
        thirdPartyResponse: data,
      });
      return errorResponse(res, 400, data.message || "Purchase failed");
    }

    // Process referral reward after successful purchase
    if (purchaseAmount > 0) {
      await referralService.processReferralReward(
        req.user._id,
        purchaseAmount,
        "airtime",
        {
          phone_number,
          network,
          reference,
        }
      );
    }

    return successResponse(res, 200, "Airtime purchased successfully", data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const verifyMeter = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { plan_id, meter_number } = req.body;

    if (!plan_id || !meter_number) {
      return errorResponse(res, 400, "plan_id and meter_number are required");
    }

    const data = await dataUpRepository.verifyMeter({
      plan_id,
      meter_number,
    });

    return successResponse(res, 200, "Meter verified successfully", data);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseElectricity = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "User not authenticated");
    }

    const { phone_number, plan_id, amount, meter_number } = req.body;

    if (!phone_number || !plan_id || !amount || !meter_number) {
      return errorResponse(
        res,
        400,
        "phone_number, plan_id, amount, and meter_number are required"
      );
    }

    const purchaseAmount =
      typeof amount === "string" ? parseFloat(amount) : amount;

    if (purchaseAmount <= 0) {
      return errorResponse(res, 400, "Amount must be greater than 0");
    }

    // Debit wallet before making purchase
    const { transaction } = await walletService.debitWallet(
      req.user._id,
      purchaseAmount,
      "electricity_purchase",
      {
        phone_number,
        plan_id: String(plan_id),
        amount: String(amount),
        meter_number,
        description: `Electricity purchase: Meter ${meter_number}`,
      }
    );

    // Make purchase request to Data Up API
    let data;
    try {
      data = await dataUpRepository.purchaseElectricity({
        phone_number,
        plan_id,
        amount,
        meter_number,
      });
    } catch (error: any) {
      // If purchase fails, refund the wallet
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "electricity_purchase",
        reason: "Third-party API purchase failed",
        phone_number,
        plan_id: String(plan_id),
        meter_number,
        error: error.message,
      });
      throw error;
    }

    // If purchase fails, refund the wallet
    if (data.status !== "success") {
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "electricity_purchase",
        reason: "Third-party API purchase failed",
        phone_number,
        plan_id: String(plan_id),
        meter_number,
        thirdPartyResponse: data,
      });
      return errorResponse(res, 400, data.message || "Purchase failed");
    }

    // Extract token from response if available
    const token = data.data?.token || data.token || null;

    // Update transaction with token if available
    if (token && transaction) {
      const Transaction = (await import("../models/Transaction")).default;
      await Transaction.findByIdAndUpdate(transaction._id, { token });
    }

    // Process referral reward after successful purchase
    if (purchaseAmount > 0) {
      await referralService.processReferralReward(
        req.user._id,
        purchaseAmount,
        "electricity",
        {
          phone_number,
          plan_id,
          meter_number,
        }
      );
    }

    // Include token in response
    const responseData = {
      ...data,
      token: token || undefined,
    };

    return successResponse(
      res,
      200,
      "Electricity purchased successfully",
      responseData
    );
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const purchaseCable = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, "User not authenticated");
    }

    const { smartcard_number, plan_id } = req.body;

    if (!smartcard_number || !plan_id) {
      return errorResponse(
        res,
        400,
        "smartcard_number and plan_id are required"
      );
    }

    // Get purchase amount from data plans before making purchase
    const dataPlans = await dataUpRepository.getDataPlans();
    let purchaseAmount = 0;
    let planDetails: any = null;

    // Find the plan to get its price (cable plans might be in a different structure)
    if (dataPlans.data?.data_plans) {
      for (const network in dataPlans.data.data_plans) {
        const plan = dataPlans.data.data_plans[network].find(
          (p: any) => p.id === Number(plan_id)
        );
        if (plan) {
          planDetails = plan;
          purchaseAmount = parseFloat(
            plan.api_price || plan.wallet_price || plan.price || "0"
          );
          break;
        }
      }
    }

    if (purchaseAmount <= 0) {
      return errorResponse(res, 400, "Invalid plan or plan price not found");
    }

    // Debit wallet before making purchase
    await walletService.debitWallet(
      req.user._id,
      purchaseAmount,
      "cable_purchase",
      {
        smartcard_number,
        plan_id: String(plan_id),
        description: `Cable subscription purchase: ${
          planDetails?.name || planDetails?.master_name || "Cable Plan"
        }`,
      }
    );

    // Make purchase request to Data Up API
    let data;
    try {
      data = await dataUpRepository.purchaseCable({
        smartcard_number,
        plan_id,
      });
    } catch (error: any) {
      // If purchase fails, refund the wallet
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "cable_purchase",
        reason: "Third-party API purchase failed",
        smartcard_number,
        plan_id: String(plan_id),
        error: error.message,
      });
      throw error;
    }

    // If purchase fails, refund the wallet
    if (data.status !== "success") {
      await walletService.creditWallet(req.user._id, purchaseAmount, "refund", {
        originalTransaction: "cable_purchase",
        reason: "Third-party API purchase failed",
        smartcard_number,
        plan_id: String(plan_id),
        thirdPartyResponse: data,
      });
      return errorResponse(res, 400, data.message || "Purchase failed");
    }

    // Process referral reward after successful purchase
    if (purchaseAmount > 0) {
      await referralService.processReferralReward(
        req.user._id,
        purchaseAmount,
        "cable",
        {
          smartcard_number,
          plan_id,
        }
      );
    }

    return successResponse(
      res,
      200,
      "Cable subscription purchased successfully",
      data
    );
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

