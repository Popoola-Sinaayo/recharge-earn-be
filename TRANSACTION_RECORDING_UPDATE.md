# Transaction Recording Update - Data Up Services

## Overview

This update ensures that all purchases made through the Data Up services (data, airtime, electricity, and cable) are properly recorded as transactions in the system. The implementation includes wallet debiting, transaction creation, automatic refunds on failure, and referral reward processing.

---

## What Changed

### 1. New Transaction Categories

Added three new transaction categories to track different purchase types:

- `airtime_purchase` - For airtime purchases
- `electricity_purchase` - For electricity bill payments
- `cable_purchase` - For cable TV subscriptions

**Existing categories:**
- `funding` - Wallet funding via Paystack
- `data_purchase` - Data bundle purchases
- `refund` - Refunds for failed purchases
- `withdrawal` - Wallet withdrawals
- `referral_reward` - Referral rewards

### 2. Updated Purchase Endpoints

All Data Up purchase endpoints now:

1. **Debit wallet** before making the purchase
2. **Create transaction record** with purchase details
3. **Make purchase** via Data Up API
4. **Refund wallet** if purchase fails
5. **Process referral rewards** on successful purchase

---

## Updated Endpoints

### 1. POST /api/v1/utilities/data_purchase

**Purchase Flow:**
1. Validates user authentication
2. Validates required fields (`phone_number`, `plan_id`, `reference`)
3. Fetches plan details to get purchase amount
4. **Debits wallet** with category `data_purchase`
5. **Creates transaction record**
6. Makes purchase via Data Up API
7. If successful: Processes referral reward
8. If failed: **Refunds wallet** with category `refund`

**Request:**
```json
{
  "phone_number": "08123456789",
  "plan_id": "38",
  "reference": "ref_123456"
}
```

**Transaction Created:**
```json
{
  "type": "debit",
  "category": "data_purchase",
  "amount": 1000.00,
  "status": "completed",
  "description": "Data purchase: 2GB SME2 (30 Days)",
  "metadata": {
    "phone_number": "08123456789",
    "plan_id": "38",
    "reference": "ref_123456",
    "network": "MTN"
  }
}
```

---

### 2. POST /api/v1/utilities/airtime_purchase

**Purchase Flow:**
1. Validates user authentication
2. Validates required fields (`phone_number`, `amount`, `network`, `reference`)
3. Validates amount > 0
4. **Debits wallet** with category `airtime_purchase`
5. **Creates transaction record**
6. Makes purchase via Data Up API
7. If successful: Processes referral reward
8. If failed: **Refunds wallet** with category `refund`

**Request:**
```json
{
  "phone_number": "08123456789",
  "amount": "500",
  "network": "MTN",
  "reference": "ref_789012"
}
```

**Transaction Created:**
```json
{
  "type": "debit",
  "category": "airtime_purchase",
  "amount": 500.00,
  "status": "completed",
  "description": "Airtime purchase: MTN - 08123456789",
  "metadata": {
    "phone_number": "08123456789",
    "amount": "500",
    "network": "MTN",
    "reference": "ref_789012"
  }
}
```

---

### 3. POST /api/v1/utilities/electric_purchase

**Purchase Flow:**
1. Validates user authentication
2. Validates required fields (`phone_number`, `plan_id`, `amount`, `meter_number`)
3. Validates amount > 0
4. **Debits wallet** with category `electricity_purchase`
5. **Creates transaction record**
6. Makes purchase via Data Up API
7. If successful: Extracts and stores token, processes referral reward
8. If failed: **Refunds wallet** with category `refund`

**Request:**
```json
{
  "phone_number": "08123456789",
  "plan_id": "11",
  "amount": "5000",
  "meter_number": "45701597"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Electricity purchased successfully",
  "data": {
    "status": "success",
    "message": "Electricity token generated",
    "data": {
      "token": "1234-5678-9012-3456",
      "meter_number": "45701597",
      "amount": "5000",
      "units": "50.5"
    },
    "token": "1234-5678-9012-3456"
  }
}
```

**Transaction Created:**
```json
{
  "type": "debit",
  "category": "electricity_purchase",
  "amount": 5000.00,
  "status": "completed",
  "token": "1234-5678-9012-3456",
  "description": "Electricity purchase: Meter 45701597",
  "metadata": {
    "phone_number": "08123456789",
    "plan_id": "11",
    "amount": "5000",
    "meter_number": "45701597"
  }
}
```

**Note:** The `token` field in the transaction contains the electricity token that should be displayed to the user for entering into their prepaid meter.

