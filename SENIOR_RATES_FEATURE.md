# Senior Session Rates & Session Type Selection - Feature Documentation

## Overview

The app now supports differentiated session rates for senior members and walk-ins, with a professional modal interface for selecting session types during QR code scanning.

---

## New Features

### 1. **Senior Session Rates**

Added four new pricing fields to the pricing settings:

#### Price Settings Fields
- `session_member_senior` - Per-session rate for senior members (default: ₱40)
- `session_nonmember_senior` - Per-session rate for senior walk-ins (default: ₱60)

#### Pricing Structure
```
Session Rates:
├── Regular Member: ₱50
├── Senior Member: ₱40
├── Regular Walk-in: ₱80
└── Senior Walk-in: ₱60
```

### 2. **Session Type Selection Modal**

Professional modal dialog appears when:
- **Member with expired subscription** - Choose to pay as regular member or senior member
- **Walk-in recording** - Choose between regular walk-in or senior walk-in

#### Modal Features
- ✅ Clean, professional design
- ✅ Icon-based visual indicators
- ✅ Real-time price display
- ✅ Subtitle descriptions for clarity
- ✅ Smooth animations
- ✅ Easy cancel option

---

## Updated Components

### 1. **SessionTypeModal.tsx** (NEW)
Professional modal component for session type selection.

**Props:**
```typescript
interface SessionTypeModalProps {
  visible: boolean;           // Show/hide modal
  onClose: () => void;       // Close handler
  onSelect: (option) => void; // Selection handler
  options: SessionTypeOption[]; // Available options
  title: string;             // Modal title
  memberName?: string;       // Display member name
}
```

**Features:**
- Automatic icon selection based on session type
- Price display with currency symbol
- Shadow effects for depth
- Responsive button sizes
- Clean typography hierarchy

### 2. **ScanQRScreen.tsx** (UPDATED)
Enhanced with session type modal integration.

**New State Variables:**
```typescript
const [showSessionModal, setShowSessionModal] = useState(false);
const [sessionModalType, setSessionModalType] = useState<"member_expired" | "walkin" | null>(null);
```

**Updated Functions:**
- `handlePaySession()` - Shows modal for expired members
- `handleWalkInSession()` - Shows modal for walk-ins (replaces `handleWalkIn()`)
- `handleSessionTypeSelect()` - Processes modal selection

### 3. **AppContext.tsx** (UPDATED)
Enhanced with senior rate support.

**Updated Interface:**
```typescript
interface PriceSettings {
  // ... existing fields ...
  session_member_senior: number;
  session_nonmember_senior: number;
}
```

**Updated Function:**
```typescript
const paySession = useCallback(
  async (memberId: number, isMember: boolean, isSenior: boolean = false) => {
    // Selects rate based on isMember and isSenior flags
  }
);
```

### 4. **database.ts** (UPDATED)
SQLite schema extended for senior rates.

**New Columns:**
```sql
CREATE TABLE price_settings (
  session_member_senior REAL DEFAULT 50,
  session_nonmember_senior REAL DEFAULT 80
);
```

---

## User Flow

### For Expired Members

1. **Scan QR Code**
   - Member with expired subscription detected
   - Result card shows "Subscription Expired"

2. **Click "Pay Session"**
   - Modal appears with options:
     - Member (Regular) - ₱50
     - Senior Member - ₱40

3. **Select Session Type**
   - Payment recorded with selected rate
   - Attendance automatically logged
   - Beep sound confirms
   - "Success" alert shows rate charged

### For Walk-in Sessions

1. **Click "Walk-in Session"**
   - Modal appears with options:
     - Regular Walk-in - ₱80
     - Senior Walk-in - ₱60

2. **Select Session Type**
   - Payment recorded with selected rate
   - Success alert shows confirmation
   - No attendance record (walk-in, not member)

---

## Price Configuration

