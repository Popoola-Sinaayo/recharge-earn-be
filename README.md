# Recharge and Earn Backend API

A Node.js TypeScript backend API for a recharge and earn platform with wallet functionality, Paystack integration, and third-party data purchase services.

## Features

- ✅ User Authentication (Register & Login)
- ✅ JWT-based Authentication
- ✅ Wallet Management
- ✅ Paystack Payment Integration
- ✅ Webhook Handling for Payment Verification
- ✅ Third-party Data Product Integration
- ✅ Transaction History
- ✅ Clean Architecture (Controller, Repository, Service, Utils)
- ✅ Full TypeScript Support with Type Safety

## Tech Stack

- **Node.js** - Runtime environment
- **TypeScript** - Programming language
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Axios** - HTTP client for third-party APIs
- **Paystack** - Payment gateway

## Project Structure

```
src/
├── config/          # Configuration files (database, etc.)
├── controllers/      # Request handlers
├── middleware/      # Custom middleware (auth, etc.)
├── models/        # Mongoose models
├── repositories/   # Data access layer
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
└── app.ts           # Application entry point
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd recharge-earn-be
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/recharge-earn

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key
PAYSTACK_WEBHOOK_SECRET=your_paystack_webhook_secret

# Data Up API Configuration
DATA_UP_BASE_URL=https://api.dataup.com
DATA_UP_IDENTIFIER=your_identifier
DATA_UP_PASSWORD=your_password

# App URL (for Paystack callbacks)
APP_URL=http://localhost:3000

# SMTP Configuration (for email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=Recharge Earn
```

4. Build the TypeScript project:
```bash
npm run build
```

5. Start the development server (with auto-reload):
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

## API Endpoints

### Authentication

#### Register User (Initiate Registration - Sends OTP)
```
POST /api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {
    "message": "OTP sent to your email. Please verify to complete registration."
  }
}
```

#### Verify OTP and Complete Registration
```
POST /api/users/verify-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered and verified successfully",
  "data": {
    "user": { ... },
    "token": "jwt_token_here"
  }
}
```

#### Resend OTP
```
POST /api/users/resend-otp
Content-Type: application/json

{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

#### Login
```
POST /api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```
GET /api/users/profile
Authorization: Bearer <token>
```

#### Forgot Password (Request Password Reset)
```
POST /api/users/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset OTP has been sent.",
  "data": {}
}
```

#### Reset Password
```
POST /api/users/reset-password
Content-Type: application/json

{
  "email": "john@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": {}
}
```

#### Change Password (Authenticated)
```
POST /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {}
}
```

### Wallet

#### Get Wallet Balance
```
GET /api/wallet/balance
Authorization: Bearer <token>
```

#### Get Wallet Transactions
```
GET /api/wallet/transactions?limit=50&skip=0
Authorization: Bearer <token>
```

### Payments

#### Initialize Payment
```
POST /api/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john@example.com",
  "amount": 5000
}
```

#### Verify Payment
```
GET /api/payments/verify?reference=<payment_reference>
```

#### Paystack Webhook
```
POST /api/payments/webhook
Content-Type: application/json
X-Paystack-Signature: <signature>

[Paystack webhook payload]
```

### Action Routes (Legacy Data Products)

#### Get Product List
```
GET /api/action/products?category=<optional_category>
Authorization: Bearer <token>
```

#### Purchase Data
```
POST /api/action/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_123",
  "phoneNumber": "08012345678",
  "network": "MTN" // optional
}
```

#### Get Purchase History
```
GET /api/action/history?limit=50
Authorization: Bearer <token>
```

### Data Up API Routes

All Data Up routes require authentication (Bearer token). The signin is handled internally using credentials from environment variables.

#### Get Data Plans
```
GET /api/dataup/data
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": "success",
  "message": "Application data retrieved!",
  "data": {
    "data_plans": {
      "MTN": [
        {
          "id": 60,
          "name": "2GB SME2 (30 Days)",
          "atm_price": "1400.00",
          "wallet_price": "1300.00",
          "api_price": "1300.00",
          ...
        }
      ]
    }
  }
}
```

#### Purchase Data
```
POST /api/dataup/data_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "08168880476",
  "plan_id": 38,
  "reference": "ref04"
}
```

#### Purchase Airtime
```
POST /api/dataup/airtime_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "08168670476",
  "amount": 200,
  "network": "MTN",
  "reference": "tranc03"
}
```

#### Verify Meter
```
POST /api/dataup/verify_meter
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": 11,
  "meter_number": "45701597"
}
```

