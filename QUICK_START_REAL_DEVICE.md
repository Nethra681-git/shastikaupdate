# QUICK START: Real Device Testing (5 Minutes)

## Step 1: Find Your PC IP (1 min)

**Windows:**
1. Press `Win + R`, type `cmd`, press Enter
2. Type: `ipconfig`
3. Find line with "IPv4 Address" like `192.168.1.25`

**Mac:**
1. Open Terminal
2. Type: `ifconfig`
3. Look for `inet 192.168.x.x` (not starting with 127)

**Linux:**
1. Open Terminal
2. Type: `ifconfig` or `ip addr`
3. Look for `inet 192.168.x.x` or `10.0.x.x`

👉 **Remember this IP!** You'll use it in the next step.

---

## Step 2: Create Configuration File (1 min)

Create a new file named `.env.local` in the project root folder:

```
VITE_PAYMENT_API_URL=http://192.168.1.25:5000
VITE_SOCKET_URL=http://192.168.1.25:5000
VITE_RAZORPAY_KEY_ID=rzp_test_SbjI2zHHlox9vn
```

⚠️ **Replace `192.168.1.25` with YOUR IP from Step 1**

---

## Step 3: Start Backend (1 min)

```bash
cd server
npm install  # Only if not already installed
npm start
```

You should see:
```
✅ Server running on http://localhost:5000
```

---

## Step 4: Test Network Connectivity (1 min)

Open a new terminal and run:

```bash
adb shell ping 192.168.1.25
```

You should see responses like:
```
64 bytes from 192.168.1.25: icmp_seq=1 ttl=64 time=5.2ms
```

If not working:
- ❌ Device might be on different network
- ❌ Check WiFi connection (must be same network as PC)
- ❌ Check firewall settings

---

## Step 5: Build and Deploy (1 min)

```bash
npm run build
npx cap build android
npx cap open android
```

Or manually open Android Studio and build from there.

---

## Step 6: Test Payment (2-3 min on device)

1. Open app on Android device
2. Go to Products page
3. Add item to cart
4. Go to checkout
5. Click **"Pay with Razorpay"**
6. Should open Razorpay checkout WITHOUT "Failed to fetch" error

✅ **Success!** Payment is now configured for real device.

---

## If Something Goes Wrong

### Still seeing "Failed to fetch"?
```bash
# Check .env.local exists and has VITE_PAYMENT_API_URL
cat .env.local

# Verify backend is running
# In server/ folder, should see "Server running on port 5000"

# Test network from device
adb shell ping 192.168.1.25
# Should see: "icmp_seq=1... bytes from 192.168.1.25"
```

### Getting "Backend API URL not configured"?
- `.env.local` file is missing or not in right location
- Create it in the PROJECT ROOT (not in src/)
- File must be named `.env.local` (with the dot)
- Must have `VITE_PAYMENT_API_URL=http://192.168.1.25:5000` line

### Works on emulator but not real device?
- This is EXPECTED difference
- Emulator uses special IP: `10.0.2.2`
- Real device needs actual network IP: `192.168.1.x`
- Check `.env.local` has correct IP

### Device can't ping PC?
- Both must be on same WiFi network
- Check if connected to same WiFi SSID
- Check if firewall blocks pings (Windows: disable temporarily for test)
- Try IP of your router + test from there

---

## Verification Checklist

- [ ] PC IP found from `ipconfig` or `ifconfig`
- [ ] `.env.local` created in project root
- [ ] `VITE_PAYMENT_API_URL=http://YOUR_IP:5000` with YOUR IP
- [ ] `npm start` running in server/ folder
- [ ] Device can `ping` your PC IP successfully
- [ ] App built and running on real device
- [ ] No "Backend API URL not configured" error in app
- [ ] Razorpay payment form opens without error
- [ ] Payment succeeds or shows error from Razorpay (not network error)

---

## Common IPs

- **Windows Private Network:** 192.168.x.x or 10.x.x.x
- **Mac Private Network:** 192.168.x.x or 10.x.x.x
- **Emulator Special IP:** 10.0.2.2 (for reaching host from emulator)
- **Real Device:** Cannot use 10.0.2.2 or 127.0.0.1
- **Same Device:** Cannot use localhost (use 192.168.x.x)

---

## File Locations

If you need to modify files later:
- **Payment API URL:** `src/lib/razorpayService.ts` line 8
- **Order Page:** `src/pages/OrderPage.tsx` line 122
- **Socket URL:** `src/lib/socketService.ts` line 5
- **Backend CORS:** `server/server.js` lines 39-53
- **Environment:** `.env.local` (created in Step 2)

---

## Support

If still stuck:
1. Check `NETWORK_CONFIG_FIXES.md` for detailed troubleshooting
2. Check `REAL_DEVICE_CONFIG.md` for configuration guide
3. Look at backend logs: `npm start` output in server/ folder
4. Check app logs: Browser DevTools or `adb logcat`

Good luck! 🎉
