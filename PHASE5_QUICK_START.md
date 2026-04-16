# Phase 5 - Quick Start Checklist

## 🚀 Phase 5 Integration Testing Launch

### Pre-Flight Checks ✅
- [x] Dependencies installed (`npm install`)
- [x] jsonwebtoken version fixed (9.1.2 → 9.0.0)
- [x] Backend configuration ready (backend/.env)
- [x] Testing guide created (PHASE5_TESTING_GUIDE.md)
- [ ] **MySQL service running** ⚠️ **REQUIRED NEXT STEP**

---

## 🔧 Setup Phase (Do This First)

### Step 1: Start MySQL Service

**Choose your method:**

#### Windows XAMPP (Easiest - Recommended)
```
1. Download XAMPP: https://www.apachefriends.org
2. Run XAMPP Control Panel
3. Click "Start" next to MySQL
4. Verify: MySQL shows "running"
```

#### Windows Services
```
1. Press Windows + R
2. Type: services.msc
3. Find: "MySQL80" (or similar)
4. Right-click → Properties → Start Service
```

#### Command Line (Windows Admin)
```powershell
net start MySQL80
# Output: "The MySQL80 service is starting."
```

#### Verify MySQL is Running
```bash
mysql -u root
# Success: mysql> prompt appears
# Failure: "Can't connect to MySQL server"
# Exit: type "exit"
```

---

### Step 2: Initialize Database

Once MySQL is confirmed running:

```bash
cd backend
npm run db:init
```

**Expected Output:**
```
🔧 Initializing CouponHub database...
✓ Database schema created
✓ 3 users created (demo data)
✓ 2 coupons created with items
✓ Tables: users, merchants, coupons, transactions, etc.
```

**Troubleshooting:**
```
❌ ECONNREFUSED: MySQL not running → Start MySQL first
❌ Access denied: Wrong .env credentials → Check backend/.env
❌ Database exists: That's OK → Will recreate for testing
```

---

### Step 3: Start Backend Server

```bash
npm run dev
# Keep terminal open
```

**Expected Output:**
```
✅ MySQL connection successful
✅ Email transporter ready
🚀 Server running on http://localhost:3000
📊 Health check: http://localhost:3000/api/health
```

**Verify Backend is Running:**
- Open browser: http://localhost:3000/api/health
- Should show: `{"status": "ok"}` or similar healthy response

---

### Step 4: Start Frontend Server (New Terminal)

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Verify Frontend is Running:**
- Browser automatically opens: http://localhost:5173
- Or manually open: http://localhost:5173
- Should show: Login page with "CouponHub" title

---

## 🧪 Testing Phase (Follow This)

### Dashboard (Terminal Visibility)

You should have 2 terminals visible:
```
Terminal 1: Backend running on :3000
Terminal 2: Frontend running on :5173
```

### Reference Guide

Open **PHASE5_TESTING_GUIDE.md** for:
- 15 detailed test scenarios
- Expected results for each
- Error cases to verify
- Performance benchmarks
- Security checks

### Quick Test Flow

```
1. Register new user
   ↓
2. Login as user
   ↓
3. Browse coupons
   ↓
4. Purchase coupon
   ↓
5. View my coupons
   ↓
6. Logout, login as merchant
   ↓
7. Create coupon
   ↓
8. Test error cases
   ↓
9. Password reset
   ↓
10. Close and document results
```

---

## 📋 Test Scenarios Checklist

**User Flows:**
- [ ] Register new user → Redirects to /coupons
- [ ] Login existing user → Access token stored
- [ ] Browse coupons → Loads from API
- [ ] Purchase coupon → Stock decreases, transaction created
- [ ] View my coupons → Shows QR codes
- [ ] Password reset → Complete flow works
- [ ] Logout → Token cleared from localStorage

**Merchant Flows:**
- [ ] Register as merchant → Redirects to /merchant
- [ ] Create coupon → Appears in list immediately
- [ ] Delete coupon → Removed from all lists
- [ ] View stats → Numbers are correct
- [ ] Redeem QR → Marks as redeemed

**Error Cases:**
- [ ] Invalid password → Error message
- [ ] Duplicate email → Error message
- [ ] Out of stock → Button disabled
- [ ] Expired coupon → Cannot redeem
- [ ] Network failure → Graceful handling

