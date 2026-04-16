# Backend API Testing Guide

This guide walks you through testing the implemented backend API endpoints.

## Prerequisites

1. MySQL database running with credentials configured in `backend/.env`
2. Backend dependencies installed: `npm install` in backend folder
3. Database initialized: `npm run db:init`
4. Backend server running: `npm run dev`

## API Base URL

All requests should go to: `http://localhost:3000/api`

## Auth Endpoints

### 1. Register New User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "password": "password123",
    "role": "user"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful",
  "user": {
    "id": "uuid",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user",
    "created_at": "2026-04-16T..."
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@demo.com",
    "password": "password"
  }'
```

**Save the returned token for authenticated requests** (add Authorization header)

### 3. Validate Token

```bash
curl -X POST http://localhost:3000/api/auth/validate-token \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Forgot Password

```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@demo.com"
  }'
```

**Response includes reset code (in demo mode)**

### 5. Validate Reset Code

```bash
curl -X POST http://localhost:3000/api/auth/validate-reset-code \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ABC123"
  }'
```

### 6. Reset Password

```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "code": "ABC123",
    "newPassword": "newpassword123"
  }'
```

## Coupon Endpoints

### 1. Get All Coupons

```bash
curl "http://localhost:3000/api/coupons?search=burger&merchant=Burger"
```

**Query Parameters:**
- `search`: Search by title or description
- `merchant`: Filter by merchant name
- `limit`: Results per page (default: 20)
- `offset`: Pagination offset (default: 0)

### 2. Get Coupon Details

```bash
curl http://localhost:3000/api/coupons/{COUPON_ID}
```

### 3. Create Coupon (Merchant Only)

```bash
curl -X POST http://localhost:3000/api/coupons \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Special Offer",
    "description": "50% off all items",
    "price": 25.00,
    "discount_percentage": 50,
    "expiration_date": "2026-05-16",
    "stock": 100,
    "items": [
      {"item_name": "Item 1", "quantity": 1},
      {"item_name": "Item 2", "quantity": 2}
    ]
  }'
```

### 4. Delete Coupon (Merchant Only)

```bash
curl -X DELETE http://localhost:3000/api/coupons/{COUPON_ID} \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Purchase Coupon

```bash
curl -X POST http://localhost:3000/api/coupons/{COUPON_ID}/purchase \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response includes QR code for the purchased coupon**

### 6. Redeem Coupon (Merchant Only)

```bash
curl -X POST http://localhost:3000/api/coupons/{QR_CODE}/redeem \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## User Endpoints

### 1. Get User Coupons

```bash
curl http://localhost:3000/api/users/coupons \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Get User Profile

```bash
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Merchant Statistics

```bash
curl http://localhost:3000/api/users/merchant-stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Demo Credentials

Pre-seeded accounts from `npm run db:init`:

| Email | Password | Role |
|-------|----------|------|
| user@demo.com | password | user |
| burger@demo.com | password | merchant |
| coffee@demo.com | password | merchant |

## Testing Workflow

### 1. Register & Login
```bash
# Register new account
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"password","role":"user"}'

# Get token from response and save it
TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### 2. Browse Coupons
```bash
curl "http://localhost:3000/api/coupons"
```

### 3. Purchase Coupon
```bash
# Get a coupon ID from step 2
curl -X POST http://localhost:3000/api/coupons/{COUPON_ID}/purchase \
  -H "Authorization: Bearer $TOKEN"
```

### 4. View Purchased Coupons
```bash
curl http://localhost:3000/api/users/coupons \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Request Password Reset
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Get reset code from response
RESET_CODE="ABC123"
```

### 6. Reset Password
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"code":"'$RESET_CODE'","newPassword":"newpass123"}'
```

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (email already exists)
- `500` - Server error

## Tips

1. **Use Authorization Header** for authenticated endpoints:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
   ```

2. **Token Expiry**: Tokens are valid for 7 days

3. **Reset Token Expiry**: Reset codes expire after 1 hour

4. **Email Sending**: In development, reset codes are logged to console. In production, emails are sent via Ethereal/SMTP

5. **Demo Mode**: When testing password reset, the reset code is returned in response for convenience

## Next Steps

1. Verify all endpoints are working
2. Check database for created records: `mysql -u root couponhub`
3. Proceed to Phase 4: Frontend API integration
4. Update frontend components to use `frontend/src/lib/api.ts` functions
