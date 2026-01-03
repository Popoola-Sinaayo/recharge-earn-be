# API Documentation

Base URL: `http://localhost:3000/api/v1` (or your production URL)

All endpoints return JSON responses with the following structure:

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
  "errors": [ ... ] // Optional, for validation errors
}
```

---

## Authentication

Most endpoints require authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Health Check

### GET /health

Check if the server is running.

**Request:**
```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## User Endpoints

### POST /api/v1/users/register

Initiate user registration. Sends OTP to email.

**Request:**
```json
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "First name is required",
      "param": "firstName",
      "location": "body"
    }
  ]
}
```

---

### POST /api/v1/users/verify-otp

Verify OTP and complete registration.

**Request:**
```json
{
  "email": "john@example.com",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123",
  "phone": "08012345678"
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
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### POST /api/v1/users/resend-otp

Resend OTP to email.

**Request:**
```json
{
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email. Please verify to complete registration.",
  "data": {}
}
```

---

### POST /api/v1/users/login

Login user and get JWT token.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "08012345678",
      "isActive": true,
      "isEmailVerified": true,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

---

### GET /api/v1/users/profile

Get authenticated user's profile.

**Request:**
```
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "isActive": true,
    "isEmailVerified": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
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

### POST /api/v1/users/forgot-password

Request password reset OTP.

**Request:**
```json
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

---

### POST /api/v1/users/reset-password

Reset password using OTP.

**Request:**
```json
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid or expired OTP"
}
```

---

### POST /api/v1/users/change-password

Change password while authenticated.

**Request:**
```
POST /api/v1/users/change-password
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

**Error Response (400):**
```json
{
  "success": false,
  "message": "Current password is incorrect"
}
```

---

## Wallet Endpoints

### GET /api/v1/wallet/balance

Get wallet balance.

**Request:**
```
GET /api/v1/wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Wallet balance retrieved successfully",
  "data": {
    "balance": 5000.00,
    "currency": "NGN"
  }
}
```

---

### GET /api/v1/wallet/transactions

Get wallet transaction history.

