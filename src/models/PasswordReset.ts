import mongoose, { Schema, Model } from 'mongoose';

export interface IPasswordReset extends mongoose.Document {
  email: string;
  token: string;
  expiresAt: Date;
  isUsed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetSchema = new Schema<IPasswordReset>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expireAfterSeconds: 0 }, // Auto-delete expired tokens
    },
    isUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster lookups
passwordResetSchema.index({ email: 1, isUsed: 1 });
passwordResetSchema.index({ token: 1 });

const PasswordReset: Model<IPasswordReset> = mongoose.model<IPasswordReset>(
  'PasswordReset',
  passwordResetSchema
);

export default PasswordReset;

