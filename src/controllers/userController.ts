import { Request, Response } from 'express';
import * as userService from "../services/userService";
import * as passwordResetService from "../services/passwordResetService";
import { successResponse, errorResponse } from "../utils/response";

export const register = async (req: Request, res: Response): Promise<Response> => {
  try {
    const result = await userService.initiateRegistration(req.body);
    return successResponse(res, 200, result.message, result);
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return errorResponse(res, 400, 'Email and OTP are required');
    }
   
    const { user, token } = await userService.completeRegistration(
      req.body as any,
      otp
    );
    
    return successResponse(res, 201, 'User registered and verified successfully', {
      user,
      token,
    });
  } catch (error: any) {
    console.error(error);
    return errorResponse(res, 400, error.message);
  }
};

export const resendOtp = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, firstName, lastName, password, phone } = req.body;
    
    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    // For resend, we need at least email, but can accept full user data
    const userData: any = {
      email,
      firstName: firstName || 'User',
      lastName: lastName || 'User',
      password: password || 'temp123456', // Temporary password, will be set during verification
      phone: phone || undefined,
    };

    const result = await userService.initiateRegistration(userData);
    return successResponse(res, 200, result.message, {});
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, password } = req.body;
    const { user, token } = await userService.loginUser(email, password);
    return successResponse(res, 200, 'Login successful', {
      user,
      token,
    });
  } catch (error: any) {
    return errorResponse(res, 401, error.message);
  }
};

export const getProfile = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }
    const user = await userService.getUserProfile(req.user._id);
    return successResponse(res, 200, 'Profile retrieved successfully', user);
  } catch (error: any) {
    return errorResponse(res, 404, error.message);
  }
};

export const requestPasswordReset = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, 400, 'Email is required');
    }

    const result = await passwordResetService.requestPasswordReset(email);
    return successResponse(res, 200, result.message, {});
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return errorResponse(res, 400, 'Email, OTP, and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'Password must be at least 6 characters');
    }

    const result = await passwordResetService.resetPassword(email, otp, newPassword);
    return successResponse(res, 200, result.message, {});
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

export const changePassword = async (req: Request, res: Response): Promise<Response> => {
  try {
    if (!req.user) {
      return errorResponse(res, 401, 'User not authenticated');
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return errorResponse(res, 400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return errorResponse(res, 400, 'New password must be at least 6 characters');
    }

    const result = await userService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    return successResponse(res, 200, result.message, {});
  } catch (error: any) {
    return errorResponse(res, 400, error.message);
  }
};

