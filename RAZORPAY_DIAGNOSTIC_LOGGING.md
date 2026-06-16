# Razorpay Payment Diagnostic Logging Implementation

## Summary
Comprehensive diagnostic logging added to all Razorpay payment entry points to capture detailed error information, request/response details, and execution state at every step of the payment flow.

## Current Issue
**Symptom:** `❌ RAZORPAY FULL ERROR: [object Object]`
**Root Cause:** Error object not properly serialized in console output, masking actual error details

## Files Modified

### 1. Frontend: Order Page Components
**Files:**
- `src/pages/OrderPage.tsx` (Primary build)
- `shastika-app/src/pages/OrderPage.tsx` (Duplicate for dev)

**Function:** `handleRazorpay()` (Lines 120-220+)

**Changes:**
- Added 10-step diagnostic flow with console logging at every step
- Pre-fetch validation: API URL, script loaded, window.Razorpay exists
- Request logging: endpoint URL, payload structure, amount validation
- Response logging: status code, raw text, JSON parsing attempt
- Response validation: success flag, data object structure, order_id existence
- Options construction: key, amount, currency, order_id validation
- Instance creation: error handling for Razorpay constructor
- Checkout open: error handling for rzp.open() call
- Error handler: Comprehensive error serialization with JSON.stringify(error, null, 2)

**Key Logging Points:**
```
[RAZORPAY] Step 1: Verify API URL
[RAZORPAY] Step 2: Load Razorpay script
[RAZORPAY] Step 3: Prepare create-order request
[RAZORPAY] Step 4: Fetch order from backend
[RAZORPAY] Step 5: Parse response
[RAZORPAY] Step 6: Validate response structure
[RAZORPAY] Step 7: Prepare Razorpay options
[RAZORPAY] Step 8: Razorpay options object
[RAZORPAY] Step 9: Create Razorpay instance
[RAZORPAY] Step 10: Open checkout
```

**Error Logging:**
```javascript
console.error("RAZORPAY ERROR RAW:", error);
console.error("RAZORPAY ERROR JSON:", JSON.stringify(error, null, 2));
console.error("RAZORPAY ERROR STACK:", error?.stack);
console.error("RAZORPAY ERROR TYPE:", typeof error);
console.error("RAZORPAY ERROR NAME:", error?.name);
console.error("RAZORPAY ERROR MESSAGE:", error?.message);
```

---

### 2. Frontend: Razorpay Service Library
**Files:**
- `src/lib/razorpayService.ts` (Primary build)
- `shastika-app/src/lib/razorpayService.ts` (Duplicate for dev)

**Functions Modified:**

#### A. `loadRazorpayScript()` (Lines 230-265)
**Changes:**
- Added pre-load check with logging
- Script creation logging
- Script onload handler with detailed state verification
- Script onerror handler with error logging
- Validation that window.Razorpay exists after load

**Key Logging:**
```
[loadRazorpayScript] Creating script element
[loadRazorpayScript] Script tag onload fired
[loadRazorpayScript] window.Razorpay exists after load: true/false
[loadRazorpayScript] Razorpay object successfully loaded
[loadRazorpayScript] ❌ Script loaded but window.Razorpay is undefined
[loadRazorpayScript] ❌ Script failed to load
```

#### B. `createRazorpayOrder()` (Lines 77-140)
**Changes:**
- Input validation logging (amount type, value range)
- Endpoint and payload logging
- Request details (method, headers, body)
- Response received logging (status, statusText, headers)
- Raw response body logging (text format)
- JSON parse error handling with fallback to text
- Response structure validation (success flag, data object, order_id)
- Detailed error logging with JSON.stringify

**Key Logging Points:**
```
[RazorpayService] Input validation
[RazorpayService] amount type, is number, > 0
[RazorpayService] Request details (endpoint, payload)
[RazorpayService] Response received (status, ok flag)
[RazorpayService] Raw response body
[RazorpayService] Parsing JSON response
[RazorpayService] Validating response structure
[RazorpayService] data.data structure (order_id, amount, currency)
[RazorpayService] ✅ Order created successfully
```

**Error Logging:**
```javascript
console.error("RAZORPAY ERROR RAW:", error);
console.error("RAZORPAY ERROR JSON:", JSON.stringify(error, null, 2));
console.error("RAZORPAY ERROR STACK:", error?.stack);
```

---

## Diagnostic Data Captured

### Request Level
- API URL and validation
- Request payload structure
- Request method (POST)
- Content-Type header
- Amount value, type, range

### Response Level
- HTTP status code
- Status text
- Content-Type header
- Raw response body (before parsing)
- JSON parsing success/failure
- Parsed JSON structure

### Razorpay Options Validation
- Key: Defined, type, empty check
- Amount: Type, value, range validation
- Currency: Expected value (INR)
- Order ID: Existence, emptiness check, type
- Handler callback: Type verification

### Error Information
- Error raw object
- Error JSON representation (full serialization)
- Error stack trace
- Error type
- Error name and message

---

## Root Cause Analysis Checklist

The logging will help identify if error is in:

### ✅ Network/Backend
- [ ] Fetch fails (Failed to fetch, network error)
  - Check: Server running, URL reachable, CORS configured
  - Log: "Failed to fetch" in error message

- [ ] HTTP error status (status !== 200)
  - Check: Backend error handling
  - Log: Response status code

### ✅ Response Format
- [ ] JSON parse fails
  - Check: Backend response is valid JSON
  - Log: JSON parse error, raw response body

- [ ] Missing success flag
  - Check: Backend returns {success: true/false}
  - Log: data.success value