---

### 4. POST /api/v1/utilities/cable_purchase

**Purchase Flow:**
1. Validates user authentication
2. Validates required fields (`smartcard_number`, `plan_id`)
3. Fetches plan details to get purchase amount
4. **Debits wallet** with category `cable_purchase`
5. **Creates transaction record**
6. Makes purchase via Data Up API
7. If successful: Processes referral reward
8. If failed: **Refunds wallet** with category `refund`

**Request:**
```json
{
  "smartcard_number": "3232233",
  "plan_id": "2"
}
```

**Transaction Created:**
```json
{
  "type": "debit",
  "category": "cable_purchase",
  "amount": 2000.00,
  "status": "completed",
  "description": "Cable subscription purchase: DStv Compact",
  "metadata": {
    "smartcard_number": "3232233",
    "plan_id": "2"
  }
}
```

---

## Error Handling & Refunds

### Automatic Refund Process

If a purchase fails at any point, the system automatically:

1. **Credits the wallet** with the debited amount
2. **Creates a refund transaction** with category `refund`
3. **Records failure reason** in transaction metadata

**Refund Transaction Example:**
```json
{
  "type": "credit",
  "category": "refund",
  "amount": 1000.00,
  "status": "completed",
  "description": "Wallet credited",
  "metadata": {
    "originalTransaction": "data_purchase",
    "reason": "Third-party API purchase failed",
    "phone_number": "08123456789",
    "plan_id": "38",
    "reference": "ref_123456",
    "thirdPartyResponse": {
      "status": "failed",
      "message": "Insufficient balance"
    }
  }
}
```

### Failure Scenarios

1. **API Request Fails** (Network error, timeout, etc.)
   - Wallet is refunded immediately
   - Error details stored in transaction metadata

2. **API Returns Failure Status**
   - Wallet is refunded
   - Third-party response stored in transaction metadata

3. **Invalid Plan/Amount**
   - Request rejected before wallet debit
   - No transaction created

4. **Insufficient Wallet Balance**
   - Request rejected before API call
   - No transaction created
   - Error: "Insufficient wallet balance"

---

## Transaction Flow Diagram

```
User Request
    ↓
Validate Authentication & Input
    ↓
Get Purchase Amount
    ↓
Check Wallet Balance
    ↓
[Insufficient Balance?] → Return Error
    ↓
Debit Wallet
    ↓
Create Transaction (status: completed)
    ↓
Call Data Up API
    ↓
[Success?]
    ├─ Yes → Process Referral Reward
    │         Return Success Response
    │
    └─ No → Credit Wallet (Refund)
             Create Refund Transaction
             Return Error Response
```

---

## Transaction Metadata

Each transaction includes detailed metadata for tracking and debugging:

### Data Purchase Metadata
```json
{
  "phone_number": "08123456789",
  "plan_id": "38",
  "reference": "ref_123456",
  "network": "MTN",
  "description": "Data purchase: 2GB SME2 (30 Days)"
}
```

### Airtime Purchase Metadata
```json
{
  "phone_number": "08123456789",
  "amount": "500",
  "network": "MTN",
  "reference": "ref_789012",
  "description": "Airtime purchase: MTN - 08123456789"
}
```

### Electricity Purchase Metadata
```json
{
  "phone_number": "08123456789",
  "plan_id": "11",
  "amount": "5000",
  "meter_number": "45701597",
  "description": "Electricity purchase: Meter 45701597"
}
```

**Note:** Electricity purchase transactions include a `token` field containing the electricity token that must be displayed to the user.

### Cable Purchase Metadata
```json
{
  "smartcard_number": "3232233",
  "plan_id": "2",
  "description": "Cable subscription purchase: DStv Compact"
}
```

### Refund Transaction Metadata
```json
{
  "originalTransaction": "data_purchase",
  "reason": "Third-party API purchase failed",
  "phone_number": "08123456789",
  "plan_id": "38",
  "reference": "ref_123456",
  "thirdPartyResponse": { ... },
  "error": "Error message if applicable"
}
```

---

## Viewing Transactions

### Get Wallet Transactions

**Endpoint:** `GET /api/v1/wallet/transactions`

