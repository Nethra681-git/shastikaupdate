# MIXED CONTENT FIX - COMPLETE ANDROID CONFIGURATION

## Problem Identified

```
Mixed Content: The page at 'https://localhost' was loaded over HTTPS, 
but requested an insecure resource 'http://192.168.1.25:5000/api/razorpay/create-order'. 
This request has been blocked.
```

## Root Cause Explanation

**Why `android:usesCleartextTraffic="true"` alone doesn't work:**

1. **App-level cleartext permission**: `usesCleartextTraffic="true"` tells the Android OS to allow the app to make HTTP requests
2. **WebView-level mixed content policy**: The WebView enforces strict mixed content security
   - Content loaded over HTTPS cannot request resources over HTTP
   - Capacitor's built-in server uses HTTPS
   - Even though backend is HTTP, WebView blocks it as "insecure"
3. **Solution**: Network security config explicitly whitelists HTTP domains

## Files Modified / Created

### 1. ✅ network_security_config.xml (NEW FILE)

**Location**: `android/app/src/main/res/xml/network_security_config.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Development: Allow HTTP traffic to local network IP -->
    <domain-config cleartextTrafficPermitted="true">
        <!-- Allow HTTP to local network IP addresses -->
        <domain includeSubdomains="true">192.168.1.25</domain>
        <domain includeSubdomains="true">192.168.0.0/24</domain>
        <domain includeSubdomains="true">10.0.0.0/8</domain>
        
        <!-- Android emulator special IPs -->
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
        <domain includeSubdomains="true">localhost</domain>
    </domain-config>
    
    <!-- Production: Only allow HTTPS for all other domains -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">example.com</domain>
    </domain-config>
</network-security-config>
```

**What it does:**
- Allows HTTP (cleartext) traffic to 192.168.1.25 and local IPs
- Restricts HTTPS for production domains
- Covers emulator IP (10.0.2.2) and localhost for development

### 2. ✅ AndroidManifest.xml (MODIFIED)

**Location**: `android/app/src/main/AndroidManifest.xml`

**Change**: Add `android:networkSecurityConfig` attribute to `<application>` tag

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <application
    android:allowBackup="true"
    android:icon="@mipmap/ic_launcher"
    android:label="@string/app_name"
    android:roundIcon="@mipmap/ic_launcher_round"
    android:supportsRtl="true"
    android:theme="@style/AppTheme"
    android:usesCleartextTraffic="true"
    android:networkSecurityConfig="@xml/network_security_config">
```

**Key addition**: `android:networkSecurityConfig="@xml/network_security_config"`

This tells Android to use the network security config file for all network requests.

### 3. ✅ capacitor.config.ts (MODIFIED)

**Location**: `capacitor.config.ts`

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.shastika.shastikaapp',
  appName: 'shastikaapp',
  webDir: 'dist',
  server: {
    // Allow HTTP requests from WebView
    allowNavigation: ['*'],
    androidScheme: 'http',
  },
  android: {
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
    },
  },
};

export default config;
```

**Key additions**:
- `server.androidScheme: 'http'` - Load WebView content over HTTP instead of HTTPS
- `android.allowMixedContent: true` - Explicitly allow mixed content in WebView
- `server.allowNavigation: ['*']` - Allow navigation to any domain

---

## Exact Build & Deployment Steps

### Step 1: Verify Files Are In Place

```powershell
# Check network security config exists
Test-Path "android\app\src\main\res\xml\network_security_config.xml"
# Output: True

# Check AndroidManifest.xml has the new attribute
Select-String "networkSecurityConfig" "android\app\src\main\AndroidManifest.xml"
# Output: android:networkSecurityConfig="@xml/network_security_config"
```

### Step 2: Build Frontend

```powershell
npm run build
```

Expected output:
```
✓ 2127 modules transformed.
✓ built in 4.90s
dist/index.html                                    1.36 kB
```

### Step 3: Sync to Android Project

```powershell
npx cap sync android
```

Expected output:
```
✅ Synced Android project
```

### Step 4: Update Android Studio Project Files

```powershell
npx cap build android
```

This regenerates the native Android project files.

### Step 5: Open in Android Studio

```powershell
npx cap open android
```

Android Studio will open with the updated project.

### Step 6: Android Studio Build (UI)

In Android Studio:

1. **File** → **Sync Now** (or let it auto-sync)
   ```
   Gradle: Downloading gradle-8.x.x
   Gradle sync completed
   ```

2. **Build** → **Clean Project**
   ```
   Clean build successful
   ```

3. **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
   ```
   Build APK(s)
   Executing tasks: [clean, :app:buildDebug]
   ✓ Build completed successfully
   ```

4. **Run** → **Run 'app'** (or click green Play button)
   - Select your connected device
   - App will install and launch

### Step 7: Verify Installation

