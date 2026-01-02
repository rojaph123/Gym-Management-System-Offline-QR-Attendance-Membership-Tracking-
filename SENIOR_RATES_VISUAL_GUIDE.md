# Senior Session Rates - Quick Visual Guide

## 📊 New Pricing Structure

```
┌─────────────────────────────────────┐
│         SESSION RATES               │
├─────────────────────────────────────┤
│                                     │
│  👤 Regular Member          ₱50     │
│  👴 Senior Member           ₱40     │
│                                     │
│  👤 Regular Walk-in         ₱80     │
│  👴 Senior Walk-in          ₱60     │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎯 User Interaction Flow

### Scenario 1: Member with Expired Subscription

```
1. Scan Member QR Code
   ↓
2. System detects: "Subscription Expired"
   ↓
3. Show two buttons:
   [Renew Monthly]  [Pay Session]
   ↓
4. User clicks: "Pay Session"
   ↓
5. 📱 MODAL APPEARS:
   ┌─────────────────────────────┐
   │  Session Type              │
   │  John Doe                   │
   ├─────────────────────────────┤
   │  👤 Member         ₱50      │
   │  👴 Senior Member  ₱40      │
   └─────────────────────────────┘
   ↓
6. User selects type
   ↓
7. Payment recorded with chosen rate
   ✅ Success alert with amount
   🔊 Beep confirmation
```

### Scenario 2: Walk-in Session

```
1. Click "Walk-in Session" button
   ↓
2. 📱 MODAL APPEARS:
   ┌─────────────────────────────┐
   │  Walk-in Session Type       │
   ├─────────────────────────────┤
   │  👤 Regular Walk-in  ₱80    │
   │  👴 Senior Walk-in   ₱60    │
   └─────────────────────────────┘
   ↓
3. User selects type
   ↓
4. Walk-in session recorded
   ✅ Success alert with amount
   🔊 Beep confirmation
```

---

## 📱 Modal Interface

### Professional Design

```
┌──────────────────────────────────────┐
│  Session Type                    ✕   │ ← Header
│  John Doe                            │
├──────────────────────────────────────┤
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 👤  Member              ₱50     │ │  ← Option Button
│  │     Regular Member Rate         │ │
│  └─────────────────────────────────┘ │
│                                      │
│  ┌─────────────────────────────────┐ │
│  │ 👴  Senior Member       ₱40     │ │  ← Option Button
│  │     Senior Member Rate          │ │
│  └─────────────────────────────────┘ │
│                                      │
│          [ Cancel ]                  │ ← Action Button
│                                      │
└──────────────────────────────────────┘
```

### Visual Elements

- **Icons:** 👤 for regular, 👴 for senior (or shield icon)
- **Colors:** Matches app theme (red accent for Powerlift)
- **Typography:** Clear hierarchy with labels and subtitles
- **Spacing:** Professional padding
- **Effects:** Subtle shadow for depth, opacity on touch

---

## 💾 Database Changes

### Price Settings Table

**Before:**
```sql
price_settings
├── session_member: 50
└── session_nonmember: 80
```

**After:**
```sql
price_settings
├── session_member: 50
├── session_member_senior: 40        ← NEW
├── session_nonmember: 80
└── session_nonmember_senior: 60     ← NEW
```

---

## 📈 Sales Recording

### Transaction Types

Session transactions now include type for analytics:

```
Sales Record:
├── type: "session_member"           (Regular)
├── type: "session_member_senior"    (Senior)
├── type: "session_nonmember"        (Regular Walk-in)
└── type: "session_nonmember_senior" (Senior Walk-in)

Note Field:
├── "Session for John Doe"           (Regular member)
├── "Session for Jane Doe (Senior)"  (Senior member)
├── "Walk-in session"                (Regular walk-in)
└── "Walk-in session (Senior)"       (Senior walk-in)
```

---

## ⚙️ Settings Configuration

### How to Update Rates

```
Settings Screen
    ↓
Price Settings
    ↓
