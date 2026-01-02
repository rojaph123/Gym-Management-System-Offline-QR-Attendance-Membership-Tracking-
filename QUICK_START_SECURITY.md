# Quick Start Guide - Security Features

## New Security Features Summary

Your Powerlift Tracker app now has **three powerful security features** to protect your data:

---

## 🔒 Feature 1: Return-to-Home PIN Protection
**What it does**: Forces you to enter your PIN every time you switch back to the app from another app or home screen.

**Why**: Prevents unauthorized people from accessing your gym's data if they pick up your device.

**How to test**:
1. Log in with your PIN
2. Press the home button (or swipe to another app)
3. Open the Powerlift app again
4. → You'll see the PIN screen again ✓

---

## ⏱️ Feature 2: 2-Minute Inactivity Auto-Logout
**What it does**: If you don't touch the screen for **2 minutes**, a countdown warning appears giving you 10 seconds to confirm you're still there.

**Why**: Automatically logs you out if you leave your device unattended, protecting against data theft.

**How to test**:
1. Log in with your PIN
2. Don't touch the screen at all
3. After 2 minutes → A modal pops up with a 10-second countdown
4. If you don't tap "I'm Still Here" → You're logged out
5. → PIN screen appears ✓

---

## 👆 Feature 3: Touch Detection Resets Timer
**What it does**: Every time you tap, swipe, or interact with the screen, the **2-minute timer resets**.

**Why**: You can work uninterrupted - the auto-logout only happens if you're truly not using the app.

**How to test**:
1. Log in
2. Tap or scroll through the app regularly
3. The inactivity warning should NEVER appear (timer keeps resetting)
4. → Auto-logout only happens during true inactivity ✓

---

## 🌐 Feature 4: Complete Offline Support
**What it does**: The app works **100% offline** - all your data is stored locally on your device.

**Why**: No internet required. Your gym data is always accessible.

**How to test**:
1. Turn on airplane mode
2. Use the app normally (add members, log attendance, etc.)
3. Everything works perfectly
4. → No internet? No problem! ✓

---

## ⚙️ Configuration

### Want to change the 2-minute timeout?

Edit this file: `client/components/SessionManager.tsx`

Look for these lines:
```typescript
const IDLE_TIME = 2 * 60 * 1000;      // 2 minutes
const COUNTDOWN_SECONDS = 10;          // 10 second warning
```

**Examples**:
- 5 minutes: `const IDLE_TIME = 5 * 60 * 1000;`
- 30 seconds: `const IDLE_TIME = 30 * 1000;`
- 15-second countdown: `const COUNTDOWN_SECONDS = 15;`

Then redeploy the app.

---

## 🚀 Using These Features

### During Normal Operation:
1. ✓ Use the app normally while authenticated
2. ✓ The 2-minute timer runs in the background
3. ✓ Your touches automatically reset the timer
4. ✓ No interruptions while actively using the app

### For Security:
1. When done, navigate to another app (or press home)
2. The timer stops and data is protected
3. When you return, PIN is required
4. Even if someone picks up your device during inactivity, it auto-logs out

### For Offline Work:
1. Enable airplane mode if desired
2. All features work normally
3. Data saved locally persists
4. When connectivity returns, everything syncs

---

## 💡 Tips & Best Practices

**✓ DO:**
- Use a strong 4-digit PIN (not 1111, 2222, etc.)
- Let the app auto-logout if you won't use it for a while
- Trust the inactivity warning - it gives you 10 seconds

**✗ DON'T:**
- Share your PIN with anyone
- Disable the auto-logout feature for security reasons
- Dismiss the inactivity warning immediately - wait a moment for emphasis

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| PIN screen doesn't appear when I return to the app | This is a known edge case. Try fully closing the app (swipe it away) before reopening it. |
| Inactivity warning appears too frequently | Your setting for IDLE_TIME may be too short. Increase it or disable inactivity by setting `timeoutDisabled: true` in AppContext. |
| Inactivity warning never appears | Make sure `isAuthenticated: true` in AppContext and `timeoutDisabled: false`. |
| App doesn't work offline | Check that the SQLite database initialized. Look for console logs starting with `[Database]`. |

---

## 📱 Device Support

These features work on:
- ✓ iOS (native app via Expo)
- ✓ Android (native app via Expo)  
- ✓ Web (browser version)

---

## Questions?

Refer to the main documentation in `SECURITY_UPDATES.md` for detailed technical information.

Remember: **Security features are most effective when used consistently!** 🔐
