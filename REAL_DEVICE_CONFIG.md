# REAL DEVICE DEPLOYMENT - CONFIGURATION GUIDE
# ============================================================================
# This file contains the exact configuration needed for real Android device
# testing on your local network.
#
# WHY THIS IS NEEDED:
# - Android emulator uses 10.0.2.2 to reach localhost (special address)
# - Real Android devices cannot use 10.0.2.2 or localhost
# - Real device must use the actual IP address of the PC running the backend
#
# ============================================================================
# QUICK START FOR REAL ANDROID DEVICE
# ============================================================================
#
# 1. Find your PC's IP address on the network:
#    Windows: Open Command Prompt and run: ipconfig
#    Mac/Linux: Open Terminal and run: ifconfig
#    Look for IPv4 Address like 192.168.1.25
#
# 2. Create .env.local in the project root:
#    VITE_PAYMENT_API_URL=http://192.168.1.25:5000
#    VITE_SOCKET_URL=http://192.168.1.25:5000
#    (Replace 192.168.1.25 with your actual IP)
#
# 3. Start the backend:
#    cd server && npm start
#
# 4. Ensure both PC and Android device are on the SAME NETWORK
#
# 5. Build and run app on real device:
#    npx cap build android
#    npx cap open android
#
# ============================================================================
# TROUBLESHOOTING
# ============================================================================
#
# "TypeError: Failed to fetch" when paying on real device?
#   → VITE_PAYMENT_API_URL is not set or uses wrong IP
#   → Verify: Device can ping the PC (adb shell ping 192.168.1.25)
#
# Works on emulator but not real device?
#   → Emulator uses 10.0.2.2, real device needs actual PC IP
#   → Check .env.local has VITE_PAYMENT_API_URL with your PC's IP
#
# Backend responds but app doesn't get response?
#   → Check CORS in server/server.js includes device's webview origin
#   → Device might be on different network - must be on same LAN
#
# ============================================================================
# FILE LOCATIONS
# ============================================================================
# - Frontend config (VITE_* env vars): .env.local
# - Backend config (Node.js env vars): server/.env
# - CORS settings: server/server.js lines 39-47
# - Payment API URL: src/lib/razorpayService.ts line 8
# - Socket URL: src/lib/socketService.ts line 5
#
# ============================================================================