**Response:**
```json
{
  "success": true,
  "message": "Transactions retrieved successfully",
  "data": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "walletId": "65a1b2c3d4e5f6g7h8i9j0k3",
      "type": "debit",
      "category": "data_purchase",
      "amount": 1000.00,
      "balanceBefore": 5000.00,
      "balanceAfter": 4000.00,
      "status": "completed",
      "reference": "DB-1705312200000-ABCD",
      "description": "Data purchase: 2GB SME2 (30 Days)",
      "metadata": {
        "phone_number": "08123456789",
        "plan_id": "38",
        "reference": "ref_123456",
        "network": "MTN"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
      "userId": "65a1b2c3d4e5f6g7h8i9j0k2",
      "walletId": "65a1b2c3d4e5f6g7h8i9j0k3",
      "type": "debit",
      "category": "electricity_purchase",
      "amount": 5000.00,
      "balanceBefore": 4000.00,
      "balanceAfter": -1000.00,
      "status": "completed",
      "reference": "DB-1705312300000-EFGH",
      "token": "1234-5678-9012-3456",
      "description": "Electricity purchase: Meter 45701597",
      "metadata": {
        "phone_number": "08123456789",
        "plan_id": "11",
        "amount": "5000",
        "meter_number": "45701597"
      },
      "createdAt": "2024-01-15T10:35:00.000Z",
      "updatedAt": "2024-01-15T10:35:00.000Z"
    }
  ]
}
```

**Note:** Electricity purchase transactions include a `token` field that should be prominently displayed to users.

### Filter by Category

You can filter transactions by category in your frontend:

```javascript
// Filter data purchases
const dataPurchases = transactions.filter(
  t => t.category === 'data_purchase'
);

// Filter airtime purchases
const airtimePurchases = transactions.filter(
  t => t.category === 'airtime_purchase'
);

// Filter electricity purchases
const electricityPurchases = transactions.filter(
  t => t.category === 'electricity_purchase'
);

// Filter cable purchases
const cablePurchases = transactions.filter(
  t => t.category === 'cable_purchase'
);

// Filter refunds
const refunds = transactions.filter(
  t => t.category === 'refund'
);
```

---

## Benefits

### 1. Complete Transaction History
- All purchases are now tracked in the database
- Users can view their complete purchase history
- Easy to generate reports and analytics

### 2. Wallet Balance Accuracy
- Wallet is debited before purchase
- Automatic refunds on failure
- Balance always reflects actual state

### 3. Error Recovery
- Failed purchases automatically refunded
- No lost funds on API failures
- Clear error tracking in transaction metadata

### 4. Audit Trail
- Complete record of all purchases
- Metadata includes all relevant details
- Easy to trace issues or disputes

### 5. Referral Integration
- Referral rewards processed after successful purchases
- Transaction records include referral information
- Complete tracking of referral earnings

---

## Database Schema Updates

### Transaction Model

The `Transaction` model now supports these categories:

```typescript
category: {
  type: String,
  enum: [
    "funding",
    "data_purchase",
    "airtime_purchase",      // NEW
    "electricity_purchase",   // NEW
    "cable_purchase",         // NEW
    "refund",
    "withdrawal",
    "referral_reward",
  ],
  required: true,
}
```

**New Field: `token`**
```typescript
token: {
  type: String,
  sparse: true,  // Optional field
}
```

The `token` field stores electricity tokens returned from successful electricity purchases. This token must be displayed to users for entering into their prepaid meters.

### Type Definition

```typescript
export type TransactionCategory = 
  | 'funding' 
  | 'data_purchase' 
  | 'airtime_purchase'      // NEW
  | 'electricity_purchase'   // NEW
  | 'cable_purchase'         // NEW
  | 'refund' 
  | 'withdrawal' 
  | 'referral_reward';

export interface ITransaction extends Document {
  // ... other fields
  token?: string;  // NEW - For electricity tokens
  // ... other fields
}
```

---

## Testing

### Test Purchase Flow

1. **Ensure user has sufficient wallet balance**
2. **Make purchase request**
3. **Verify transaction created:**
   - Check wallet balance decreased
   - Check transaction record exists
   - Verify transaction category matches purchase type
   - Verify metadata contains purchase details

### Test Refund Flow

1. **Simulate API failure** (or use invalid data)
2. **Verify refund transaction created:**
   - Check wallet balance restored
   - Check refund transaction exists
   - Verify refund metadata contains failure reason

### Test Insufficient Balance

1. **Ensure user has insufficient balance**
2. **Make purchase request**
3. **Verify:**
   - Request rejected before API call
   - No transaction created
   - Error message returned

---

## Migration Notes

### For Existing Users

- No migration required
- Existing transactions remain unchanged
- New purchases will use new categories

### For Frontend Integration