┌────────────────────────────┐
│ Monthly Subscriptions      │
│ ├─ Student: ₱500           │
│ ├─ Regular: ₱700           │
│ └─ Senior: ₱400            │
│                            │
│ Per-Session Rates          │
│ ├─ Member: ₱50             │
│ ├─ Senior Member: ₱40  ✨  │
│ ├─ Non-Member: ₱80         │
│ └─ Senior Non-Member: ₱60 ✨│
│                            │
│ [Save Changes]             │
└────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
Scan QR Code
    ↓
    ├─→ Member with Active Subscription
    │        ↓
    │   [Record Attendance] ✓
    │
    └─→ Member with Expired Subscription
         ├─→ [Renew Monthly] → Auto-select
         │
         └─→ [Pay Session]
              ↓
         📱 Session Modal
              ├─→ Regular Member (₱50)
              │        ↓
              │   paySession(id, true, false)
              │
              └─→ Senior Member (₱40)
                   ↓
              paySession(id, true, true)


Click Walk-in
    ↓
📱 Walk-in Modal
    ├─→ Regular (₱80)
    │       ↓
    │   paySession(0, false, false)
    │
    └─→ Senior (₱60)
         ↓
    paySession(0, false, true)
```

---

## 🎨 Color Scheme

### Modal Styling

```
Theme: Dark (Default)
├─ Background: #1A1A1A
├─ Secondary: #2A2A2A
├─ Text: #FFFFFF
├─ Accent: #DC2626 (Red - Powerlift)
└─ Secondary Text: #CCCCCC

Theme: Light
├─ Background: #FFFFFF
├─ Secondary: #F5F5F5
├─ Text: #000000
├─ Accent: #DC2626 (Red)
└─ Secondary Text: #666666
```

---

## ✅ Feature Checklist

### Member Features
- [x] View session rates before payment
- [x] Choose regular or senior rate
- [x] See exact amount before confirming
- [x] Automatic attendance logging for members

### Walk-in Features
- [x] Quick session rate selection
- [x] Regular or senior pricing options
- [x] Instant payment recording
- [x] Clear price confirmation

### Business Features
- [x] Differentiated senior pricing
- [x] Sales analytics with transaction type
- [x] Price flexibility in settings
- [x] No data loss on updates
- [x] Professional UI presentation

---

## 📊 Quick Stats

```
Component Changes:
├─ NEW: SessionTypeModal.tsx (120 lines)
├─ MODIFIED: ScanQRScreen.tsx (+100 lines)
├─ MODIFIED: AppContext.tsx (+8 fields)
├─ MODIFIED: database.ts (+2 fields)
└─ MODIFIED: PriceSettings interface

Code Impact:
├─ Backward compatible: ✓
├─ Existing data safe: ✓
├─ Migration automatic: ✓
└─ Professional design: ✓
```

---

## 🚀 Deployment

### Ready to Deploy
```
✓ All changes implemented
✓ Database backward compatible
✓ Professional UI/UX
✓ Default rates included
✓ No breaking changes
✓ Fully tested logic
```

### Installation Steps
1. Build new APK: `eas build --platform android`
2. Send to tablet user
3. Install APK (overwrite old version)
4. App automatically updates pricing database
5. Users can now select session types! 🎉

---

## 💡 Tips for Staff

- **Quick Selection:** Click "Pay Session" → Choose rate from modal
- **Walk-in Quick:** "Walk-in Session" → Instant rate selection
- **No Confusion:** Modal always shows current prices
- **Senior Care:** Dedicated pricing option for senior guests
- **Clear Feedback:** Beep + Alert confirms payment amount

---

## Support & Q&A

**Q: Can I change rates after deployment?**  
A: Yes! Go to Settings → Price Settings. Changes apply immediately.

**Q: Do old transactions show a type?**  
A: No, but all new transactions will include type for analytics.

**Q: What if I don't use senior pricing?**  
A: Users simply won't click the senior option. Regular rates work as before.

**Q: Is the modal required?**  
A: Yes, it ensures correct pricing selection every time. This is better than guessing!

---

## The Bottom Line

✨ **Professional senior rate management**  
✨ **Clear user choice at point of sale**  
✨ **Better price tracking for analytics**  
✨ **Zero data loss or confusion**  
✨ **Production-ready implementation**

**Senior pricing now available!** 🎉
