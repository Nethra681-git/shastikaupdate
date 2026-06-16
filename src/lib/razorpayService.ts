import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

// API endpoint - MUST be configured via environment variable
// For development: set VITE_PAYMENT_API_URL in .env.local
// For real Android device: VITE_PAYMENT_API_URL=http://192.168.1.25:5000
// For Android emulator: VITE_PAYMENT_API_URL=http://10.0.2.2:5000
const PAYMENT_API = import.meta.env.VITE_PAYMENT_API_URL;

if (!PAYMENT_API) {
  console.error(
    '❌ CRITICAL: VITE_PAYMENT_API_URL is not set.\n' +
    'Please add to .env.local or environment:\n' +
    'VITE_PAYMENT_API_URL=http://192.168.1.25:5000 (real Android device)\n' +
    'OR\n' +
    'VITE_PAYMENT_API_URL=http://10.0.2.2:5000 (Android emulator)'
  );
}

/**
 * Razorpay Payment Interfaces
 */
export interface RazorpayOrderResponse {
  success: boolean;
  data?: {
    order_id: string;
    amount: number;
    currency: string;
    receipt: string;
  };
  message?: string;
  error?: string;
}

export interface RazorpayPaymentVerifyResponse {
  success: boolean;
  message?: string;
  data?: {
    payment_id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
    timestamp: number;
  };
  error?: string;
}

export interface RazorpayPaymentData {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export interface SavedPaymentData {
  buyerId: string;
  buyerEmail: string;
  amount: number;
  razorpayPaymentId: string;
  razorpayOrderId: string;
  paymentMethod: 'razorpay';
  status: 'success' | 'pending' | 'failed';
  createdAt: Timestamp | Date;
}

/**
 * STEP 1: Create Razorpay Order
 * 
 * Called from frontend to get order_id.
 * The actual order creation happens on the backend with API keys.
 * 
 * @param amount Amount in INR (will be converted to paise on backend)
 * @param receipt Optional receipt ID
 * @param notes Optional metadata
 * @returns Order details including order_id
 */
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

/**
 * Load Razorpay Checkout Script
 * Must be called before opening checkout
 */
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

/**
 * Open Razorpay Checkout Modal
 * 
 * This opens the standard Razorpay payment form.
 * User payment details are entered directly in Razorpay's secure form.
 * 
 * @param orderId Razorpay Order ID
 * @param amount Amount in INR
 * @param userEmail User's email
 * @param userName User's name
 * @param onSuccess Callback after payment succeeds
 * @param onError Callback if payment fails
 */
export async function openRazorpayCheckout(
  orderId: string,
  amount: number,
  userEmail: string,
  userName: string,
  onSuccess: (paymentData: RazorpayPaymentData) => void,
  onError: (error: any) => void
): Promise<void> {
  try {
    // Ensure script is loaded
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    const Razorpay = (window as any).Razorpay;

    // Razorpay Checkout Options
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID, // Only KEY_ID, never KEY_SECRET
      order_id: orderId,
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      name: 'Shastika Global Impex',
      description: `Payment for Order ${orderId}`,
      image: '/logo.png', // Optional: Your company logo
      prefill: {
        email: userEmail,
        contact: '', // User can enter phone in checkout
        name: userName,
      },
      theme: {
        color: '#3b82f6', // Your brand color
      },
      // Handler: Called after user completes payment
      handler: (response: RazorpayPaymentData) => {
        console.log('✅ Payment captured:', response.razorpay_payment_id);
        onSuccess(response);
      },
      // Called if there's an error
      modal: {
        ondismiss: () => {
          onError(new Error('Payment cancelled by user'));
        },
      },
    };

    const razorpayCheckout = new Razorpay(options);

    // Handle payment errors from Razorpay
    razorpayCheckout.on('payment.failed', (response: any) => {
      console.error('❌ Payment failed:', response.error);
      onError(new Error(response.error.description || 'Payment failed'));
    });

    razorpayCheckout.open();
  } catch (error) {
    console.error('❌ Error opening checkout:', error);
    onError(error);
  }
}

/**
 * STEP 2: Verify Payment Signature on Backend
 * 
 * CRITICAL SECURITY STEP - This MUST be done on backend:
 * - Never verify signature on frontend
 * - Signature verification uses SECRET key (never expose to frontend)
 * - Backend compares HMAC signatures
 * 
 * @param paymentData Payment response from Razorpay
 * @returns Verification result
 */
