import axios, { AxiosInstance } from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Create axios instance for Data Up API
const createDataUpClient = (): AxiosInstance => {
  const baseURL = process.env.DATA_UP_BASE_URL;

  if (!baseURL) {
    throw new Error('DATA_UP_BASE_URL is not defined in environment variables');
  }

  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  
  return client;
};

// Export singleton instance
export const dataUpClient = createDataUpClient();

export default dataUpClient;

