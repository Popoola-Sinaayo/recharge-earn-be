import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';
dotenv.config();

interface SignInResponse {
  status: string;
  message?: string;
  data?: {
    token?: string;
    access_token?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface DataPlansResponse {
  status: string;
  message?: string;
  data?: {
    data_plans?: {
      [network: string]: Array<{
        id: number;
        name: string;
        atm_price: string;
        wallet_price: string;
        api_price: string;
        status: number;
        airtime_value: string;
        mb_value: string;
        price: string;
        type: number;
        message: string;
        master_name: string;
        master_status: number;
        master_message: string;
        network: string;
      }>;
    };
    [key: string]: any;
  };
  [key: string]: any;
}

interface PurchaseResponse {
  status: string;
  message?: string;
  data?: any;
  [key: string]: any;
}

interface TransactionResponse {
  status: string;
  message?: string;
  data?: any;
  [key: string]: any;
}

class DataUpRepository {
  private client: AxiosInstance;
  private token: string | null = null;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.DATA_UP_BASE_URL || '';
    
    if (!this.baseURL) {
      throw new Error('DATA_UP_BASE_URL is not defined in environment variables');
    }

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json',
      },
    });

    // Request interceptor to add token
    this.client.interceptors.request.use(
      (config) => {
        if (this.token && config.url !== '/signin') {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Sign in and get token
  async signIn(): Promise<string> {
    const identifier = process.env.DATA_UP_IDENTIFIER;
    const password = process.env.DATA_UP_PASSWORD;

    if (!identifier || !password) {
      throw new Error('DATA_UP_IDENTIFIER and DATA_UP_PASSWORD must be set in environment variables');
    }

    try {
      const params = new URLSearchParams();
      params.append('identifier', identifier);
      params.append('password', password);

      const response = await this.client.post<SignInResponse>('/signin', params.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
        console.log(response?.data)
      const token = response.data.token
      if (!token) {
        throw new Error('Token not found in signin response');
      }

      this.token = token;
      return token;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to sign in to Data Up API'
      );
    }
  }

  // Ensure we have a valid token
  private async ensureToken(): Promise<void> {
    if (!this.token) {
      await this.signIn();
    }
  }

  // Get data plans
  async getDataPlans(): Promise<any> {
    await this.ensureToken();
    try {
      const response = await this.client.get<DataPlansResponse>('/data');
      return response.data.data?.data_plans || [];
    } catch (error: any) {
      // If token expired, try to re-authenticate
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const retryResponse = await this.client.get<DataPlansResponse>('/data');
        return retryResponse.data.data?.data_plans || [];
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch data plans'
      );
    }
  }

  // Purchase data
  async purchaseData(data: {
    phone_number: string;
    plan_id: string | number;
    reference: string;
  }): Promise<PurchaseResponse> {
    await this.ensureToken();

    try {
      const params = new URLSearchParams();
      params.append('phone_number', data.phone_number);
      params.append('plan_id', String(data.plan_id));
      params.append('reference', data.reference);

      const response = await this.client.post<PurchaseResponse>(
        '/data_purchase',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const params = new URLSearchParams();
        params.append('phone_number', data.phone_number);
        params.append('plan_id', String(data.plan_id));
        params.append('reference', data.reference);
        const retryResponse = await this.client.post<PurchaseResponse>(
          '/data_purchase',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return retryResponse.data;
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to purchase data'
      );
    }
  }

  // Purchase airtime
  async purchaseAirtime(data: {
    phone_number: string;
    amount: string | number;
    network: string;
    reference: string;
  }): Promise<PurchaseResponse> {
    await this.ensureToken();

    try {
      const params = new URLSearchParams();
      params.append('phone_number', data.phone_number);
      params.append('amount', String(data.amount));
      params.append('network', data.network);
      params.append('reference', data.reference);

      const response = await this.client.post<PurchaseResponse>(
        '/airtime_purchase',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const params = new URLSearchParams();
        params.append('phone_number', data.phone_number);
        params.append('amount', String(data.amount));
        params.append('network', data.network);
        params.append('reference', data.reference);
        const retryResponse = await this.client.post<PurchaseResponse>(
          '/airtime_purchase',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return retryResponse.data;
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to purchase airtime'
      );
    }
  }

  // Verify meter
  async verifyMeter(data: {
    plan_id: string | number;
    meter_number: string;
  }): Promise<PurchaseResponse> {
    await this.ensureToken();

    try {
      const params = new URLSearchParams();
      params.append('plan_id', String(data.plan_id));
      params.append('meter_number', data.meter_number);

      const response = await this.client.post<PurchaseResponse>(
        '/verify_meter',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const params = new URLSearchParams();
        params.append('plan_id', String(data.plan_id));
        params.append('meter_number', data.meter_number);
        const retryResponse = await this.client.post<PurchaseResponse>(
          '/verify_meter',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return retryResponse.data;
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to verify meter'
      );
    }
  }

  // Purchase electricity
  async purchaseElectricity(data: {
    phone_number: string;
    plan_id: string | number;
    amount: string | number;
    meter_number: string;
  }): Promise<PurchaseResponse> {
    await this.ensureToken();

    try {
      const params = new URLSearchParams();
      params.append('phone_number', data.phone_number);
      params.append('plan_id', String(data.plan_id));
      params.append('amount', String(data.amount));
      params.append('meter_number', data.meter_number);

      const response = await this.client.post<PurchaseResponse>(
        '/electric_purchase',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const params = new URLSearchParams();
        params.append('phone_number', data.phone_number);
        params.append('plan_id', String(data.plan_id));
        params.append('amount', String(data.amount));
        params.append('meter_number', data.meter_number);
        const retryResponse = await this.client.post<PurchaseResponse>(
          '/electric_purchase',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return retryResponse.data;
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to purchase electricity'
      );
    }
  }

  // Purchase cable
  async purchaseCable(data: {
    smartcard_number: string;
    plan_id: string | number;
  }): Promise<PurchaseResponse> {
    await this.ensureToken();

    try {
      const params = new URLSearchParams();
      params.append('smartcard_number', data.smartcard_number);
      params.append('plan_id', String(data.plan_id));

      const response = await this.client.post<PurchaseResponse>(
        '/cable_purchase',
        params.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const params = new URLSearchParams();
        params.append('smartcard_number', data.smartcard_number);
        params.append('plan_id', String(data.plan_id));
        const retryResponse = await this.client.post<PurchaseResponse>(
          '/cable_purchase',
          params.toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          }
        );
        return retryResponse.data;
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to purchase cable'
      );
    }
  }

  // Get transaction by reference
  async getTransactionByReference(refId: string): Promise<TransactionResponse> {
    await this.ensureToken();

    try {
      const response = await this.client.get<TransactionResponse>(
        `/transactions/reference/${refId}`
      );

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        this.token = null;
        await this.ensureToken();
        const retryResponse = await this.client.get<TransactionResponse>(
          `/transactions/reference/${refId}`
        );
        return retryResponse.data;
      }
      throw new Error(
        error.response?.data?.message || error.message || 'Failed to fetch transaction'
      );
    }
  }
}

// Export singleton instance
export const dataUpRepository = new DataUpRepository();

export default dataUpRepository;