export async function verifyRazorpayPayment(
  paymentData: RazorpayPaymentData
): Promise<RazorpayPaymentVerifyResponse> {
  try {
    if (!paymentData.razorpay_payment_id || !paymentData.razorpay_order_id || !paymentData.razorpay_signature) {
      throw new Error('Missing payment details');
    }

    const response = await fetch(`${PAYMENT_API}/api/razorpay/verify-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        razorpay_order_id: paymentData.razorpay_order_id,
        razorpay_payment_id: paymentData.razorpay_payment_id,
        razorpay_signature: paymentData.razorpay_signature,
      }),
    });

    if (!response.ok) {
      throw new Error(`Verification failed: ${response.status}`);
    }

    const result: RazorpayPaymentVerifyResponse = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Payment verification failed');
    }

    console.log('✅ Payment verified successfully');
    return result;
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    throw error;
  }
}

/**
 * Save verified payment to Firestore
 * Only called AFTER backend verification is successful
 */
export async function saveRazorpayPayment(
  paymentData: SavedPaymentData
): Promise<string> {
  try {
    const paymentRef = collection(db, 'payments');
    const docRef = await addDoc(paymentRef, {
      ...paymentData,
      createdAt: paymentData.createdAt instanceof Date
        ? Timestamp.fromDate(paymentData.createdAt)
        : paymentData.createdAt,
    });

    console.log('✅ Payment saved to Firestore:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error saving payment:', error);
    throw new Error('Failed to save payment record');
  }
}

/**
 * Complete Razorpay Payment Flow
 * 
 * This is the main function that orchestrates the entire payment process:
 * 1. Create Razorpay Order
 * 2. Open Razorpay Checkout
 * 3. Verify payment signature on backend
 * 4. Save payment to Firestore
 * 
 * Usage:
 * try {
 *   await processRazorpayPayment({
 *     amount: 5000,
 *     buyerId: 'user123',
 *     buyerEmail: 'user@example.com',
 *     buyerName: 'John Doe',
 *     productId: 'prod123',
 *   });
 * } catch (error) {
 *   console.error('Payment failed:', error);
 * }
 */
export async function processRazorpayPayment(options: {
  amount: number;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  productId?: string;
  customNotes?: Record<string, string>;
}): Promise<{ paymentId: string; orderId: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      const {
        amount,
        buyerId,
        buyerEmail,
        buyerName,
        productId,
        customNotes = {},
      } = options;

      console.log('🔄 Starting Razorpay payment process...');

      // Step 1: Create Razorpay Order on backend
      console.log('📦 Creating order...');
      const orderResponse = await createRazorpayOrder(
        amount,
        `receipt_${Date.now()}`,
        {
          buyerId,
          buyerEmail,
          productId: productId || 'general',
          ...customNotes,
        }
      );

      if (!orderResponse.success || !orderResponse.data?.order_id) {
        throw new Error('Failed to create Razorpay order');
      }

      const orderId = orderResponse.data.order_id;

      // Step 2: Open Razorpay Checkout Modal
      console.log('💳 Opening checkout...');
      await openRazorpayCheckout(
        orderId,
        amount,
        buyerEmail,
        buyerName,
        async (paymentData) => {
          try {
            console.log('✅ Payment capture successful, verifying...');

            // Step 3: Verify payment signature on backend
            const verifyResponse = await verifyRazorpayPayment(paymentData);

            if (!verifyResponse.success) {
              throw new Error('Payment verification failed');
            }

            // Step 4: Save payment to Firestore (only after verification)
            const paymentId = await saveRazorpayPayment({
              buyerId,
              buyerEmail,
              amount,
              razorpayPaymentId: paymentData.razorpay_payment_id,
              razorpayOrderId: paymentData.razorpay_order_id,
              paymentMethod: 'razorpay',
              status: 'success',
              createdAt: new Date(),
            });

            console.log('✅ Payment completed successfully');
            resolve({ paymentId, orderId: paymentData.razorpay_order_id });
          } catch (error) {
            console.error('❌ Payment verification failed:', error);
            reject(error);
          }
        },
        (error) => {
          console.error('❌ Checkout error:', error);
          reject(error);
        }
      );
    } catch (error) {
      console.error('❌ Payment process error:', error);
      reject(error);
    }
  });
}
