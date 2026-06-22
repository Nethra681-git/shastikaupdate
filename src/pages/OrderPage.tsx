import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '@/lib/store';
import { auth } from '@/lib/firebase'; // ✅ auth import
import { generateInvoice } from '@/lib/invoice';
import { loadRazorpayScript } from '@/lib/razorpayService';
import { ChevronLeft, Download, Truck, QrCode, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = '9789090920@okbizaxis';
const COMPANY_NAME = 'Shastika Global Impex Pvt Ltd';

const OrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, currentUser, addOrder, addNotification, markOrderPaymentComplete, addPayment } = useStore();
  const product = products.find(p => p.id === id);
  const [quantity, setQuantity] = useState(1);
  const [marketType, setMarketType] = useState<'domestic' | 'international'>('domestic');
  const [shippingMethod, setShippingMethod] = useState<'sea' | 'air'>('sea');
  const [step, setStep] = useState<'details' | 'payment' | 'confirmed'>('details');
  const [orderId, setOrderId] = useState('');
  const [txnId, setTxnId] = useState('');

  if (!product || !currentUser) return <div className="text-center py-20 text-muted-foreground">Not available</div>;

  const price = marketType === 'domestic' ? product.domesticPrice : product.exportPrice;
  const total = price * quantity;
  const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(COMPANY_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

  const handleProceedToPayment = () => {
    const oid = `ORD-${Date.now()}`;

    // ✅ KEY FIX: Firebase Auth UID use பண்றோம் — Firestore-ல் store ஆன buyerId-உடன் match ஆகும்
    const firebaseUid = auth.currentUser?.uid || currentUser.id;

    const order = {
      id: oid,
      productId: product.id,
      productName: product.name,
      quantity,
      price,
      total,
      buyerId: firebaseUid, // ✅ Firebase Auth UID
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: currentUser.phone,
      farmerName: product.farmerName,
      paymentMethod: 'upi' as const,
      shipmentStatus: 'placed' as const,
      shippingMethod,
      destinationCountry: currentUser.country,
      orderDate: new Date().toLocaleDateString(),
      marketType,
      farmerAcceptStatus: 'pending' as const,
      paymentCompleted: false,
    };

    addOrder(order);
    setOrderId(oid);

    // Notify farmer
    addNotification({
      id: `n${Date.now()}`,
      title: 'புதிய ஆர்டர் வந்தது! 🛒',
      message: `புதிய ஆர்டர் வந்தது: ${product.name}, ${quantity} ${product.unit}. விவரங்களை பார்க்க அப்பை திறக்கவும்.`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['farmer'],
    });

    // Notify admin
    addNotification({
      id: `n${Date.now() + 1}`,
      title: 'New Order Placed',
      message: `${currentUser.name} placed order for ${product.name} (${quantity} ${product.unit}) — ₹${total.toLocaleString()}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin'],
    });

    setStep('payment');
  };

  const handlePaymentDone = () => {
    if (!txnId.trim()) return;

    const firebaseUid = auth.currentUser?.uid || currentUser.id; // ✅

    markOrderPaymentComplete(orderId);
    addPayment({
      id: `PAY-${Date.now()}`,
      orderId,
      buyerId: firebaseUid, // ✅ Firebase Auth UID
      buyerName: currentUser.name,
      buyerEmail: currentUser.email,
      buyerPhone: currentUser.phone,
      amount: total,
      method: 'upi',
      transactionId: txnId.trim(),
      utrNumber: txnId.trim(),
      bankName: 'UPI',
      status: 'pending',
      timestamp: new Date().toLocaleString(),
      adminNote: '',
    });

    addNotification({
      id: `n${Date.now() + 2}`,
      title: 'Payment Received',
      message: `${currentUser.name} paid ₹${total.toLocaleString()} via UPI for order ${orderId}. UTR: ${txnId.trim()}`,
      timestamp: new Date().toLocaleString(),
      read: false,
      targetRoles: ['admin'],
    });

    setStep('confirmed');
  };

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
        alert(
          'Backend API URL not configured.\n\n' +
          'For real Android device:\n' +
          'VITE_PAYMENT_API_URL=http://192.168.1.25:5000\n\n' +
          'For Android emulator:\n' +
          'VITE_PAYMENT_API_URL=http://10.0.2.2:5000'
        );
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

      console.log('\n[RAZORPAY] Step 4: Fetching order from backend');
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      }).catch(err => {
        // Handle network/CORS errors
        console.error('[RAZORPAY] Network/CORS Error:', err.message);
        throw new Error(`Network Error: ${err.message}. Make sure the backend server is running and CORS is configured.`);
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
      
      // Enhanced error message
      let errorMessage = (error as any)?.message || String(error);
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
        errorMessage = 'Payment API is not accessible. The backend server may be down or CORS is not configured. Please try again later.';
      } else if (errorMessage.includes('Network Error')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      }
      
      alert(`Payment Error: ${errorMessage}`);
    }
  };

  // Step 3: Confirmed
  if (step === 'confirmed') {
    return (
      <div className="w-full max-w-lg mx-auto text-center space-y-6 animate-fade-in mb-20">
        <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10 text-success" />
        </div>
        <h1 className="text-2xl font-bold text-foreground">Order Confirmed! ✅</h1>
        <p className="text-muted-foreground">Order ID: <span className="font-mono text-primary">{orderId}</span></p>
        <p className="text-sm text-muted-foreground">Your payment is being verified. The farmer will be notified to accept your order.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button onClick={() => { const order = useStore.getState().orders.find(o => o.id === orderId); if (order) generateInvoice(order); }}
            className="flex items-center gap-2 gradient-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:opacity-90 transition">
            <Download className="w-4 h-4" /> Download Invoice
          </button>
          <button onClick={() => navigate('/shipment')} className="flex items-center gap-2 border border-input px-6 py-3 rounded-lg font-medium text-foreground hover:bg-muted transition">
            <Truck className="w-4 h-4" /> Track Shipment
          </button>
        </div>
        <button onClick={() => navigate('/marketplace')} className="text-sm text-primary hover:underline">Continue Shopping</button>
      </div>
    );
  }

  // Step 2: UPI Payment
  if (step === 'payment') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in mb-20">
        <button onClick={() => setStep('details')} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="text-2xl font-bold text-foreground">Pay via UPI</h1>

        <div className="glass-card rounded-xl p-6 space-y-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary">
            <QrCode className="w-5 h-5" />
            <span className="font-semibold text-lg">Scan & Pay</span>
          </div>
          <div className="bg-white rounded-xl p-4 inline-block mx-auto border border-border">
            <QRCodeSVG value={upiLink} size={200} level="H" includeMargin />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">UPI ID:</p>
            <p className="font-mono font-bold text-lg text-foreground">{UPI_ID}</p>
          </div>
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-sm text-muted-foreground">Amount to Pay</p>
            <p className="text-3xl font-bold text-primary">₹{total.toLocaleString()}</p>
          </div>
          <div className="bg-muted rounded-lg p-3 text-left space-y-1">
            <p className="text-sm font-semibold text-foreground">📱 Payment Instructions:</p>
            <p className="text-xs text-muted-foreground">1. Open any UPI app (Google Pay, PhonePe, Paytm)</p>
            <p className="text-xs text-muted-foreground">2. Scan the QR code above OR enter UPI ID manually</p>
            <p className="text-xs text-muted-foreground">3. Enter amount ₹{total.toLocaleString()} and complete payment</p>
            <p className="text-xs text-muted-foreground">4. Copy the Transaction ID / UTR number</p>
            <p className="text-xs text-muted-foreground">5. Paste it below and click confirm</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-foreground">Confirm Your Payment</h3>
          <div>
            <label className="text-sm font-medium text-foreground">Transaction ID / UTR Number *</label>
            <input className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Enter your UPI transaction reference" value={txnId} onChange={e => setTxnId(e.target.value)} />
          </div>
          <button onClick={handlePaymentDone} disabled={!txnId.trim()}
            className={`w-full py-3 rounded-lg font-medium transition ${txnId.trim() ? 'gradient-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
            ✅ I Have Paid — Confirm Order
          </button>
        </div>

        <div className="text-center text-sm text-muted-foreground py-2">OR</div>

        <div className="glass-card rounded-xl p-6">
          <button onClick={handleRazorpay}
            className="w-full py-3 px-4 rounded-lg font-medium transition bg-[#1f41a0] text-white hover:opacity-90 flex items-center justify-center gap-2">
            💳 Pay with Razorpay
          </button>
        </div>
      </div>
    );
  }

  // Step 1: Order Details
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-fade-in mb-20">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-foreground">Place Order</h1>

      <div className="glass-card rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-4 pb-4 border-b border-border">
          <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground truncate">{product.farmerName} • {product.location}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-foreground">Quantity ({product.unit})</label>
            <input type="number" min={1}
              className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/30"
              value={quantity} onChange={e => setQuantity(Math.max(1, +e.target.value))} />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground">Market Type</label>
            <select className="w-full mt-1 px-3 py-2 border border-input rounded-lg bg-background text-foreground outline-none"
              value={marketType} onChange={e => setMarketType(e.target.value as any)}>
              <option value="domestic">Domestic</option>
              <option value="international">International</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground">Shipping Method</label>
          <div className="flex gap-3 mt-1">
            {(['sea', 'air'] as const).map(m => (
              <button key={m} onClick={() => setShippingMethod(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${shippingMethod === m ? 'border-primary bg-primary/10 text-primary' : 'border-input text-foreground hover:bg-muted'}`}>
                {m === 'sea' ? '🚢 Sea Way' : '✈️ Air Way'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-accent/10 border border-accent/30 rounded-lg p-3">
          <p className="text-sm font-medium text-accent-foreground">📱 Payment Method: <span className="font-bold">UPI Only</span></p>
          <p className="text-xs text-muted-foreground mt-1">After placing the order, you'll scan a QR code or use UPI ID to complete payment.</p>
        </div>

        <div className="bg-muted rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Amount</p>
            <p className="text-2xl font-bold text-primary">₹{total.toLocaleString()}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>₹{price}/{product.unit} × {quantity}</p>
          </div>
        </div>

        <button onClick={handleProceedToPayment}
          className="w-full py-3 rounded-lg font-medium transition gradient-primary text-primary-foreground hover:opacity-90">
          Proceed to Payment →
        </button>
      </div>
    </div>
  );
};

export default OrderPage;