1. **Update transaction filters** to include new categories
2. **Update transaction display** to show new purchase types
3. **Update error handling** to show refund messages
4. **Update wallet balance display** to reflect real-time balance

---

## Example Integration

### Frontend Purchase Flow

```javascript
// Purchase data
async function purchaseData(phoneNumber, planId) {
  try {
    // 1. Get plan details to show price
    const plans = await getDataPlans();
    const plan = findPlan(plans, planId);
    const amount = plan.api_price;

    // 2. Check wallet balance
    const wallet = await getWalletBalance();
    if (wallet.balance < amount) {
      throw new Error('Insufficient balance');
    }

    // 3. Make purchase
    const response = await fetch('/api/v1/utilities/data_purchase', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone_number: phoneNumber,
        plan_id: planId,
        reference: generateReference(),
      }),
    });

    const result = await response.json();

    if (result.success) {
      // 4. Refresh wallet balance
      const updatedWallet = await getWalletBalance();
      
      // 5. Show success message
      showSuccess('Data purchased successfully!');
      
      // 6. Refresh transaction list
      refreshTransactions();
    } else {
      // Handle error (refund already processed)
      showError(result.message);
    }
  } catch (error) {
    showError(error.message);
  }
}
```

### View Purchase History

```javascript
// Get all purchases
async function getPurchaseHistory() {
  const transactions = await getWalletTransactions();
  
  const purchases = {
    data: transactions.filter(t => t.category === 'data_purchase'),
    airtime: transactions.filter(t => t.category === 'airtime_purchase'),
    electricity: transactions.filter(t => t.category === 'electricity_purchase'),
    cable: transactions.filter(t => t.category === 'cable_purchase'),
    refunds: transactions.filter(t => t.category === 'refund'),
  };

  return purchases;
}
```

### Display Electricity Token

```javascript
// Display electricity token to user
function displayElectricityPurchase(transaction) {
  if (transaction.category === 'electricity_purchase' && transaction.token) {
    return {
      success: true,
      message: 'Electricity purchased successfully',
      token: transaction.token,
      amount: transaction.amount,
      meterNumber: transaction.metadata.meter_number,
      // Display token prominently to user
      displayMessage: `Your electricity token: ${transaction.token}`
    };
  }
  return null;
}

// Example usage
const electricityTransactions = transactions.filter(
  t => t.category === 'electricity_purchase'
);

electricityTransactions.forEach(transaction => {
  const tokenInfo = displayElectricityPurchase(transaction);
  if (tokenInfo) {
    // Show token in UI
    showTokenModal(tokenInfo.token, tokenInfo.meterNumber);
  }
});
```

---

## Important Notes

1. **Wallet is debited before API call** - This ensures balance accuracy
2. **Automatic refunds** - Failed purchases are automatically refunded
3. **Transaction status** - All purchase transactions have status `completed` (debit) or `completed` (refund)
4. **Referral rewards** - Processed only after successful purchases
5. **Metadata storage** - All purchase details stored in transaction metadata for audit purposes
6. **Electricity tokens** - Tokens are stored in the `token` field of electricity purchase transactions and must be displayed to users
7. **Token display** - The token is included in the API response and stored in the transaction for future reference

---

## Support

For issues or questions regarding transaction recording:

1. Check transaction metadata for error details
2. Verify wallet balance matches transaction history
3. Review refund transactions for failed purchases
4. Check API logs for Data Up API responses

---

## Changelog

### Version 1.1.0 - Transaction Recording Update

**Added:**
- Transaction recording for all Data Up purchases
- New transaction categories: `airtime_purchase`, `electricity_purchase`, `cable_purchase`
- Automatic refund system for failed purchases
- Enhanced transaction metadata
- `token` field in Transaction model for storing electricity tokens
- Token extraction and storage for electricity purchases

**Updated:**
- All Data Up purchase endpoints now debit wallet before purchase
- All Data Up purchase endpoints now create transaction records
- Error handling with automatic refunds

**Fixed:**
- Wallet balance accuracy issues
- Missing transaction records for purchases

---

## Summary

This update ensures complete transaction tracking for all Data Up service purchases. Every purchase now:

✅ Debits wallet before API call  
✅ Creates transaction record  
✅ Automatically refunds on failure  
✅ Processes referral rewards on success  
✅ Stores complete metadata for audit  
✅ Stores electricity tokens for user display  

All purchases are now fully tracked, providing users with complete transaction history and ensuring wallet balance accuracy. Electricity tokens are automatically extracted and stored for easy retrieval and display to users.

