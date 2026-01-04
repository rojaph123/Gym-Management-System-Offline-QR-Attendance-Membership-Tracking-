# Photo Capture PIN Screen Bug - FIXED

## Problem
When adding a member and clicking "Take Photo", the app would:
1. Open the camera
2. After taking the photo, immediately redirect to the PIN screen
3. User could not complete the member registration

## Root Cause
The camera/photo picker opens as a separate application, causing the app to transition to the **background** state. When the camera closes and the app returns to the **foreground**, the SessionManager's background detection logic triggers an automatic logout and forces the PIN screen.

This behavior is designed for security (PIN required when returning from background), but it interferes with legitimate background operations like photo capture.

## Solution
Implemented `setTimeoutDisabled()` to temporarily disable the session timeout during photo capture operations. This allows the app to transition to background without triggering the PIN requirement.

### Changes Made

#### 1. **RegisterScreen.tsx** (Line 20)
```typescript
// Added setTimeoutDisabled to imports
const { addMember, addSale, priceSettings, addAttendance, setTimeoutDisabled } = useApp();

// Modified pickImage function
const pickImage = async () => {
  setTimeoutDisabled(true);  // ← Disable timeout
  
  const result = await ImagePicker.launchImageLibraryAsync({...});
  
  setTimeoutDisabled(false); // ← Re-enable timeout
  
  if (!result.canceled && result.assets[0]) {
    setPhoto(result.assets[0].uri);
  }
};

// Modified takePhoto function
const takePhoto = async () => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    Alert.alert("Permission Required", "Camera permission is needed to take photos.");
    return;
  }

  setTimeoutDisabled(true);  // ← Disable timeout
  
  const result = await ImagePicker.launchCameraAsync({...});
  
  setTimeoutDisabled(false); // ← Re-enable timeout
  
  if (!result.canceled && result.assets[0]) {
    setPhoto(result.assets[0].uri);
  }
};
```

#### 2. **MemberDetailScreen.tsx** (Line 28)
```typescript
// Added setTimeoutDisabled to imports
const { getMember, renewSubscription, paySession, attendance, priceSettings, deleteMember, updateMember, setTimeoutDisabled } = useApp();

// Applied same changes to pickImage() and takePhoto()
// Wrap ImagePicker calls with setTimeoutDisabled(true/false)
```

## How It Works

1. **Before Camera Opens**: `setTimeoutDisabled(true)` prevents the SessionManager from forcing logout on background transition
2. **During Photo Capture**: App can safely transition to background without triggering PIN screen
3. **After Photo Selection**: `setTimeoutDisabled(false)` re-enables timeout protection for normal operation

## Behavior After Fix

✅ User can now add members without PIN interruption
✅ Photo capture works seamlessly
✅ Session timeout still protects against unauthorized access during normal app use
✅ Camera and gallery operations work as expected

## Testing

To verify the fix:
1. Open the app and log in with PIN
2. Navigate to "Add Member" or "Edit Member"
3. Click "Take Photo" or "Pick from Gallery"
4. Take a photo or select an image
5. ✅ App should return to the form WITHOUT showing PIN screen
6. Complete the member registration normally

## Files Modified

- `client/screens/RegisterScreen.tsx`
- `client/screens/MemberDetailScreen.tsx`

## Related Configuration

The timeout behavior can be adjusted in:
- **File**: `client/components/SessionManager.tsx`
- **Constants**:
  ```typescript
  const IDLE_TIME = 2 * 60 * 1000;     // 2 minutes of inactivity
  const COUNTDOWN_SECONDS = 10;         // 10 second warning
  ```