- [ ] Missing data object
  - Check: Backend wraps order in data field
  - Log: data.data exists check

- [ ] Missing order_id
  - Check: Backend order creation returned valid order
  - Log: data.data.order_id value

- [ ] Invalid amount
  - Check: Amount > 0 and is number
  - Log: data.data.amount value and type

### ✅ Script/Library
- [ ] Razorpay script fails to load
  - Check: CDN accessibility, Content Security Policy
  - Log: Script onerror handler

- [ ] window.Razorpay undefined after load
  - Check: Script loaded but library not attached to window
  - Log: window.Razorpay type after onload

- [ ] Razorpay constructor fails
  - Check: Options object validity
  - Log: Constructor try/catch error

- [ ] rzp.open() fails
  - Check: Razorpay instance validity
  - Log: Open method error

### ✅ Configuration
- [ ] Missing VITE_PAYMENT_API_URL
  - Check: .env.local has VITE_PAYMENT_API_URL=http://192.168.1.25:5000
  - Log: API URL from env

- [ ] Missing VITE_RAZORPAY_KEY_ID
  - Check: .env.local has VITE_RAZORPAY_KEY_ID=rzp_test_...
  - Log: Key validation check

---

## How to Interpret Logs

### Success Flow (Expected Output)
```
========== RAZORPAY PAYMENT FLOW START ==========
[RAZORPAY] API URL from env: http://192.168.1.25:5000
[RAZORPAY] Step 2: Loading Razorpay script...
[RAZORPAY] Script loaded: true
[RAZORPAY] window.Razorpay exists: true
[RAZORPAY] Step 3: Preparing create-order request
[RAZORPAY] Amount value: 100
[RAZORPAY] Step 4: Fetching order from backend
[RAZORPAY] Response status: 200
[RAZORPAY] Response ok?: true
[RAZORPAY] Response body (JSON): {success: true, data: {order_id: "order_..."}}
[RAZORPAY] Step 6: Validating response structure
[RAZORPAY] data.success?: true
[RAZORPAY] data.data.order_id?: order_...
[RAZORPAY] Step 7: Preparing Razorpay options
[RAZORPAY] Step 9: Creating Razorpay instance
[RAZORPAY] Razorpay instance created successfully
[RAZORPAY] Step 10: Opening checkout
[RAZORPAY] checkout.open() executed successfully
========== RAZORPAY PAYMENT FLOW END ==========
```

### Error Flow (What to Look For)
1. **Check where console logs stop** - That's where the error occurred
2. **Look for status codes** - HTTP errors show here
3. **Inspect response body** - Parse errors or unexpected structure
4. **Check error JSON** - Will show actual error message
5. **Verify configuration** - API URL, key, amount all logged

---

## Next Steps for Debugging

1. **Build and deploy app:**
   ```bash
   npm run build
   npx cap sync android
   npx cap build android
   ```

2. **Run on real device:**
   ```bash
   npx cap open android
   ```

3. **Open Chrome DevTools:**
   - Remote debugging: chrome://inspect
   - Select your device
   - View console logs

4. **Perform payment flow:**
   - Click "Pay with Razorpay"
   - Copy entire console output
   - Analyze following root cause checklist above

5. **Key Success Indicators:**
   - All 10 steps complete without error
   - No JSON parse errors
   - Response status 200 OK
   - Order ID successfully retrieved
   - Razorpay modal opens

6. **If error occurs:**
   - Find the step where console logs stop
   - Look for "RAZORPAY ERROR" section
   - Check error message for specific details
   - Verify configuration matching the error
   - Check backend logs simultaneously

---

## Configuration Requirements

### Frontend (.env.local)
```
VITE_PAYMENT_API_URL=http://192.168.1.25:5000
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_HERE
VITE_SOCKET_URL=http://192.168.1.25:5000
```

### Backend (server/.env)
```
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_HERE
RAZORPAY_KEY_SECRET=YOUR_TEST_SECRET_HERE
PORT=5000
NODE_ENV=development
```

### Android (capacitor.config.ts)
```typescript
server: {
  androidScheme: 'http',
  allowNavigation: ['*'],
}
android: {
  allowMixedContent: true,
}
```

---

## Files Analyzed

### Configuration
- ✅ `capacitor.config.ts` - Android HTTP allowed
- ✅ `android/app/src/main/AndroidManifest.xml` - Network security config linked
- ✅ `android/app/src/main/res/xml/network_security_config.xml` - Cleartext traffic for 192.168.1.25

### Implementation
- ✅ `server/server.js` - Backend order creation API (lines 247-290)
- ✅ `src/pages/OrderPage.tsx` - Frontend payment flow
- ✅ `src/lib/razorpayService.ts` - Razorpay integration library
- ✅ All duplicates in shastika-app/

---

## Summary of Changes

| File | Function | Lines | Changes |
|------|----------|-------|---------|
| src/pages/OrderPage.tsx | handleRazorpay() | 120-343 | 10-step diagnostic logging |
| shastika-app/src/pages/OrderPage.tsx | handleRazorpay() | Similar | Same as above |
| src/lib/razorpayService.ts | loadRazorpayScript() | 230-265 | Enhanced script loading logs |
| src/lib/razorpayService.ts | createRazorpayOrder() | 77-140 | Request/response logging |
| shastika-app/src/lib/razorpayService.ts | loadRazorpayScript() | Similar | Enhanced script loading logs |
| shastika-app/src/lib/razorpayService.ts | createRazorpayOrder() | Similar | Request/response logging |

---

**Status:** Ready for testing. Build app and run on real device, then share console output from chrome://inspect for analysis.
