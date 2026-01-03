# Referral System API Documentation

## Overview

The referral system allows users to refer others and earn rewards when their referrals make purchases. Users receive a 1% reward of the purchase amount when someone they referred buys data, airtime, cable, or electricity.

## Features

- **Referral Code**: Each user gets a unique 6-character alphanumeric referral code (e.g., ABC123)
- **Referral Rewards**: Referrers earn 1% of purchase amounts when their referrals make purchases
- **Automatic Processing**: Rewards are automatically credited to the referrer's wallet
- **Transaction Tracking**: All referral rewards are recorded in transactions

---

## Base URL

All endpoints use the base URL: `http://localhost:3000/api/v1` (or your production URL)

---

## Authentication

All referral endpoints require authentication via Bearer token:

```
Authorization: Bearer <your_jwt_token>
```

---

## Referral Endpoints

### GET /api/v1/referrals/code

Get the authenticated user's referral code.

**Request:**
```
GET /api/v1/referrals/code
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Referral code retrieved successfully",
  "data": {
    "referralCode": "ABC123"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

---

### GET /api/v1/referrals/stats

Get referral statistics for the authenticated user.

**Request:**
```
GET /api/v1/referrals/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Referral statistics retrieved successfully",
  "data": {
    "referralCode": "ABC123",
    "totalReferrals": 5,
    "totalRewards": 125.50
  }
}
```

**Response Fields:**
- `referralCode` (string): User's unique referral code
- `totalReferrals` (number): Total number of users referred
- `totalRewards` (number): Total referral rewards earned (in NGN)

**Error Response (401):**
```json
{
  "success": false,
  "message": "User not authenticated"
}
```

---

## User Registration with Referral Code

### POST /api/v1/users/register

Register a new user. Optionally include a referral code.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "referralCode": "ABC123"
}
```

**Note:** The `referralCode` field is optional. If provided, it must be a valid 6-character alphanumeric code.

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

---

### POST /api/v1/users/verify-otp

Complete registration with OTP verification. Include referral code if provided during registration.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "phone": "08012345678",
  "referralCode": "ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered and verified successfully",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "08012345678",
      "referralCode": "XYZ789",
      "referredBy": "65a1b2c3d4e5f6g7h8i9j0k2",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**Invalid Referral Code (400):**
```json
{
  "success": false,
  "message": "Invalid referral code"
}
```

**Self-Referral (400):**
```json
{
  "success": false,
  "message": "You cannot use your own referral code"
}
```

---

## How Referral Rewards Work

### Automatic Reward Processing

When a user who was referred makes a purchase, the referral reward is automatically processed:

1. **Purchase Made**: Referred user purchases data, airtime, cable, or electricity
2. **Reward Calculation**: System calculates 1% of the purchase amount
3. **Wallet Credit**: Referrer's wallet is automatically credited
4. **Transaction Record**: A transaction is created with category `referral_reward`

### Purchase Types That Trigger Rewards

- **Data Purchase**: `/api/v1/action/purchase` or `/api/v1/utilities/data_purchase`
- **Airtime Purchase**: `/api/v1/utilities/airtime_purchase`
- **Cable Purchase**: `/api/v1/utilities/cable_purchase`
- **Electricity Purchase**: `/api/v1/utilities/electric_purchase`

### Reward Calculation Example

If a referred user purchases:
- **Data**: ₦1,000 → Referrer gets ₦10 (1%)
- **Airtime**: ₦500 → Referrer gets ₦5 (1%)
- **Electricity**: ₦5,000 → Referrer gets ₦50 (1%)
- **Cable**: ₦2,000 → Referrer gets ₦20 (1%)

### Transaction Details

Referral rewards are recorded in transactions with:
- **Type**: `credit`
- **Category**: `referral_reward`
- **Description**: "Referral reward from [purchase_type] purchase"
- **Metadata**: Includes details about the purchase and referred user

