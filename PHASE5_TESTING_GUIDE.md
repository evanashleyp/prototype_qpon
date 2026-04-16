# Phase 5 - Integration Testing & Error Handling Guide

## Prerequisites

Before starting Phase 5 testing, ensure:

1. **MySQL is running**
   - Port: 3306
   - User: root
   - Password: (empty)
   - Status: Use `mysql -u root` to verify

2. **Dependencies installed**
   - Root: `npm install` ✅ Done

3. **Environment configured**
   - Backend: `.env` file exists with correct MySQL credentials ✅ Done
   - Frontend: `.env.example` ready for Vite API URL

## Step-by-Step Testing Procedure

### Phase 5A: System Startup

#### Step 1: Initialize Database
```bash
cd backend
npm run db:init
```

**Expected Output:**
```
✓ Database schema created
✓ Demo data seeded
  - 3 users created (2 merchants, 1 regular)
  - 2 coupons created
  - MySQL connected successfully
```

**Troubleshooting:**
- If "ECONNREFUSED": MySQL not running. Start MySQL service.
- If "Access denied": Check .env credentials
- If "ER_BAD_DB_CREATE_ERROR": Database already exists (OK - will be reset)

#### Step 2: Start Backend Server
```bash
npm run dev
```

**Expected Output:**
```
✅ MySQL connection successful
✅ Email transporter ready
🚀 Server running on http://localhost:3000
📊 Health check: GET http://localhost:3000/api/health
```

**Verification:**
- Open browser: http://localhost:3000/api/health → should return 200 OK
- Check network tab for response