#### Purchase Electricity
```
POST /api/dataup/electric_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "08168670476",
  "plan_id": 11,
  "amount": 5000,
  "meter_number": "8798798789"
}
```

#### Purchase Cable
```
POST /api/dataup/cable_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "smartcard_number": "3232233",
  "plan_id": 2
}
```

#### Get Transaction by Reference
```
GET /api/dataup/transactions/reference/{refId}
Authorization: Bearer <token>
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for JWT tokens | Yes |
| `JWT_EXPIRES_IN` | JWT token expiration | No (default: 7d) |
| `PAYSTACK_SECRET_KEY` | Paystack secret key | Yes |
| `PAYSTACK_PUBLIC_KEY` | Paystack public key | Yes |
| `PAYSTACK_WEBHOOK_SECRET` | Paystack webhook secret | Yes |
| `DATA_UP_BASE_URL` | Data Up API base URL | Yes |
| `DATA_UP_IDENTIFIER` | Data Up identifier (phone number or username) | Yes |
| `DATA_UP_PASSWORD` | Data Up password | Yes |
| `APP_URL` | Application URL for callbacks | Yes |
| `SMTP_HOST` | SMTP server host | Yes |
| `SMTP_PORT` | SMTP server port | Yes |
| `SMTP_SECURE` | Use secure connection (true/false) | No |
| `SMTP_USER` | SMTP username/email | Yes |
| `SMTP_PASS` | SMTP password/app password | Yes |
| `SMTP_FROM_NAME` | Email sender name | No |

## Database Models

### User
- `firstName` - String, required
- `lastName` - String, required
- `email` - String, required, unique
- `password` - String, required (hashed)
- `phone` - String, optional
- `isActive` - Boolean, default: true
- `isEmailVerified` - Boolean, default: false
- `createdAt` - Date
- `updatedAt` - Date

### OTP
- `email` - String, required
- `otp` - String, required (6-digit code)
- `expiresAt` - Date, required (auto-deletes after expiration)
- `isUsed` - Boolean, default: false
- `createdAt` - Date
- `updatedAt` - Date

### PasswordReset
- `email` - String, required
- `token` - String, required (unique reset token)
- `expiresAt` - Date, required (auto-deletes after expiration, 1 hour)
- `isUsed` - Boolean, default: false
- `createdAt` - Date
- `updatedAt` - Date

### Wallet
- `userId` - ObjectId, ref: User, required, unique
- `balance` - Number, default: 0
- `currency` - String, default: 'NGN'
- `createdAt` - Date
- `updatedAt` - Date

### Transaction
- `userId` - ObjectId, ref: User, required
- `walletId` - ObjectId, ref: Wallet, required
- `type` - String, enum: ['credit', 'debit'], required
- `category` - String, enum: ['funding', 'data_purchase', 'refund', 'withdrawal'], required
- `amount` - Number, required
- `balanceBefore` - Number, required
- `balanceAfter` - Number, required
- `status` - String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending'
- `reference` - String, unique
- `paystackReference` - String, optional
- `description` - String, optional
- `metadata` - Mixed, optional
- `createdAt` - Date
- `updatedAt` - Date

## Paystack Integration

### Setting up Webhook

1. Go to your Paystack Dashboard
2. Navigate to Settings > Webhooks
3. Add webhook URL: `https://yourdomain.com/api/payments/webhook`
4. Copy the webhook secret and add it to your `.env` file as `PAYSTACK_WEBHOOK_SECRET`

### Payment Flow

1. User initiates payment via `/api/payments/initialize`
2. User is redirected to Paystack payment page
3. After payment, Paystack sends webhook to `/api/payments/webhook`
4. System verifies webhook signature and processes payment
5. Wallet is credited automatically

## Third-Party API Integration

The third-party API integration is configured to work with the API documented at:
https://documenter.getpostman.com/view/11737658/TzefBPWx#intro

Update the `THIRD_PARTY_API_BASE_URL` and `THIRD_PARTY_API_KEY` in your `.env` file to match your third-party API credentials.

## Error Handling

All API responses follow a consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

## Security Considerations

1. **JWT Tokens**: Store securely and never expose in client-side code
2. **Password Hashing**: All passwords are hashed using bcrypt
3. **Webhook Verification**: Paystack webhooks are verified using HMAC signature
4. **Environment Variables**: Never commit `.env` file to version control
5. **Input Validation**: All inputs are validated using express-validator

## Development

```bash
# Run in development mode with auto-reload (TypeScript)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run in production mode (requires build first)
npm start
```

## Testing

Health check endpoint:
```
GET /health
```

## License

ISC

## Author

Popoola Sinaayo