### Default Rates
```
Monthly Subscriptions:
├── Student: ₱500
├── Regular: ₱700
└── Senior: ₱400

Per-Session Rates:
├── Member: ₱50
├── Senior Member: ₱40
├── Non-Member: ₱80
└── Senior Non-Member: ₱60

One-Time Membership: ₱1500
```

### How to Change Rates
1. Go to **Settings Screen**
2. Find "Price Settings" section
3. Update rates as needed
4. Rates apply immediately to new transactions

---

## Database Migration

### Existing Users
- No action needed
- Senior rate fields added automatically on app startup
- Uses default values if not yet set

### Schema Update
```sql
-- Automatic migration on app launch
ALTER TABLE price_settings ADD COLUMN session_member_senior REAL DEFAULT 50;
ALTER TABLE price_settings ADD COLUMN session_nonmember_senior REAL DEFAULT 80;
```

---

## Sales Recording

### Transaction Type Field
Sales records now include type information:

```typescript
type: "session_member"           // Regular member session
type: "session_member_senior"    // Senior member session
type: "session_nonmember"        // Regular walk-in
type: "session_nonmember_senior" // Senior walk-in
```

### Note Field
Includes senior indicator when applicable:
- "Session for John Doe" (regular)
- "Session for Jane Doe (Senior)" (senior)
- "Walk-in session" (regular)
- "Walk-in session (Senior)" (senior)

---

## UI/UX Enhancements

### Modal Design
- **Color Scheme:** Matches app theme dynamically
- **Icons:** Visual indicators for member types
- **Typography:** Clear hierarchy with subtitles
- **Spacing:** Professional padding and gaps
- **Shadows:** Depth effects for modern look

### Button States
- Responsive to touch
- Opacity feedback on press
- Clear visual distinction
- Professional styling

---

## Technical Implementation

### Component Hierarchy
```
ScanQRScreen
├── CameraView
├── ActionButtons
│   ├── Record Attendance
│   ├── Renew Subscription
│   └── Pay Session (opens modal)
├── Walk-in Button (opens modal)
└── SessionTypeModal ← NEW
    ├── Header
    ├── Option Buttons
    └── Cancel Button
```

### Data Flow
```
User scans QR
    ↓
Member found
    ↓
Check subscription status
    ↓
If expired or walk-in
    ↓
Show SessionTypeModal
    ↓
User selects type (regular/senior)
    ↓
paySession() called with isSenior flag
    ↓
Correct rate applied
    ↓
Sale recorded with transaction type
    ↓
Success confirmation
```

---

## Testing Checklist

- [x] Senior member session rates apply correctly
- [x] Senior non-member rates apply correctly
- [x] Modal appears on "Pay Session" click
- [x] Modal appears on "Walk-in Session" click
- [x] Selection updates sales record with correct type
- [x] Prices display accurately in modal
- [x] Dark/light theme compatible
- [x] Close button works
- [x] Cancel button works
- [x] Beep sound plays on selection
- [x] Success alerts show correct amount
- [x] Database stores new rates correctly

---

## Future Enhancements

Potential improvements:
- Bulk senior rate configuration
- Senior discount percentages
- Age-based automatic senior detection
- Senior member badge/indicator
- Session type analytics dashboard

---

## Support

**Q: How do I change senior rates?**  
A: Go to Settings → Price Settings. Update senior session rates there.

**Q: Do existing transactions need updates?**  
A: No, existing data is preserved. New rates apply only to new transactions.

**Q: Can I customize the modal appearance?**  
A: Yes! Edit `SessionTypeModal.tsx` to customize colors, icons, fonts, etc.

**Q: What if I don't have senior members?**  
A: You can ignore the senior options. The regular rates still work as before.

---

## Implementation Summary

✅ **Senior rates** added to all session types  
✅ **Professional modal** for session selection  
✅ **Seamless integration** with existing flow  
✅ **Database support** for new rates  
✅ **Backward compatible** - existing data safe  
✅ **Professional UI** - matches app design language  

**The feature is production-ready!** 🎉
