# Razorpay Diagnostic Logging - Exact Code Changes

## Files Modified: 6 Total
1. `src/pages/OrderPage.tsx` - handleRazorpay() function
2. `shastika-app/src/pages/OrderPage.tsx` - handleRazorpay() function
3. `src/lib/razorpayService.ts` - loadRazorpayScript() and createRazorpayOrder()
4. `shastika-app/src/lib/razorpayService.ts` - loadRazorpayScript() and createRazorpayOrder()

---

## 1. src/pages/OrderPage.tsx - handleRazorpay()

### Change: Complete rewrite of handleRazorpay() with diagnostic logging

**Before:** Basic logging with catch block showing [object Object]
```typescript
const handleRazorpay = async () => {
  try {
    const apiUrl = import.meta.env.VITE_PAYMENT_API_URL;
    if (!apiUrl) { /* alert */ return; }
    console.log('🔧 Razorpay API URL:', apiUrl);
    const scriptLoaded = await loadRazorpayScript();
    console.log('✅ Razorpay scriptLoaded:', scriptLoaded);
    const res = await fetch(`${apiUrl}/api/razorpay/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: total }),
    });
    const data = await res.json();
    // ... more code
  } catch (error) {
    const errorInfo = error instanceof Error ? { name, message, stack } : error;
    console.error('RAZORPAY FULL ERROR:', errorInfo); // Shows [object Object]
  }
};
```

**After:** 10-step diagnostic flow with comprehensive logging
```typescript
const handleRazorpay = async () => {
  try {
    console.log('\n========== RAZORPAY PAYMENT FLOW START ==========');
    
    // Step 1: Verify API URL
    const apiUrl = import.meta.env.VITE_PAYMENT_API_URL;
    console.log('[RAZORPAY] API URL from env:', apiUrl);
    console.log('[RAZORPAY] Type of API URL:', typeof apiUrl);
    console.log('[RAZORPAY] API URL is empty?', !apiUrl);
    
    if (!apiUrl) {
      console.error('❌ VITE_PAYMENT_API_URL not configured');
      alert('Backend API URL not configured...');
      return;
    }

    // Step 2: Load Razorpay script
    console.log('\n[RAZORPAY] Step 2: Loading Razorpay script...');
    const scriptLoaded = await loadRazorpayScript();
    console.log('[RAZORPAY] Script loaded:', scriptLoaded);
    console.log('[RAZORPAY] window.Razorpay exists:', !!(window as any).Razorpay);
    console.log('[RAZORPAY] window.Razorpay type:', typeof (window as any).Razorpay);
    
    if (!scriptLoaded) {
      console.error('❌ Razorpay checkout script failed to load');
      alert('Payment gateway failed to load. Please try again.');
      return;
    }

    // Step 3: Prepare request payload
    console.log('\n[RAZORPAY] Step 3: Preparing create-order request');
    const requestPayload = { amount: total };
    console.log('[RAZORPAY] Request payload:', requestPayload);
    console.log('[RAZORPAY] Amount value:', total);
    console.log('[RAZORPAY] Amount type:', typeof total);
    console.log('[RAZORPAY] Amount is number?', typeof total === 'number');
    console.log('[RAZORPAY] Amount > 0?', total > 0);
    
    const endpoint = `${apiUrl}/api/razorpay/create-order`;
    console.log('[RAZORPAY] Full endpoint URL:', endpoint);

    // Step 4: Fetch order from backend
    console.log('\n[RAZORPAY] Step 4: Fetching order from backend');
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    });

    console.log('[RAZORPAY] Response status:', res.status);
    console.log('[RAZORPAY] Response ok?', res.ok);
    console.log('[RAZORPAY] Response statusText:', res.statusText);
    
    // Step 5: Parse response
    console.log('\n[RAZORPAY] Step 5: Parsing response');
    const responseText = await res.text();
    console.log('[RAZORPAY] Response body (text):', responseText);
    
    let data: any;
    try {
      data = JSON.parse(responseText);
      console.log('[RAZORPAY] Response body (JSON):', data);
    } catch (parseError) {
      console.error('[RAZORPAY] Failed to parse JSON response:', parseError);
      throw new Error(`Failed to parse server response: ${responseText}`);
    }

    // Step 6: Validate response structure
    console.log('\n[RAZORPAY] Step 6: Validating response structure');
    console.log('[RAZORPAY] data exists?', !!data);
    console.log('[RAZORPAY] data.success?', data?.success);
    console.log('[RAZORPAY] data.data exists?', !!data?.data);
    console.log('[RAZORPAY] data.data.order_id?', data?.data?.order_id);
    console.log('[RAZORPAY] data.data.amount?', data?.data?.amount);
    console.log('[RAZORPAY] Full data.data object:', data?.data);

    if (!data.success) {
      console.error('[RAZORPAY] Response success flag is false');
      console.error('[RAZORPAY] Error message:', data?.message);
      throw new Error(data?.message || 'Backend returned success: false');
    }

    if (!data.data) {
      console.error('[RAZORPAY] Response missing data object');
      throw new Error('Backend response missing "data" field');
    }

    if (!data.data.order_id) {
      console.error('[RAZORPAY] Response missing order_id');
      console.error('[RAZORPAY] data.data keys:', Object.keys(data.data));
      throw new Error('Backend response missing order_id');
    }

    // Step 7: Prepare Razorpay options
    console.log('\n[RAZORPAY] Step 7: Preparing Razorpay options');
    const firebaseUid = auth.currentUser?.uid || currentUser.id;
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_SbjI2zHHlox9vn';
    const Razorpay = (window as any).Razorpay;

    console.log('[RAZORPAY] Firebase UID:', firebaseUid);
    console.log('[RAZORPAY] Razorpay key from env:', import.meta.env.VITE_RAZORPAY_KEY_ID);
    console.log('[RAZORPAY] Razorpay key (final):', razorpayKey);
    console.log('[RAZORPAY] Key is defined?', !!razorpayKey);
    console.log('[RAZORPAY] Key is empty string?', razorpayKey === '');
    console.log('[RAZORPAY] Razorpay constructor exists?', !!Razorpay);
    console.log('[RAZORPAY] Razorpay constructor type:', typeof Razorpay);

    if (!Razorpay) {
      console.error('[RAZORPAY] window.Razorpay is not available');
      throw new Error('Razorpay checkout library is not available on window');
    }

    if (!razorpayKey || razorpayKey.trim() === '') {
      console.error('[RAZORPAY] Razorpay key is empty or undefined');
      throw new Error('VITE_RAZORPAY_KEY_ID is not configured');
    }

    if (!data.data.order_id || data.data.order_id.trim() === '') {
      console.error('[RAZORPAY] Order ID is empty');
      throw new Error('Backend returned empty order_id');
    }

    if (!data.data.amount || data.data.amount < 1) {
      console.error('[RAZORPAY] Amount is invalid:', data.data.amount);
      throw new Error(`Backend returned invalid amount: ${data.data.amount}`);
    }

    const options: any = {
      key: razorpayKey,
      amount: data.data.amount,
      currency: 'INR',
      order_id: data.data.order_id,
      handler: function (response: any) {
        console.log('\n[RAZORPAY] SUCCESS: Handler callback triggered');
        console.log('[RAZORPAY] Response object:', response);
        console.log('[RAZORPAY] payment_id:', response?.razorpay_payment_id);
        console.log('[RAZORPAY] order_id:', response?.razorpay_order_id);
        console.log('[RAZORPAY] signature:', response?.razorpay_signature);
        
        try {
          markOrderPaymentComplete(orderId);
          addPayment({
            id: `PAY-${Date.now()}`,
            orderId,
            buyerId: firebaseUid,
            buyerName: currentUser.name,
            buyerEmail: currentUser.email,
            buyerPhone: currentUser.phone,
            amount: total,
            method: 'razorpay',
            transactionId: response.razorpay_payment_id,
            utrNumber: response.razorpay_payment_id,
            bankName: 'Razorpay',
            status: 'completed',
            timestamp: new Date().toLocaleString(),
            adminNote: '',
          });
          setStep('confirmed');
          console.log('[RAZORPAY] Payment completed and UI updated');
        } catch (handlerError) {
          console.error('[RAZORPAY] Error in handler:', handlerError);
        }
      },
      modal: {
        ondismiss: function() {
          console.log('\n[RAZORPAY] Modal dismissed by user');
        }
      },
      prefill: { name: currentUser.name, email: currentUser.email, contact: currentUser.phone },
    };

    console.log('\n[RAZORPAY] Step 8: Razorpay options object');
    console.log('[RAZORPAY] Full options:', options);
    console.log('[RAZORPAY] options.key:', options.key);
    console.log('[RAZORPAY] options.amount:', options.amount);
    console.log('[RAZORPAY] options.currency:', options.currency);
    console.log('[RAZORPAY] options.order_id:', options.order_id);
    console.log('[RAZORPAY] options.handler type:', typeof options.handler);
    console.log('[RAZORPAY] options.prefill:', options.prefill);

    // Step 9: Create Razorpay instance
    console.log('\n[RAZORPAY] Step 9: Creating Razorpay instance');
    let rzp;
    try {
      rzp = new Razorpay(options);
      console.log('[RAZORPAY] Razorpay instance created successfully');
      console.log('[RAZORPAY] Instance type:', typeof rzp);
      console.log('[RAZORPAY] Instance has open method?', typeof rzp?.open === 'function');
    } catch (constructorError) {
      console.error('[RAZORPAY] Error constructing Razorpay:', constructorError);
      console.error('[RAZORPAY] Constructor error RAW:', constructorError);
      console.error('[RAZORPAY] Constructor error JSON:', JSON.stringify(constructorError, null, 2));
      throw constructorError;
    }

    // Step 10: Open checkout
    console.log('\n[RAZORPAY] Step 10: Opening checkout');
    try {
      rzp.open();
      console.log('[RAZORPAY] checkout.open() executed successfully');
    } catch (openError) {
      console.error('[RAZORPAY] Error opening checkout:', openError);
      console.error('[RAZORPAY] Open error RAW:', openError);
      console.error('[RAZORPAY] Open error JSON:', JSON.stringify(openError, null, 2));
      throw openError;
    }

    console.log('\n========== RAZORPAY PAYMENT FLOW END ==========\n');
  } catch (error) {
    console.log('\n========== RAZORPAY ERROR HANDLER ==========');
    console.error("RAZORPAY ERROR RAW:", error);
    console.error("RAZORPAY ERROR JSON:", JSON.stringify(error, null, 2));
    console.error("RAZORPAY ERROR STACK:", (error as any)?.stack);
    console.error("RAZORPAY ERROR TYPE:", typeof error);
    console.error("RAZORPAY ERROR NAME:", (error as any)?.name);
    console.error("RAZORPAY ERROR MESSAGE:", (error as any)?.message);
    
    const errorInfo = error instanceof Error 
      ? { 
          type: 'Error', 
          name: error.name, 
          message: error.message, 
          stack: error.stack 
        } 
      : { 
          type: typeof error, 
          value: error 
        };
    
    console.error('RAZORPAY PARSED ERROR:', errorInfo);
    console.log('========== RAZORPAY ERROR END ==========\n');
    
    alert(`Payment Error: ${(error as any)?.message || String(error)}`);
  }
};
```

**Key additions:**
- 10 sequential steps with clear console separators
- Pre-validation at every stage (API URL, script loaded, response structure)
- Request payload logging before fetch
- Response status and raw text before JSON parsing
- JSON parsing error handling with raw response fallback
- Detailed error serialization with JSON.stringify(error, null, 2)
- Modal dismiss callback logging
- Constructor and open() call error handling

---

## 2. src/lib/razorpayService.ts - loadRazorpayScript()

### Change: Enhanced script loading with detailed logging

**Before:**
```typescript
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      console.log('🔧 Razorpay library already available on window.');
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      console.log('✅ Razorpay checkout.js loaded successfully.');
      console.log('📝 window.Razorpay after load:', !!(window as any).Razorpay);
      resolve(true);
    };
    script.onerror = (event) => {
      console.error('❌ Razorpay script failed to load.', event);
      resolve(false);
    };
    document.head.appendChild(script);
  });
}
```

**After:**
```typescript
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    console.log('\n========== loadRazorpayScript START ==========');
    
    if ((window as any).Razorpay) {
      console.log('[loadRazorpayScript] Razorpay library already available on window.');
      console.log('[loadRazorpayScript] window.Razorpay type:', typeof (window as any).Razorpay);
      console.log('========== loadRazorpayScript END (already cached) ==========\n');
      resolve(true);
      return;
    }

    console.log('[loadRazorpayScript] Creating script element');
    console.log('[loadRazorpayScript] Script src: https://checkout.razorpay.com/v1/checkout.js');
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('[loadRazorpayScript] ✅ Script tag onload fired');
      console.log('[loadRazorpayScript] window.Razorpay exists after load:', !!(window as any).Razorpay);
      console.log('[loadRazorpayScript] window.Razorpay type:', typeof (window as any).Razorpay);
      
      if ((window as any).Razorpay) {
        console.log('[loadRazorpayScript] Razorpay object successfully loaded');
        console.log('[loadRazorpayScript] Razorpay.key available?', typeof (window as any).Razorpay.key);
        console.log('[loadRazorpayScript] Razorpay.open available?', typeof (window as any).Razorpay.open);
        console.log('========== loadRazorpayScript END (loaded) ==========\n');
        resolve(true);
      } else {
        console.error('[loadRazorpayScript] ❌ Script loaded but window.Razorpay is undefined');
        console.log('========== loadRazorpayScript END (script loaded but Razorpay missing) ==========\n');
        resolve(false);
      }
    };
    
    script.onerror = (event) => {
      console.error('[loadRazorpayScript] ❌ Script failed to load');
      console.error('[loadRazorpayScript] Error event:', event);
      console.error('[loadRazorpayScript] Error type:', typeof event);
      console.log('========== loadRazorpayScript END (error) ==========\n');
      resolve(false);
    };
    
    console.log('[loadRazorpayScript] Appending script to document.head');
    document.head.appendChild(script);
  });
}
```

**Key additions:**
- Check if script is cached with logging
- Script creation details logged
- Script onload verification (was script actually loaded?)
- Check that window.Razorpay exists (library loaded correctly)
- Check Razorpay object methods (key, open)
- Error event logging with type
- Clear delineation with separators

---

## 3. src/lib/razorpayService.ts - createRazorpayOrder()

### Change: Complete request/response logging with validation

**Before:**
```typescript
export async function createRazorpayOrder(
  amount: number,
  receipt?: string,
  notes?: Record<string, string>
): Promise<RazorpayOrderResponse> {
  try {
    if (!PAYMENT_API) {
      throw new Error('Backend API URL not configured. Set VITE_PAYMENT_API_URL environment variable.');
    }

    if (!amount || amount < 1) {
      throw new Error('Invalid amount - must be at least ₹1');
    }

    const endpoint = `${PAYMENT_API}/api/razorpay/create-order`;
    console.log('[Razorpay] Creating order at:', endpoint);
    console.log('[Razorpay] Amount:', amount);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount,
        currency: 'INR',
        receipt: receipt || `receipt_${Date.now()}`,
        notes: { ...notes, client_created_at: new Date().toISOString() },
      }),
    });

    console.log('[Razorpay] Create-order response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Razorpay] HTTP error response:', errorText);
      throw new Error(`API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data: RazorpayOrderResponse = await response.json();
    console.log('[Razorpay] Create-order response data:', data);

    if (!data.success) {
      throw new Error(data.message || 'Failed to create order');
    }

    console.log('✅ Order created:', data.data?.order_id);
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[Razorpay] ❌ Error creating order:', errorMessage);
    
    if (errorMessage.includes('Failed to fetch')) {
      throw new Error(`Network error: Cannot reach backend at ${PAYMENT_API}...`);
    }
    throw error;
  }
}
```

**After:**
```typescript
export async function createRazorpayOrder(
  amount: number,
  receipt?: string,
  notes?: Record<string, string>
): Promise<RazorpayOrderResponse> {
  try {
    console.log('\n========== razorpayService.createRazorpayOrder START ==========');
    
    // Validate inputs
    console.log('[RazorpayService] Input validation:');
    console.log('[RazorpayService] amount:', amount);
    console.log('[RazorpayService] amount type:', typeof amount);
    console.log('[RazorpayService] amount is number?', typeof amount === 'number');
    console.log('[RazorpayService] amount > 0?', amount > 0);
    
    if (!PAYMENT_API) {
      console.error('[RazorpayService] PAYMENT_API is not set');
      throw new Error('Backend API URL not configured. Set VITE_PAYMENT_API_URL environment variable.');
    }

    console.log('[RazorpayService] PAYMENT_API:', PAYMENT_API);

    if (!amount || amount < 1) {
      console.error('[RazorpayService] Invalid amount:', amount);
      throw new Error('Invalid amount - must be at least ₹1');
    }

    // Prepare request
    const endpoint = `${PAYMENT_API}/api/razorpay/create-order`;
    const requestPayload = {
      amount,
      currency: 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
      notes: {
        ...notes,
        client_created_at: new Date().toISOString(),
      },
    };

    console.log('\n[RazorpayService] Request details:');
    console.log('[RazorpayService] Endpoint:', endpoint);
    console.log('[RazorpayService] Method: POST');
    console.log('[RazorpayService] Headers:', { 'Content-Type': 'application/json' });
    console.log('[RazorpayService] Payload:', requestPayload);
    console.log('[RazorpayService] Payload (JSON):', JSON.stringify(requestPayload, null, 2));

    // Make request
    console.log('\n[RazorpayService] Making fetch request...');
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
    });

    // Check response
    console.log('\n[RazorpayService] Response received:');
    console.log('[RazorpayService] Status code:', response.status);
    console.log('[RazorpayService] Status text:', response.statusText);
    console.log('[RazorpayService] OK?', response.ok);
    console.log('[RazorpayService] Headers:', {
      'content-type': response.headers.get('content-type'),
      'content-length': response.headers.get('content-length'),
    });

    // Get response text first
    const responseText = await response.text();
    console.log('[RazorpayService] Raw response body:', responseText);
    console.log('[RazorpayService] Response length:', responseText.length);

    // Check HTTP status
    if (!response.ok) {
      console.error('[RazorpayService] HTTP error response');
      throw new Error(`API error: ${response.status} ${response.statusText} - ${responseText}`);
    }

    // Parse JSON
    console.log('\n[RazorpayService] Parsing JSON response...');
    let data: RazorpayOrderResponse;
    try {
      data = JSON.parse(responseText) as RazorpayOrderResponse;
      console.log('[RazorpayService] Parsed JSON:', data);
    } catch (parseError) {
      console.error('[RazorpayService] JSON parse error:', parseError);
      console.error('[RazorpayService] Tried to parse:', responseText);
      throw new Error(`Failed to parse server response: ${responseText}`);
    }

    // Validate response structure
    console.log('\n[RazorpayService] Validating response structure:');
    console.log('[RazorpayService] data exists?', !!data);
    console.log('[RazorpayService] data type:', typeof data);
    console.log('[RazorpayService] data.success?', data?.success);
    console.log('[RazorpayService] data.message?', data?.message);
    console.log('[RazorpayService] data.data exists?', !!data?.data);
    
    if (data?.data) {
      console.log('[RazorpayService] data.data structure:');
      console.log('[RazorpayService] - order_id:', data.data.order_id);
      console.log('[RazorpayService] - amount:', data.data.amount);
      console.log('[RazorpayService] - currency:', data.data.currency);
      console.log('[RazorpayService] - receipt:', data.data.receipt);
      console.log('[RazorpayService] - All keys:', Object.keys(data.data));
    }

    if (!data.success) {
      console.error('[RazorpayService] Response has success: false');
      throw new Error(data.message || 'Failed to create order');
    }

    if (!data.data) {
      console.error('[RazorpayService] Response missing data field');
      throw new Error('Backend response missing data field');
    }

    if (!data.data.order_id) {
      console.error('[RazorpayService] Response missing order_id');
      console.error('[RazorpayService] data.data:', data.data);
      throw new Error('Backend response missing order_id');
    }

    console.log('\n[RazorpayService] ✅ Order created successfully:', data.data.order_id);
    console.log('========== razorpayService.createRazorpayOrder END ==========\n');
    return data;
  } catch (error) {
    console.log('\n========== razorpayService.createRazorpayOrder ERROR ==========');
    console.error("RAZORPAY ERROR RAW:", error);
    console.error("RAZORPAY ERROR JSON:", JSON.stringify(error, null, 2));
    console.error("RAZORPAY ERROR STACK:", (error as any)?.stack);
    console.error("RAZORPAY ERROR MESSAGE:", (error as any)?.message);
    console.error("RAZORPAY ERROR NAME:", (error as any)?.name);
    console.log('========== razorpayService.createRazorpayOrder ERROR END ==========\n');
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[RazorpayService] ❌ Error creating order:', errorMessage);
    
    if (errorMessage.includes('Failed to fetch')) {
      throw new Error(
        `Network error: Cannot reach backend at ${PAYMENT_API}.\n` +
        'Check: 1) Backend server is running\n' +
        '2) VITE_PAYMENT_API_URL is set to correct IP/port\n' +
        '3) Device is on same network as backend'
      );
    }
    throw error;
  }
}
```

**Key additions:**
- Input validation logging (amount type, range)
- API URL validation
- Request payload structure logged
- Request payload as formatted JSON
- Response status, statusText, ok flag
- Response headers (content-type, content-length)
- Raw response body before parsing (critical for debugging)
- Response length logged
- JSON parse error handling with fallback to raw text
- Response structure validation (success, data, order_id)
- All response fields logged individually
- Error summary section at end with JSON.stringify

---

## 4. Duplicate Files Updated

**shastika-app/src/pages/OrderPage.tsx** - Same changes as src/pages/OrderPage.tsx
**shastika-app/src/lib/razorpayService.ts** - Same changes as src/lib/razorpayService.ts

---

## Summary of Logging Categories

### 1. Initialization Logs
- `========== RAZORPAY PAYMENT FLOW START ==========`
- API URL validation
- Script loading state

### 2. Request Logs
- Endpoint URL
- Request method
- Request headers
- Request payload
- Amount validation

### 3. Response Logs
- HTTP status code
- Response headers
- Raw response body (text)
- Parsed JSON
- Response structure validation

### 4. Configuration Logs
- Razorpay key validation
- Order ID validation
- Amount validation
- Currency validation

### 5. Error Logs
- `RAZORPAY ERROR RAW:` - Raw error object
- `RAZORPAY ERROR JSON:` - Serialized error with full details
- `RAZORPAY ERROR STACK:` - Stack trace
- `RAZORPAY ERROR TYPE:` - Error type (Error, object, etc.)
- `RAZORPAY ERROR NAME:` - Error name (TypeError, etc.)
- `RAZORPAY ERROR MESSAGE:` - Error message

### 6. Completion Logs
- `========== RAZORPAY PAYMENT FLOW END ==========`
- Success indicators

---

## Testing Instructions

1. **Build app:**
   ```bash
   npm run build
   ```

2. **Sync and build for Android:**
   ```bash
   npx cap sync android
   npx cap build android
   ```

3. **Deploy to real device:**
   ```bash
   npx cap open android
   # Then build and run from Android Studio
   ```

4. **Open Chrome DevTools:**
   - Navigate to `chrome://inspect`
   - Select your Android device
   - Click "Inspect" under WebView

5. **Test payment flow:**
   - Click "Pay with Razorpay" button
   - Observe console logs
   - Look for the 10 steps completing
   - Share the complete console output for analysis

---

## Expected Success Output Structure

```
========== RAZORPAY PAYMENT FLOW START ==========
[RAZORPAY] API URL from env: http://192.168.1.25:5000
[RAZORPAY] Step 2: Loading Razorpay script...
========== loadRazorpayScript START ==========
[loadRazorpayScript] Script tag onload fired
========== loadRazorpayScript END (loaded) ==========
[RAZORPAY] Step 3: Preparing create-order request
========== razorpayService.createRazorpayOrder START ==========
[RazorpayService] Input validation: amount 100
[RazorpayService] Making fetch request...
[RazorpayService] Response received: 200 OK
[RazorpayService] Raw response body: {"success":true,"data":{"order_id":"order_..."}}
[RazorpayService] ✅ Order created successfully: order_...
========== razorpayService.createRazorpayOrder END ==========
[RAZORPAY] Step 6: Validating response structure
[RAZORPAY] data.success?: true
[RAZORPAY] data.data.order_id?: order_...
[RAZORPAY] Step 9: Creating Razorpay instance
[RAZORPAY] Razorpay instance created successfully
[RAZORPAY] Step 10: Opening checkout
[RAZORPAY] checkout.open() executed successfully
========== RAZORPAY PAYMENT FLOW END ==========

✅ Razorpay modal opens for user payment entry
```

---

**All changes are ready to test. Build and deploy to verify diagnostic logging output.**