---

## 🔍 Issues Found During Testing

**If you encounter issues, check:**

1. **Browser Console** (F12)
   - Look for JavaScript errors (red X's)
   - Check for API errors (Network tab)

2. **Backend Console**
   - Look for server errors
   - Check SQL query logs
   - Verify middleware execution

3. **DevTools Network Tab**
   - Inspect API request URL
   - Check response status (200, 201, 400, 500, etc.)
   - Verify response payload

4. **Documentation**
   - Reference PHASE5_TESTING_GUIDE.md for expected results
   - Compare actual vs expected behavior

**Document Issues:**
```
Issue: [Description]
Test: [Which test failed]
Error: [Exact error message]
Steps: [How to reproduce]
Expected: [What should happen]
Actual: [What actually happened]
```

---

## 📊 Success Report Template

After completing all tests, fill this out:

```
Phase 5 Testing Complete ✅

Tests Run: __/15 scenarios
Tests Passed: __/15
Tests Failed: __/15

Issues Found: __
Issues Fixed: __

Performance:
- Page loads: __ ms (target: < 2000ms)
- API calls: __ ms (target: < 1000ms)

Security Verified:
- [ ] JWT tokens working
- [ ] Password hashing confirmed
- [ ] Role-based access verified
- [ ] Input validation passing

Database Integrity:
- [ ] Stock management correct
- [ ] Transaction records created
- [ ] User data consistent
- [ ] Cascade deletes working

Status: READY FOR PRODUCTION / NEEDS FIXES

Notes:
[Any important observations]
```

---

## 📚 Documentation Files

These files are your reference:

1. **IMPLEMENTATION_PROGRESS.md** - Overall project status
2. **PHASE5_TESTING_GUIDE.md** - Detailed test procedures
3. **API_TESTING_GUIDE.md** - API endpoint reference (curl examples)
4. **README.md** - Setup and architecture overview

---

## ⏱️ Estimated Time

- Setup (MySQL + Init): 5-10 minutes
- Backend/Frontend startup: 30 seconds
- Full test suite: 30-45 minutes
- Issue fixing: Variable

**Total: ~1 hour for complete Phase 5**

---

## 🎯 Success Criteria

Phase 5 is complete when:
- ✅ All 15 tests pass
- ✅ No console errors
- ✅ Database integrity verified
- ✅ Performance acceptable
- ✅ Security checks pass
- ✅ Error messages helpful
- ✅ README updated with results

---

## 💡 Pro Tips

1. **Keep DevTools Open**
   - Monitor Network tab during API calls
   - Check Console for immediate errors
   - Use Application tab to inspect localStorage

2. **Check Database During Tests**
   - Use MySQL client: `mysql -u root couponhub`
   - Verify data with: `SELECT * FROM users; SELECT * FROM coupons;`

3. **Save Test Logs**
   - Copy console output to file
   - Screenshot errors for documentation
   - Record API response times

4. **Test in Order**
   - Do Tests 1-7 first (happy path)
   - Then Tests 8-10 (edge cases)
   - Benefits: Database state builds naturally

5. **Clear State Between Tests**
   - Log out between test users
   - Don't create duplicate emails in same session
   - Can restart backend to reset if needed

---

## 🆘 Stuck on MySQL?

If MySQL won't start:

```bash
# Check if MySQL process is running
tasklist | find "mysqld"

# Try starting from MySQL directory
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe"

# Or use Windows Services GUI
services.msc → Find MySQL → Start
```

**If all else fails:**
1. Reinstall MySQL (add to PATH)
2. Download XAMPP (handles MySQL automatically)
3. Check MySQL documentation for your OS

---

## ✅ You're Ready!

Everything is set up for Phase 5. Just:

1. Start MySQL
2. Run `npm run db:init` in backend
3. Run `npm run dev` in backend (keep open)
4. Run `npm run dev` in frontend (keep open)
5. Open browser to http://localhost:5173
6. Follow PHASE5_TESTING_GUIDE.md

**Good luck! 🚀**

---

**Questions?** Check:
- IMPLEMENTATION_PROGRESS.md (for context)
- PHASE5_TESTING_GUIDE.md (for detailed procedures)
- API_TESTING_GUIDE.md (for API details)
