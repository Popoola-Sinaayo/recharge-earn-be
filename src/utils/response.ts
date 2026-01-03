import { Response } from 'express';

export const successResponse = (
  res: Response,
  statusCode: number,
  message: string,
  data: any = null
): Response => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (
  res: Response,
  statusCode: number,
  message: string,
  errors: any = null
): Response => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

