import { Types } from 'mongoose';
import * as walletService from './walletService';
import * as referralService from "./referralService";
import { dataUpClient } from '../request/dataUpClient';

interface Product {
  id?: string;
  product_id?: string;
  name?: string;
  product_name?: string;
  price?: number;
  amount?: number;
  network?: string;
  [key: string]: any;
}

interface ProductListResponse {
  status?: boolean;
  data: Product[] | Product;
  [key: string]: any;
}

interface PurchaseResponse {
  status: string;
  message?: string;
  data?: any;
  [key: string]: any;
}

// Get product list from Data Up API
export const getProductList = async (category: string | null = null): Promise<ProductListResponse> => {
  try {
    let url = '/products';
    if (category) {
      url += `?category=${category}`;
    }

    const response = await dataUpClient.get<ProductListResponse>(url);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.message || 'Failed to fetch product list'
    );
  }
};

// Purchase data from Data Up API
export const purchaseData = async (
  userId: Types.ObjectId | string,
  productId: string,
  phoneNumber: string,
  network: string | null = null
): Promise<{ success: boolean; data: any; amount: number }> => {
  try {
    // First, get product details to know the price
    const products = await getProductList();
    const productList = Array.isArray(products.data)
      ? products.data
      : [products.data];
    const product = productList.find(
      (p: Product) => p.id === productId || p.product_id === productId
    );

    if (!product) {
      throw new Error("Product not found");
    }

    const amount = product.price || product.amount || 0;

    // Check wallet balance and debit
    await walletService.debitWallet(userId, amount, "data_purchase", {
      productId,
      phoneNumber,
      network: network || product.network,
      description: `Data purchase: ${product.name || product.product_name}`,
    });

    // Make purchase request to Data Up API
    const purchaseData = {
      product_id: productId,
      phone: phoneNumber,
      ...(network && { network }),
    };

    const response = await dataUpClient.post<PurchaseResponse>(
      "/purchase",
      purchaseData
    );

    // If purchase fails, refund the wallet
    if (!response.data.status || response.data.status !== "success") {
      // Refund the amount
      await walletService.creditWallet(userId, amount, "refund", {
        originalTransaction: "data_purchase",
        reason: "Third-party API purchase failed",
        thirdPartyResponse: response.data,
      });
      throw new Error(response.data.message || "Purchase failed");
    }

    // Process referral reward after successful purchase
    await referralService.processReferralReward(userId, amount, "data", {
      productId,
      phoneNumber,
      network: network || product.network,
      reference: response.data.data?.reference || response.data.reference,
    });

    return {
      success: true,
      data: response.data,
      amount,
    };
  } catch (error: any) {
    // If it's a wallet error, don't try to refund
    if (error.message.includes('Insufficient') || error.message.includes('Wallet')) {
      throw error;
    }

    // For other errors, attempt refund if debit was successful
    // Note: In production, you might want to track if debit was successful
    // before attempting refund to avoid double crediting

    throw new Error(error.message || 'Failed to purchase data');
  }
};

// Get data purchase history (optional - if Data Up API supports it)
export const getPurchaseHistory = async (
  userId: Types.ObjectId | string,
  limit: number = 50
): Promise<any> => {
  try {
    const response = await dataUpClient.get(
      `/transactions?user_id=${userId}&limit=${limit}`
    );

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.message || 'Failed to fetch purchase history'
    );
  }
};