Once app is running on device:

```powershell
# Check app logs for network activity
adb logcat | Select-String "192.168.1.25"
# Should show successful fetch attempts
```

---

## Why This Configuration Works

| Component | Before | After | Result |
|-----------|--------|-------|--------|
| **App-level cleartext** | `usesCleartextTraffic="true"` | ✓ Still there | Allows HTTP requests |
| **WebView mixed content** | Not configured | `allowMixedContent: true` | Allows HTTP from HTTPS page |
| **Network security config** | Not defined | Explicit whitelist of 192.168.1.25 | HTTP allowed to specific IPs |
| **WebView scheme** | HTTPS (default) | `androidScheme: 'http'` | Content loaded over HTTP |
| **Navigation allowlist** | Restricted | `allowNavigation: ['*']` | Can fetch from any domain |

---

## What Each Setting Does

### `android:networkSecurityConfig="@xml/network_security_config"`
- References the network security config file
- Applies cleartext permission rules to app-wide network traffic
- Domain-specific rules override global `usesCleartextTraffic`

### `android:allowMixedContent: true`
- Capacitor-specific setting
- Tells Capacitor's WebView to allow mixed content (HTTPS page → HTTP resources)

### `server.androidScheme: 'http'`
- Loads the local WebView content (your app) over HTTP
- Eliminates "HTTPS page" → "HTTP backend" conflict
- Safe because it's localhost on a private network

### `allowNavigation: ['*']`
- Allows the app to navigate to and fetch from any domain
- Required for reaching backend at 192.168.1.25

---

## Testing the Configuration

### Test 1: App Loads Without Errors

Open app on Android device:
- Should show no console errors
- Should not see "Mixed Content" errors in logs
- `adb logcat | grep -i "mixed"` should return nothing

### Test 2: Backend Connectivity

From within the app:
1. Navigate to Products page
2. Click "Add to Cart"
3. Go to Checkout
4. Click "Pay with Razorpay"
5. Razorpay order creation should succeed

Check server logs (should see):
```
📦 Creating Razorpay order: { amount: 50, currency: 'INR' }
✅ Order created: order_T2Fck4RmXsNeEk
```

### Test 3: Check Logs

```powershell
adb logcat | Select-String "192.168.1.25|Order created|fetch"

# Should show:
# fetch to 192.168.1.25:5000 succeeded
# Order ID received
# No "Mixed Content" errors
```

---

## Complete File Locations

```
project-root/
├── capacitor.config.ts ...................... [MODIFIED]
├── android/
│   └── app/src/main/
│       ├── AndroidManifest.xml ............ [MODIFIED - added networkSecurityConfig]
│       └── res/xml/
│           └── network_security_config.xml ... [NEW FILE]
```

---

## Troubleshooting

### Still getting "Mixed Content" error?

**Check 1: Verify network_security_config.xml exists**
```powershell
Test-Path "android\app\src\main\res\xml\network_security_config.xml"
# Must return True
```

**Check 2: Verify AndroidManifest.xml has reference**
```powershell
Select-String "networkSecurityConfig" "android\app\src\main\AndroidManifest.xml"
# Must show: android:networkSecurityConfig="@xml/network_security_config"
```

**Check 3: Verify capacitor.config.ts has settings**
```powershell
Select-String "allowMixedContent|androidScheme" "capacitor.config.ts"
# Must show both settings
```

**Check 4: Clean build**
```powershell
# In Android Studio
Build → Clean Project
Build → Rebuild Project
```

**Check 5: Uninstall and reinstall app**
```powershell
adb uninstall com.shastika.shastikaapp
npx cap run android  # or use Android Studio to rebuild and reinstall
```

### "Address already in use" error?

Port 5000 still has a process:
```powershell
netstat -ano | findstr 5000
taskkill /PID <PID> /F
npm start  # restart in server/
```

### Device can't reach 192.168.1.25?

```powershell
# From device
adb shell ping 192.168.1.25
# If no response: both must be on same WiFi network
```

---

## Final Verification Checklist

- [ ] `network_security_config.xml` created in `res/xml/`
- [ ] `AndroidManifest.xml` has `android:networkSecurityConfig` attribute
- [ ] `capacitor.config.ts` has `allowMixedContent: true`
- [ ] `capacitor.config.ts` has `androidScheme: 'http'`
- [ ] `npm run build` completes successfully
- [ ] `npx cap sync android` completes successfully
- [ ] `npx cap build android` completes successfully
- [ ] Android Studio builds APK without errors
- [ ] App installs on device without errors
- [ ] App opens and shows UI without console errors
- [ ] No "Mixed Content" errors in `adb logcat`
- [ ] Payment flow reaches backend (check server logs)
- [ ] Razorpay order created successfully

✅ **All files are now in place. Ready to build and test!**