#### Step 3: Start Frontend (New Terminal)
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
➜ Local: http://localhost:5173/
```

**Verification:**
- Browser opens to http://localhost:5173
- Login page with "CouponHub" title loads
- No console errors

---

## Test Scenarios

### Test 1: User Registration

**Objective**: Verify new user account creation with JWT generation

**Steps:**
1. Navigate to http://localhost:5173
2. Click "Register" tab
3. Fill form:
   - Name: `Test User`
   - Email: `test@example.com`
   - Password: `password123`
   - Role: "Customer"
4. Click "Create Account"

**Expected Results:**
- ✅ Toast: "Account created as user"
- ✅ Redirects to /coupons page
- ✅ User profile shown in navbar (if visible)
- ✅ localStorage has `auth_token` (check DevTools)

**Failure Cases:**
- ❌ If email empty → Error: "Please fill in all fields"
- ❌ If password < 6 chars → Error: "Password must be at least 6 characters"
- ❌ If duplicate email → Error from server (test with user@demo.com)

**Network Check:**
- DevTools → Network → POST /api/auth/register
- Status: 201 (Created)
- Response contains: `user`, `token`

---

### Test 2: Merchant Registration

**Objective**: Verify merchant account creation and permissions

**Steps:**
1. In Register tab:
   - Name: `Test Merchant`
   - Email: `merchant@example.com`
   - Password: `password123`
   - Role: "Merchant"
2. Click "Create Account"

**Expected Results:**
- ✅ Toast: "Account created as merchant"
- ✅ Redirects to /merchant dashboard
- ✅ Dashboard shows "Test Merchant" name
- ✅ "New Coupon" button visible

**Network Check:**
- POST /api/auth/register should include `role: "merchant"`
- Server creates `users` record + `merchants` record

---

### Test 3: Login Flow

**Objective**: Verify authentication and JWT token management

**Steps:**
1. Logout if needed (clear localStorage)
2. Click Login tab
3. Enter:
   - Email: `user@demo.com`
   - Password: `password`
4. Click "Login"

**Expected Results:**
- ✅ Toast: "Welcome back, Demo User!"
- ✅ Redirects to /coupons
- ✅ localStorage contains `auth_token`
- ✅ Page loads user's coupons

**Failure Cases:**
- Wrong password → Error: "Invalid email or password"
- Non-existent email → Error: "Invalid email or password"
- Empty fields → Error: "Please fill in all fields"

**Network Check:**
- POST /api/auth/login → Status: 200
- Response: `{ user: {...}, token: "eyJ..." }`
- Token is JWT (three parts separated by dots)

---

### Test 4: Browse Coupons

**Objective**: Verify coupon list loading and filtering

**Steps:**
1. Stay on /coupons page after login
2. Observe coupon cards loading
3. Try search box: type "coffee"
4. Clear search and try "burger"

**Expected Results:**
- ✅ Coupons load from API
- ✅ Shows merchant name, title, price, discount
- ✅ Stock and expiration visible
- ✅ Search filters results client-side
- ✅ Out-of-stock coupons show badge

**Network Check:**
- GET /api/coupons → Status: 200
- Returns array of coupon objects with items
- Authorization: Bearer {token} in headers

**Edge Cases:**
- [ ] No coupons available → "No coupons found" message
- [ ] Expired coupon → Shows with different badge
- [ ] Out of stock → "Sold Out" badge, button disabled

---

### Test 5: Purchase Coupon

**Objective**: Verify coupon purchase and transaction creation

**Steps:**
1. Click on any available coupon card
2. View details (/coupon/:id)
3. Click "Purchase Coupon" button
4. Observe feedback

**Expected Results:**
- ✅ Toast: "Purchased! Check My Coupons for your QR code."
- ✅ Stock number decreases by 1
- ✅ Button state updates (might show sold out if last item)
- ✅ No redirect required

**Network Check:**
- POST /api/coupons/:id/purchase → Status: 201
- Response includes:
  - `qr_code`: UUID string
  - `coupon`: full coupon object
  - `is_redeemed`: false
  - `expires_at`: future date

**Verify Database:**
- Check `transactions` table (new row created)
- Check `user_coupons` table (new row with QR code)
- Check `coupons` stock (decremented by 1)

---

### Test 6: View My Coupons

**Objective**: Verify purchased coupon retrieval and QR display

**Steps:**
1. Click "My Coupons" in navbar
2. View your purchased coupon from Test 5
3. Observe QR code and details

**Expected Results:**
- ✅ Shows purchased coupon
- ✅ Displays QR code (as UUID text)
- ✅ Shows coupon details (title, merchant, items)
- ✅ Redeemed status: "Not redeemed"
- ✅ Expiration date visible

**Network Check:**
- GET /api/users/coupons → Status: 200
- Returns user's purchased coupons with full details

**Failure Case:**
- No purchases → Message: "You haven't purchased any coupons yet."

---

### Test 7: Merchant Dashboard

**Objective**: Verify merchant coupon management

**Steps:**
1. Logout
2. Login as merchant: `burger@demo.com` / `password`
3. Should redirect to /merchant dashboard

**Expected Results:**
- ✅ Dashboard shows "Burgers & More" (merchant name)
- ✅ Your Coupons section shows merchant's coupons
- ✅ "New Coupon" button visible
- ✅ QR redemption section visible

**Network Check:**
- GET /api/coupons?merchant={id} → merchant's coupons
- GET /api/users/merchant-stats → stats calculation

---

### Test 8: Create Coupon (Merchant)

**Objective**: Verify coupon creation with items

**Steps:**
1. On merchant dashboard, click "New Coupon"
2. Fill form:
   - Title: `Test Deal`
   - Description: `A test coupon`
   - Price: `9.99`
   - Discount: `20`
   - Expiration: `2026-12-31`
   - Stock: `10`
   - Items: 
     ```
     2 Item One
     1 Item Two
     ```
3. Click "Create Coupon"

**Expected Results:**
- ✅ Toast: "Coupon created! Your new coupon is now available"
- ✅ Dialog closes
- ✅ New coupon appears in "Your Coupons"
- ✅ Shows in public coupon list immediately

**Network Check:**
- POST /api/coupons → Status: 201
- Request includes items array
- Response with full coupon object

**Database Verify:**
- New row in `coupons` table
- New rows in `coupon_items` table (2 rows for 2 items)

---

### Test 9: Delete Coupon (Merchant)

**Objective**: Verify coupon deletion

**Steps:**
1. On your coupon card, click delete button (trash icon)
2. Confirm deletion

**Expected Results:**
- ✅ Toast: "Coupon deleted"
- ✅ Coupon removed from dashboard
- ✅ Removed from public coupon list
- ✅ No longer purchasable

**Network Check:**
- DELETE /api/coupons/:id → Status: 200

**Database Verify:**
- Coupon removed from `coupons` table
- Associated `coupon_items` removed (cascade delete)

---

### Test 10: Password Reset

**Objective**: Verify password reset flow

**Steps:**
1. Logout
2. On login page, click "Forgot password?"
3. Enter email: `user@demo.com`
4. Click "Reset"

**Expected Results:**
- ✅ Toast: "Check your email for password reset instructions"
- ✅ Redirected to success screen
- ✅ Demo code visible (for testing)
- ✅ Expires in 1 hour message shown

**Console Check:**
- Check browser console → reset code shown in demo mode

**Steps (Continue):**
5. Copy reset code from console
6. Click "Enter Reset Code" button
7. Enter code and new password: `newpassword123`
8. Click "Reset Password"

**Expected Results:**
- ✅ Toast: "Password reset successfully"
- ✅ Redirects to login
- ✅ Wait 2 seconds for navigation

**Verification:**
9. Login with new password: `user@demo.com` / `newpassword123`
- ✅ Should successfully login

**Network Check:**
- POST /api/auth/forgot-password → Status: 200 (includes code in demo)
- POST /api/auth/validate-reset-code → Status: 200 (returns valid: true)
- POST /api/auth/reset-password → Status: 200

**Error Cases:**
- [ ] Invalid code → Error message
- [ ] Expired code (after 1 hour) → Error message
- [ ] Used code → Error message
- [ ] Password < 6 chars → Validation error

---

## Error Scenario Testing

### Test 11: Invalid Login Credentials

**Steps:**
1. Login tab
2. Enter: `user@demo.com` / `wrongpassword`
3. Click Login

**Expected:**
- ❌ Toast: "Invalid email or password"
- ❌ Stay on login page
- ❌ No token stored

---

### Test 12: Duplicate Email Registration

**Steps:**
1. Register tab
2. Enter: `user@demo.com` / `password` (existing)
3. Click Create Account

**Expected:**
- ❌ Toast: "[Server error message]"
- ❌ Registration fails
- ❌ User can retry with different email

---

### Test 13: Out of Stock Coupon

**Steps:**
1. Create coupon with stock: `1`
2. Purchase it (stock becomes 0)
3. Try purchasing again

**Expected:**
- ❌ Toast: "Could not purchase coupon"
- ❌ Button state: "Sold Out"
- ❌ Stock shows 0

---

### Test 14: Expired Coupon

**Steps:**
1. Purchase a coupon
2. In database, set `expires_at` to past date
3. Try to redeem on merchant dashboard

**Expected:**
- ❌ Toast: "Coupon has expired"
- ❌ Redemption fails

---

### Test 15: Network Error Handling

**Steps:**
1. Stop backend server (Ctrl+C)
2. Try to load coupons or perform an action
3. Observe error handling

**Expected:**
- ❌ Error message: "Failed to connect to server"
- ❌ UI doesn't crash
- ❌ User can retry

---

## Performance Checks

### Load Time Targets
- Page load: < 2 seconds
- Coupon list: < 1 second
- Purchase: < 1 second
- Navigation: Instant

**How to Check:**
- DevTools → Network tab → Measure request times
- Watch for long requests (> 2s)

---

## Security Verification

### JWT Token Security
- [ ] Token stored in localStorage
- [ ] Token sent in Authorization header
- [ ] Expired token → 401 error
- [ ] Invalid token → Login required

### Role-Based Access
- [ ] Regular user can't access merchant endpoints
- [ ] Merchant can't affect other merchants' coupons
- [ ] Non-authenticated users redirected to login

### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts blocked
- [ ] Password properly hashed (bcryptjs)
- [ ] Reset codes are unique

---

## Known Limitations

1. **Email Testing**: Uses Ethereal test account
   - Production needs real SMTP (Gmail, SendGrid, etc.)

2. **QR Codes**: Shows as UUID text
   - Could be enhanced to show actual QR image

3. **Search**: Client-side only
   - Could add server-side search for better performance

4. **Pagination**: Not implemented
   - Just offset/limit

5. **Real-time**: No WebSocket
   - User sees stale data on page refresh

---

## Success Criteria for Phase 5

- ✅ All 15 tests pass
- ✅ No JavaScript errors in console
- ✅ All error messages are user-friendly
- ✅ Database integrity maintained
- ✅ No memory leaks (DevTools → Memory)
- ✅ Performance acceptable
- ✅ Security verified

---

## When Tests Fail

If any test fails:

1. **Check Browser Console**: Look for JavaScript errors
2. **Check Backend Logs**: Look for server-side errors
3. **Network Tab**: Inspect API request/response
4. **Database**: Verify data consistency
5. Create issue note with:
   - Test number and name
   - Exact error message
   - Network response
   - Steps to reproduce

---

## After All Tests Pass

1. Update IMPLEMENTATION_PROGRESS.md with results
2. Document any bugs fixed
3. Note any performance improvements made
4. Start Phase 6 (Production Deployment)

---

**Good luck with testing! 🚀**