**Request:**
```
GET /api/v1/wallet/transactions?limit=50&skip=0
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (optional): Number of transactions to return (default: 50)
- `skip` (optional): Number of transactions to skip (default: 0)

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "userId": "65a1b2c3d4e5f6g7h8i9j0k1",
      "walletId": "65a1b2c3d4e5f6g7h8i9j0k3",
      "type": "credit",
      "category": "funding",
      "amount": 5000,
      "balanceBefore": 0,
      "balanceAfter": 5000,
      "status": "completed",
      "reference": "CR-1705312200000-ABCD",
      "description": "Wallet funding",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

## Payment Endpoints

### POST /api/v1/payments/initialize

Initialize Paystack payment for wallet funding.

**Request:**
```
POST /api/v1/payments/initialize
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "john@example.com",
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "access_code_here",
    "reference": "PAY-1705312200000-ABCD"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Invalid amount"
}
```

---

### GET /api/v1/payments/verify

Verify Paystack payment.

**Request:**
```
GET /api/v1/payments/verify?reference=PAY-1705312200000-ABCD
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "status": true,
    "message": "Verification successful",
    "data": {
      "amount": 500000,
      "currency": "NGN",
      "status": "success",
      ...
    }
  }
}
```

---

## Action Endpoints (Legacy Data Products)

### GET /api/v1/action/products

Get product list.

**Request:**
```
GET /api/v1/action/products?category=MTN
Authorization: Bearer <token>
```

**Query Parameters:**
- `category` (optional): Filter by category

**Response:**
```json
{
  "success": true,
  "message": "Products retrieved successfully",
  "data": {
    "status": true,
    "data": [
      {
        "id": "product_123",
        "name": "1GB Data",
        "price": 500,
        "network": "MTN"
      }
    ]
  }
}
```

---

### POST /api/v1/action/purchase

Purchase data product.

**Request:**
```
POST /api/v1/action/purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product_123",
  "phoneNumber": "08012345678",
  "network": "MTN"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data purchased successfully",
  "data": {
    "success": true,
    "data": {
      "status": "success",
      "message": "Data purchase successful"
    },
    "amount": 500
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Insufficient wallet balance"
}
```

---

### GET /api/v1/action/history

Get purchase history.

**Request:**
```
GET /api/v1/action/history?limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase history retrieved successfully",
  "data": {
    "transactions": [...]
  }
}
```

---

## Utilities Endpoints (Data Up API)

All utilities endpoints require authentication. The Data Up API signin is handled internally.

### GET /api/v1/utilities/data

Get data plans from Data Up API.

**Request:**
```
GET /api/v1/utilities/data
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Data plans retrieved successfully",
  "data": {
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
            "status": 0,
            "airtime_value": "1470.00",
            "mb_value": "2048.00",
            "price": "1255.00",
            "type": 0,
            "message": "",
            "master_name": "2GB SME2 (30 Days)",
            "master_status": 0,
            "master_message": "",
            "network": "MTN"
          }
        ],
        "AIRTEL": [...],
        "GLO": [...],
        "9MOBILE": [...]
      }
    }
  }
}
```

---

### POST /api/v1/utilities/data_purchase

Purchase data from Data Up API.

**Request:**
```
POST /api/v1/utilities/data_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "08168880476",
  "plan_id": 38,
  "reference": "ref04"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Data purchased successfully",
  "data": {
    "status": "success",
    "message": "Data purchase successful",
    "data": {
      "transaction_id": "12345",
      "status": "success"
    }
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Failed to purchase data"
}
```

---

### POST /api/v1/utilities/airtime_purchase

Purchase airtime from Data Up API.

**Request:**
```
POST /api/v1/utilities/airtime_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "08168670476",
  "amount": 200,
  "network": "MTN",
  "reference": "tranc03"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Airtime purchased successfully",
  "data": {
    "status": "success",
    "message": "Airtime purchase successful",
    "data": {
      "transaction_id": "12345",
      "status": "success"
    }
  }
}
```

---

### POST /api/v1/utilities/verify_meter

Verify electricity meter number.

**Request:**
```
POST /api/v1/utilities/verify_meter
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan_id": 11,
  "meter_number": "45701597"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Meter verified successfully",
  "data": {
    "status": "success",
    "message": "Meter verified",
    "data": {
      "customer_name": "John Doe",
      "meter_number": "45701597",
      "address": "123 Main St"
    }
  }
}
```

---

### POST /api/v1/utilities/electric_purchase

Purchase electricity.

**Request:**
```
POST /api/v1/utilities/electric_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone_number": "08168670476",
  "plan_id": 11,
  "amount": 5000,
  "meter_number": "8798798789"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Electricity purchased successfully",
  "data": {
    "status": "success",
    "message": "Electricity purchase successful",
    "data": {
      "transaction_id": "12345",
      "status": "success"
    }
  }
}
```

---

### POST /api/v1/utilities/cable_purchase

Purchase cable subscription.

**Request:**
```
POST /api/v1/utilities/cable_purchase
Authorization: Bearer <token>
Content-Type: application/json

{
  "smartcard_number": "3232233",
  "plan_id": 2
}
```

**Response:**
```json
{
  "success": true,
  "message": "Cable subscription purchased successfully",
  "data": {
    "status": "success",
    "message": "Cable purchase successful",
    "data": {
      "transaction_id": "12345",
      "status": "success"
    }
  }
}
```

---

### GET /api/v1/utilities/transactions/reference/:refId

Get transaction by reference ID.

**Request:**
```
GET /api/v1/utilities/transactions/reference/ref04
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction retrieved successfully",
  "data": {
    "status": "success",
    "data": {
      "reference": "ref04",
      "status": "completed",
      "amount": 1300,
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|---------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors, invalid input) |
| 401 | Unauthorized (missing or invalid token) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Common Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "msg": "Email is required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Route not found"
}
```

### Internal Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Notes for Frontend Developers

1. **Base URL**: Update the base URL based on your environment (development/production)

2. **Token Storage**: Store the JWT token securely (e.g., localStorage, sessionStorage, or httpOnly cookie)

3. **Token Expiration**: Tokens expire after 7 days (configurable). Implement token refresh logic if needed.

4. **Error Handling**: Always check the `success` field in responses before accessing `data`

5. **Pagination**: Use `limit` and `skip` query parameters for paginated endpoints

6. **Request Headers**: Always include `Content-Type: application/json` for POST/PUT requests

7. **Authentication**: Include `Authorization: Bearer <token>` header for protected routes

8. **OTP Expiration**: OTPs expire in 10 minutes

9. **Password Reset**: Password reset OTPs also expire in 10 minutes

10. **Wallet Funding**: After payment initialization, redirect user to `authorizationUrl` from Paystack