**Example Transaction:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
  "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
  "walletId": "65a1b2c3d4e5f6g7h8i9j0k4",
  "type": "credit",
  "category": "referral_reward",
  "amount": 10.00,
  "balanceBefore": 100.00,
  "balanceAfter": 110.00,
  "status": "completed",
  "reference": "CR-1705312200000-ABCD",
  "description": "Referral reward from data purchase",
  "metadata": {
    "referredUserId": "65a1b2c3d4e5f6g7h8i9j0k1",
    "referredUserEmail": "john@example.com",
    "purchaseAmount": 1000,
    "purchaseType": "data",
    "rewardAmount": 10.00,
    "phone_number": "08012345678",
    "plan_id": "38"
  },
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

## Referral Code Format

- **Length**: 6 characters
- **Format**: 3 uppercase letters + 3 numbers (e.g., ABC123, XYZ789)
- **Case**: Automatically converted to uppercase
- **Uniqueness**: Each user gets a unique code

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request (invalid referral code, validation errors) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Error Responses

### Invalid Referral Code Format (400)
```json
{
  "success": false,
  "message": "Invalid referral code format"
}
```

### Referral Code Not Found (400)
```json
{
  "success": false,
  "message": "Invalid referral code"
}
```

### Self-Referral Attempt (400)
```json
{
  "success": false,
  "message": "You cannot use your own referral code"
}
```

---

## Notes for Frontend Developers

1. **Referral Code Display**: Show the user's referral code prominently so they can share it
2. **Referral Stats**: Display total referrals and rewards earned to encourage sharing
3. **Registration Flow**: Include an optional referral code input field during registration
4. **Reward Notifications**: Consider showing notifications when referral rewards are earned
5. **Transaction History**: Filter transactions by category `referral_reward` to show referral earnings
6. **Share Functionality**: Provide easy ways to share referral codes (copy to clipboard, social sharing)

---

## Example Integration Flow

### 1. User Registration with Referral Code

```javascript
// Register with referral code
const registerResponse = await fetch('/api/v1/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    referralCode: 'ABC123' // Optional
  })
});

// Verify OTP
const verifyResponse = await fetch('/api/v1/users/verify-otp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    otp: '123456',
    firstName: 'John',
    lastName: 'Doe',
    password: 'password123',
    referralCode: 'ABC123'
  })
});
```

### 2. Get Referral Code

```javascript
const response = await fetch('/api/v1/referrals/code', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log('My referral code:', data.referralCode);
```

### 3. Get Referral Statistics

```javascript
const response = await fetch('/api/v1/referrals/stats', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log('Total referrals:', data.totalReferrals);
console.log('Total rewards:', data.totalRewards);
```

### 4. View Referral Rewards in Transactions

```javascript
// Get wallet transactions
const response = await fetch('/api/v1/wallet/transactions', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();

// Filter referral rewards
const referralRewards = data.filter(
  transaction => transaction.category === 'referral_reward'
);
```

---

## Database Schema

### User Model Updates

```typescript
{
  referralCode: string;      // Unique 6-character code
  referredBy: ObjectId;       // Reference to referring user
}
```

### Transaction Model Updates

```typescript
category: 'referral_reward'   // New transaction category
```

---

## Testing Referral Flow

1. **Create Referrer**: Register user A (gets referral code ABC123)
2. **Create Referral**: Register user B with referral code ABC123
3. **Make Purchase**: User B purchases data/airtime/cable/electricity
4. **Check Reward**: User A's wallet should be credited with 1% of purchase amount
5. **Verify Transaction**: Check User A's transactions for `referral_reward` entry

---

## Important Notes

- Referral rewards are processed **after** successful purchases
- Rewards are automatically credited - no manual action required
- Users cannot refer themselves
- Referral codes are case-insensitive (automatically uppercased)
- Each user gets a unique referral code upon registration
- Referral rewards are rounded to 2 decimal places
- If a purchase fails, no referral reward is processed

