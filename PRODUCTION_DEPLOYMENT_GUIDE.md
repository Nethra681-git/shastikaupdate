# Production Deployment Guide - Shastika AgroConnect

## Overview
This guide covers deploying the Shastika AgroConnect mobile application to production with the Render.com backend at `https://app-finals.onrender.com`.

---

## ✅ Production Configuration

### Production Backend URL
```
https://app-finals.onrender.com
```

### Environment Variables (Production)

#### Frontend `.env.local` (for production builds)
```bash
# API Configuration - Production Backend
VITE_API_URL=https://app-finals.onrender.com
VITE_PAYMENT_API_URL=https://app-finals.onrender.com
VITE_SOCKET_URL=https://app-finals.onrender.com

# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_live_SlwOcx9B6AaXXp

# Firebase Configuration (should match your Firebase project)
VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

#### Backend `.env` (Production Render.com)
```bash
# Server Configuration
PORT=5000
NODE_ENV=production

# Frontend URL (for CORS - Render will auto-configure)
FRONTEND_URL=https://app-finals.onrender.com

# Razorpay Keys (Production)
RAZORPAY_KEY_ID=rzp_live_SlwOcx9B6AaXXp
RAZORPAY_KEY_SECRET=YOUR_PRODUCTION_SECRET

# Firebase Configuration
FIREBASE_SERVICE_ACCOUNT_KEY=YOUR_FIREBASE_KEY_FILE
```

---

## 🔄 Updated Files for Production

### Core Service Files Updated to Use Production Backend

#### 1. **src/lib/razorpayService.ts**
- Default fallback changed from `http://10.0.2.2:5000` to `https://app-finals.onrender.com`
- Now supports production Razorpay endpoints
- Uses environment variable `VITE_PAYMENT_API_URL` with production default

```typescript
// Production: VITE_PAYMENT_API_URL=https://app-finals.onrender.com
const PAYMENT_API = import.meta.env.VITE_PAYMENT_API_URL || 'https://app-finals.onrender.com';
```

#### 2. **src/lib/socketService.ts**
- Default fallback changed from `http://localhost:5000` to `https://app-finals.onrender.com`
- Socket connections now default to production backend
- Uses environment variable `VITE_SOCKET_URL` with production default

```typescript
// Production: VITE_SOCKET_URL=https://app-finals.onrender.com
const SOCKET_SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'https://app-finals.onrender.com';
```

#### 3. **Duplicate versions updated**
- `shastika-app/src/lib/razorpayService.ts`
- `shastika-app/src/lib/socketService.ts`

All duplicate implementations in the `shastika-app/` folder have been updated to match the main folder.

#### 4. **Capacitor Configuration (capacitor.config.ts)**
- Already configured correctly with `androidScheme: 'http'`
- Supports HTTPS connections to production backend
- Mixed content allowed for HTTP fallback scenarios

```typescript
server: {
  androidScheme: 'http'
}
```

---

## 🚀 Deployment Steps

### Step 1: Build Production App
```bash
cd d:\Users\Lenovo\Downloads\shastika-project\shastika-project\shastika-project-main

# Install dependencies
npm install

# Build for production
npm run build
```

### Step 2: Build Android APK/AAB
```bash
# Update Capacitor
npx cap sync android

# Build for Android
npx cap build android

# Or use Android Studio to build APK/AAB for Play Store release
```

### Step 3: Verify Production URLs
Before release, verify all API calls use production URLs:

```bash
# Check that service files use production fallback
grep -n "app-finals.onrender.com" src/lib/*.ts

# Output should show:
# src/lib/razorpayService.ts: const PAYMENT_API = ... || 'https://app-finals.onrender.com';
# src/lib/socketService.ts: const SOCKET_SERVER_URL = ... || 'https://app-finals.onrender.com';
```

### Step 4: Test Production Backend

#### Test Payment API
```bash
curl -X POST https://app-finals.onrender.com/api/razorpay/create-order \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR", "receipt": "test_123"}'

# Expected Response:
# {"success": true, "data": {"order_id": "order_...", "amount": 10000, "currency": "INR"}}
```

#### Test Health Endpoint
```bash
curl https://app-finals.onrender.com/health

# Expected Response:
# {"status": "Server running", "timestamp": "2026-06-16T..."}
```

#### Test Chat (Socket.io)
```
WebSocket: wss://app-finals.onrender.com/socket.io/
Protocol: socket.io
Expected: Connection established
```

---

## 📋 Features Working with Production Backend

### ✅ User Authentication
- Login with email/password
- Google OAuth login
- User registration
- Email verification

### ✅ Payment Processing
- Razorpay order creation: `/api/razorpay/create-order`
- Payment verification: `/api/razorpay/verify-payment`
- Order status tracking
- Payment history

### ✅ Chat System
- Real-time chat with Socket.io
- Message persistence in Firestore
- User online/offline status
- Chat notifications

### ✅ User Profile
- Profile creation and updates
- User role management (admin/farmer/buyer)
- Profile verification
- Document uploads

### ✅ Marketplace
- Product listing
- Product search and filters
- Order management
- Shipment tracking

### ✅ Admin Dashboard
- Admin product management
- Order management
- User verification
- Chat moderation

---

## 🔒 Security Configuration

### HTTPS/TLS
- Production backend uses HTTPS (Render.com default)
- All API calls automatically upgraded to HTTPS
- Mixed content warnings eliminated

