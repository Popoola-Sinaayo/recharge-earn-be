import nodemailer from 'nodemailer';
import { renderTemplate } from "../utils/templateEngine";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error('SMTP credentials are not configured');
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `EvergreeneSoftware <hello@evergreenesoftware.com>`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error: any) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send email');
  }
};

export const sendOtpEmail = async (email: string, otp: string): Promise<void> => {
  const html = renderTemplate('otp', {
    OTP: otp,
    YEAR: new Date().getFullYear().toString(),
  });

  await sendEmail({
    to: email,
    subject: 'Email Verification OTP - Recharge Earn',
    html,
  });
};

export const sendWelcomeEmail = async (email: string, firstName: string): Promise<void> => {
  const html = renderTemplate('welcome', {
    FIRST_NAME: firstName,
    YEAR: new Date().getFullYear().toString(),
  });

  await sendEmail({
    to: email,
    subject: 'Welcome to Recharge Earn!',
    html,
  });
};

export const sendPasswordResetOtpEmail = async (
  email: string,
  firstName: string,
  otp: string
): Promise<void> => {
  const html = renderTemplate('password-reset', {
    FIRST_NAME: firstName,
    OTP: otp,
    YEAR: new Date().getFullYear().toString(),
  });

  await sendEmail({
    to: email,
    subject: 'Password Reset OTP - Recharge Earn',
    html,
  });
};

