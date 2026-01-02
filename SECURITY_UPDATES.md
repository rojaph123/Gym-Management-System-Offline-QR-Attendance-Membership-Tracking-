# Security & Session Management Updates

## Overview
The app has been enhanced with the following security features:
1. **Background Detection** - PIN screen required when returning from background
2. **Inactivity Timeout** - Automatic logout after 2 minutes of inactivity
3. **Countdown Warning** - 10-second warning before forced logout
4. **Touch Detection** - Inactivity timer resets on user interaction
5. **Offline Support** - Complete offline functionality with local SQLite database

---

## Feature 1: Background Detection

### How it works:
- When you press the home button or switch apps, the app detects it's in the background
- When you return to the app, you must enter the PIN to re-authenticate
- This prevents unauthorized access if someone picks up your device while the app is running

### Implementation:
- **File**: `client/context/AppContext.tsx`
- Listens to `AppState` changes (`background` → `active`)
- Automatically logs out user when app returns from background
- Triggers navigation to PIN screen

---

## Feature 2: 2-Minute Inactivity Timeout

### How it works:
- If you don't interact with the app for 2 minutes (120 seconds), a warning appears
- You have 10 seconds to confirm you're still there by tapping "I'm Still Here"
- If you don't respond in 10 seconds, you're logged out and need to enter PIN again

### Why it matters:
- Protects your data if you leave the app unattended
- Automatically logs out after the countdown expires
- Safe for public/shared devices

### Implementation:
- **File**: `client/components/SessionManager.tsx`
- Idle timer: 2 minutes (120,000 ms)
- Countdown timer: 10 seconds
- Automatic logout after countdown

---

## Feature 3: Touch/Interaction Detection

### How it works:
- Every time you tap, swipe, or interact with the screen, the 2-minute inactivity timer resets
- You can use the app without interruption as long as you're actively using it
- The timer only starts counting again after you stop interacting

### Implementation:
- **File**: `client/components/SessionManager.tsx`
- Wraps all app content in a `Pressable` component with:
  - `onPress` handler (detects any tap)
  - `onLongPress` handler (detects long press)
- Non-intrusive - doesn't affect app functionality

---

## Feature 4: Complete Offline Support

### How it works:
- All data is stored locally in SQLite database
- If the backend fails or connection is lost, the app continues working
- Data syncs when connection is restored

### Database Features:
- **Location**: `client/lib/database.ts`
- **Storage**: SQLite (native) or in-memory (web)
- **Fallback**: In-memory database when SQLite is unavailable
- **WAL Mode**: Write-Ahead Logging for crash recovery
- **Auto-retry**: Database operations retry up to 3 times on failure

### Data Persistence:
- Members list
- Attendance records
- Sales records
- Price settings
- App settings (theme, PIN)

---

## Configuration

### Timeout Settings (in SessionManager.tsx):
```typescript
const IDLE_TIME = 2 * 60 * 1000;      // 2 minutes
const COUNTDOWN_SECONDS = 10;          // 10 second warning
```

To change these values:
1. Open `client/components/SessionManager.tsx`
2. Modify the constants at the top
3. Redeploy the app

---

## Testing

### Test Background Detection:
1. Open the app and log in
2. Press the home button (or switch apps)
3. Open the app again
4. You should see the PIN screen

### Test Inactivity Timeout:
1. Log in to the app
2. Don't touch anything for 2 minutes
3. Warning modal should appear with 10-second countdown
4. Don't tap "I'm Still Here" - wait for auto-logout
5. You should be taken to PIN screen

### Test Touch Detection:
1. Log in to the app
2. Wait 1 minute without touching
3. Start tapping/scrolling regularly
4. The countdown warning should NOT appear (timer resets with each interaction)

### Test Offline Mode:
1. Enable airplane mode or disconnect from internet
2. Use the app normally
3. All features should work (add members, log attendance, etc.)
4. Data is saved locally

---

## Security Notes

### PIN Security:
- PIN is stored securely using `expo-secure-store` (encrypted on native platforms)
- PIN is used for web via `localStorage` (web storage)
- Never stored in plain text

### Data Encryption:
- Database uses SQLite's built-in security
- All user data is local-only
- No data is sent to external servers

### Session Timeout:
- Prevents unauthorized access on shared devices
- Automatic logout on background ensures protection
- Regular inactivity checks provide additional security

---

## Troubleshooting

### PIN screen not appearing when returning from background?
- Clear app cache and try again
- The `AppState` listener may need the app to be fully closed

### Timeout too short/long?
- Adjust `IDLE_TIME` constant in SessionManager.tsx
- Set to desired milliseconds (e.g., 5 minutes = 5 * 60 * 1000)

### App not working offline?
- Check that SQLite database initialized successfully
- Look for console logs starting with `[Database]`
- The app falls back to in-memory storage if needed

---

## Files Modified

1. **`client/components/SessionManager.tsx`**
   - Added background state detection
   - Enhanced inactivity timer logic
   - Added touch event listener

2. **`client/context/AppContext.tsx`**
   - Added `appWentToBackground` state
   - Enhanced app lifecycle handler
   - Logout on foreground detection

---

## References

- React Native AppState: https://reactnative.dev/docs/appstate
- Expo Secure Store: https://docs.expo.dev/versions/latest/sdk/securestore/
- SQLite (expo-sqlite): https://docs.expo.dev/versions/latest/sdk/sqlite/