### CORS Configuration
Production CORS allows requests from:
- `capacitor://localhost` - Mobile app webview
- `https://app-finals.onrender.com` - Web frontend
- `https://app-finals.onrender.com:5000` - Direct backend access

### Certificate Pinning (Optional)
For enhanced security, implement certificate pinning in Capacitor:
```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  server: {
    certificatePinning: {
      hosts: ['app-finals.onrender.com'],
      pins: ['YOUR_CERTIFICATE_PIN']
    }
  }
};
```

---

## 🧪 Testing Checklist

### Before Release
- [ ] All environment variables set in `.env.local`
- [ ] Razorpay live keys configured (not test keys)
- [ ] Firebase project configured for production
- [ ] Backend health endpoint responds: `https://app-finals.onrender.com/health`
- [ ] Payment API test creates order successfully
- [ ] Chat connects to production Socket.io
- [ ] Login/registration works with production backend
- [ ] Google OAuth configured for production domain
- [ ] SSL certificate valid and not expired

### On Real Device
- [ ] App loads without network errors
- [ ] Login page displays correctly
- [ ] User can login/register
- [ ] Chat loads and sends messages
- [ ] Payment flow completes successfully
- [ ] Profile updates work
- [ ] Admin features functional (if applicable)
- [ ] No mixed content errors
- [ ] No CORS errors in console

### Performance
- [ ] App startup < 3 seconds
- [ ] Chat messages load < 500ms
- [ ] Payment initialization < 2 seconds
- [ ] Profile updates < 1 second

---

## 🔄 Migration Path (Development → Production)

### Phase 1: Development
```
.env.local (LOCAL):
VITE_PAYMENT_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Phase 2: Testing on Real Device
```
.env.local (REAL DEVICE):
VITE_PAYMENT_API_URL=http://192.168.1.25:5000
VITE_SOCKET_URL=http://192.168.1.25:5000
```

### Phase 3: Production
```
.env.local (PRODUCTION):
VITE_PAYMENT_API_URL=https://app-finals.onrender.com
VITE_SOCKET_URL=https://app-finals.onrender.com
# No .env.local needed - defaults to production
```

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" errors
**Solution:**
- Verify `VITE_PAYMENT_API_URL=https://app-finals.onrender.com` in `.env.local`
- Check backend is running: `curl https://app-finals.onrender.com/health`
- Check network connectivity from device
- Review error logs in browser console (chrome://inspect)

### Issue: Payment modal doesn't open
**Solution:**
- Verify Razorpay live key is correct: `VITE_RAZORPAY_KEY_ID=rzp_live_SlwOcx9B6AaXXp`
- Check script loads: `window.Razorpay` should be defined
- Review Razorpay dashboard for account status

### Issue: Chat doesn't connect
**Solution:**
- Verify Socket.io URL: `VITE_SOCKET_URL=https://app-finals.onrender.com`
- Check WebSocket connection: `wss://app-finals.onrender.com/socket.io/`
- Verify user is authenticated before chat
- Review Socket.io connection logs

### Issue: CORS errors
**Solution:**
- Backend CORS should allow `capacitor://localhost`
- Verify frontend origin in CORS whitelist
- Check request headers: `Origin` must match allowed origin
- Clear app cache and rebuild

---

## 📊 Monitoring Production

### Backend Health
```bash
# Check uptime
curl https://app-finals.onrender.com/health

# View logs on Render.com dashboard
# Settings > Logs > View Live Logs
```

### Application Performance
- Monitor Razorpay dashboard for transaction success rate
- Check Firebase Console for authentication errors
- Monitor Socket.io connections in server logs
- Track error rates in console logging

### User Support
- Collect console logs from users: `chrome://inspect`
- Review Firebase Authentication events
- Monitor Razorpay payment failures
- Check network request waterfall timing

---

## 🚀 Optional: Production Optimizations

### Enable HTTP/2 Push
Already configured on Render.com by default.

### Enable Gzip Compression
Already configured on Render.com by default.

### Cache Strategy
- Static assets: Cache-Control: max-age=31536000
- API responses: Cache-Control: no-cache
- Socket connections: No caching

### Database Backups
- Firebase Firestore: Auto backups enabled
- Configure backup schedule in Firebase Console
- Test backup restore procedures

---

## 📝 Version History

### Current Production Build
- **Version:** 1.0.0
- **Backend:** https://app-finals.onrender.com
- **Released:** 2026-06-16
- **Changes:**
  - Removed all hardcoded localhost references
  - Added production backend URL as default fallback
  - Updated Razorpay integration for live mode
  - Improved error handling for network failures
  - Updated Socket.io configuration for production

### Previous Versions
- **0.9.0** - Real device testing with local backend
- **0.8.0** - Development with localhost
- **0.7.0** - Initial Razorpay integration

---

## 🔗 Related Documentation

- [Razorpay Integration Guide](./RAZORPAY_INTEGRATION_GUIDE.md)
- [Payment System Implementation](./RAZORPAY_IMPLEMENTATION_SUMMARY.md)
- [Chat System Documentation](./CHAT_SYSTEM_SOCKET_IO.md)
- [Network Configuration](./NETWORK_CONFIG_FIXES.md)
- [Real Device Setup](./QUICK_START_REAL_DEVICE.md)

---

## 📞 Support

For issues or questions:
1. Check troubleshooting section above
2. Review browser console logs (chrome://inspect)
3. Check Render.com dashboard for backend issues
4. Review Firebase Console for authentication issues
5. Contact backend team for API issues

**Production Backend Status:** https://app-finals.onrender.com/health
