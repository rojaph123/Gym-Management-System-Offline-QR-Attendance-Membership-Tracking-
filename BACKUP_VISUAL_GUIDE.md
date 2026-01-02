# Backup & Restore - Visual Guides

## 🔄 Backup Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    BACKUP CREATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User Taps "Create Backup"
           ↓
    [Loading State]
           ↓
  Gather All Data From Database
  ├─ Members
  ├─ Attendance Records
  ├─ Sales Records
  └─ Price Settings
           ↓
   Convert to JSON Format
           ↓
  Create Timestamped Filename
  Example: powerlift_backup_2025-01-02_15-30-45.json
           ↓
   Write to Device Cache
           ↓
    Open Share Dialog
    (User chooses destination)
    ├─ Email
    ├─ Google Drive
    ├─ Dropbox
    ├─ OneDrive
    ├─ Files (Local)
    └─ Other Apps
           ↓
   Save Last Backup Date
           ↓
    [Success Alert]
           ↓
    ✅ Backup Complete
```

---

## 📥 Restore Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   RESTORE CREATION FLOW                          │
└─────────────────────────────────────────────────────────────────┘

User Taps "Restore Backup"
           ↓
   Open File Picker
   (User navigates and selects file)
           ↓
   Validate File Format
   ├─ Is it valid JSON? ✓
   ├─ Contains required data? ✓
   └─ Not corrupted? ✓
           ↓
    ⚠️ Show Confirmation Dialog
    "This will replace all current data"
           ↓
   User Confirms Restore
           ↓
    [Loading State]
           ↓
    Read Backup File
           ↓
    Parse JSON
           ↓
    Import Data to Database
    ├─ Clear old data
    ├─ Insert members
    ├─ Insert attendance
    ├─ Insert sales
    └─ Update settings
           ↓
    Reload App State
           ↓
    [Success Alert]
           ↓
    ✅ Restore Complete
    📊 All Data Available
```

---

## 💾 Data Migration Diagram

```
┌──────────────────┐
│  OLD DEVICE      │
│  ─────────────   │
│  √ Members: 42   │
│  √ Sales: 156    │
│  √ Attendance: 84│
└────────┬─────────┘
         │
         │ [Create Backup]
         │ powerlift_backup_*.json
         │
         ↓
┌──────────────────┐
│  CLOUD/EMAIL     │
│  ─────────────   │
│  FILE STORAGE    │
│  Safe, Secure    │
└────────┬─────────┘
         │
         │ [Save Location]
         │ Google Drive / Dropbox / Email
         │
         ↓
┌──────────────────┐
│  NEW DEVICE      │
│  ─────────────   │
│  1. Install App  │
│  2. Restore File │
│  3. Done!        │
│  √ Members: 42   │
│  √ Sales: 156    │
│  √ Attendance: 84│
└──────────────────┘
```

---

## 📊 Settings Screen Layout

```
┌─────────────────────────────────────────────────────┐
│  SETTINGS SCREEN                           ⚙️ (Tab) │
├─────────────────────────────────────────────────────┤
│                                                       │
│  [Appearance]                                        │
│  ├─ Dark Mode [Toggle]                             │
│                                                       │
│  [Membership Fee]                                    │
│  ├─ Lifetime Membership: [₱ 300.00]                │
│                                                       │
│  [Monthly Subscription Rates]                        │
│  ├─ Student: [₱ 600.00]                            │
│  ├─ Regular: [₱ 700.00]                            │
│  ├─ Senior:  [₱ 560.00]                            │
│                                                       │
│  [Per Session Rates]                                │
│  ├─ Member:         [₱ 70.00]                      │
│  ├─ Member Senior:  [₱ 50.00]                      │
│  ├─ Non-member:     [₱ 100.00]                     │
│  └─ Non-member Sr:  [₱ 80.00]                      │
│                                                       │
│  [SAVE SETTINGS] (Green Button)                     │
│                                                       │
├─────────────────────────────────────────────────────┤
│  DATA BACKUP & RESTORE                              │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ℹ️  How to Use                                     │
│  ┌────────────────────────────────────────────┐    │
│  │ 1. Tap "Create Backup" to save your data  │    │
│  │ 2. File downloaded with today's date      │    │
│  │ 3. Store it safely on cloud               │    │
│  │ 4. Use "Restore from Backup" if needed    │    │
│  │ 5. Backups shareable via email/cloud      │    │
│  └────────────────────────────────────────────┘    │
│                                                       │
│  Current Data                                        │
│  ┌────────────┬───────────┬──────────────┐         │
│  │ 👥 4       │ $ 56      │ 📍 6         │         │
│  │ Members    │ Sales     │ Records      │         │
│  └────────────┴───────────┴──────────────┘         │
│                                                       │
│  ⏱️ Last Backup                                     │
│  12/29/2025                                          │
│                                                       │
│  [⬇️ CREATE BACKUP] (Green)                         │
│  [⬆️ RESTORE BACKUP] (Red)                          │
│                                                       │
├─────────────────────────────────────────────────────┤
│  Powerlift Fitness Gym                              │
│  Developed by Rov - 2025                            │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 Color Scheme

```
┌──────────────────────────────────────┐
│  BACKUP & RESTORE COLOR GUIDE        │
├──────────────────────────────────────┤
│                                       │
│  MEMBERS       👥  #ff6b6b (Red)     │
│  SALES         💰  #51cf66 (Green)   │
│  ATTENDANCE    📍  #ff922b (Orange)  │
│                                       │
│  CREATE BACKUP     #51cf66 (Green)   │
│  RESTORE BACKUP    #ff6b6b (Red)     │
│                                       │
│  INFO BADGE        Primary Color     │
│  INFO BOX          Background Tertiary│
│                                       │
└──────────────────────────────────────┘
```

---

## 📱 Responsive Design

### Mobile Layout
```
┌──────────────────────┐
│    BACKUP SECTION    │
├──────────────────────┤
│ ℹ️ [How to Use]      │ Full width
├──────────────────────┤
│ Current Data         │
│ ┌─────┬──────┬─────┐│ Stacked
│ │👥 4 │ $ 56 │📍 6 ││
│ └─────┴──────┴─────┘│
├──────────────────────┤
│ Last Backup: 12/29  │
├──────────────────────┤
│ [CREATE BACKUP]     │ Full width
├──────────────────────┤
│ [RESTORE BACKUP]    │ Full width
└──────────────────────┘
```

### Tablet Layout
```
┌────────────────────────────────────────────┐
│              BACKUP SECTION                │
├────────────────────────────────────────────┤
│ ℹ️ [How to Use]    │ Last Backup: 12/29   │ Side by side
├────────────────────────────────────────────┤
│  Current Data                              │
│  ┌──────┬────────┬──────────────┐         │ Wider
│  │👥 4  │ $ 56   │ 📍 6         │         │
│  └──────┴────────┴──────────────┘         │
├────────────────────────────────────────────┤
│ [CREATE BACKUP]         [RESTORE BACKUP]  │ Side by side
└────────────────────────────────────────────┘
```

---

## 🔄 State Transitions

```
IDLE STATE
├─ backupButton: Enabled ✅
├─ restoreButton: Enabled ✅
└─ lastBackupDate: Showing previous date

         │
         ↓ User taps "Create Backup"
         
CREATING STATE
├─ backupButton: Disabled (opacity 0.7) ❌
├─ restoreButton: Enabled ✅
└─ Button text: "Creating Backup..."

         │
         ↓ File created and saved
         
IDLE STATE (Updated)
├─ backupButton: Enabled ✅
├─ restoreButton: Enabled ✅
└─ lastBackupDate: TODAY'S DATE ✨
```

---

## 📊 File Size Visualization

```
BACKUP FILE SIZES BY GYM SIZE

Small Gym (10 members, 100 records)
█ 50 KB

Medium Gym (100 members, 1000 records)
██████ 500 KB

Large Gym (500 members, 10000 records)
██████████████████████████ 5 MB

Very Large Gym (1000+ members, 100000+ records)
████████████████████████████████████████ 50 MB
```

---

## 🔒 Security Layers Diagram

```
BACKUP FILE PROTECTION

┌─────────────────────────────────────┐
│  User Creates Backup                │
└────────────┬────────────────────────┘
             │
             ↓ ENCRYPTION LAYER
      ┌──────────────────┐
      │  (Optional)      │  Not applied by default
      │  Use:            │  Can be done manually with:
      │  7-Zip, WinRAR   │  - File encryption tool
      │  Password        │  - Cloud storage encryption
      └────────┬─────────┘
               │
               ↓ STORAGE LAYER
      ┌──────────────────┐
      │  Cloud Service   │  Google Drive, Dropbox
      │  Encryption      │  Built-in protection
      └────────┬─────────┘
               │
               ↓ ACCESS CONTROL
      ┌──────────────────┐
      │  Password Auth   │  Cloud account protection
      │  2FA             │  Additional security
      └──────────────────┘
```

---

## 📈 Backup Timeline Example

```
JANUARY 2025 - BACKUP HISTORY

Jan 1 (Sunday)
└─ 18:00 → powerlift_backup_2025-01-01_18-00-00.json ✅
   └─ Saved to Google Drive

Jan 8 (Sunday)
└─ 18:00 → powerlift_backup_2025-01-08_18-00-00.json ✅
   └─ Saved to Google Drive

Jan 15 (Sunday)
└─ 18:00 → powerlift_backup_2025-01-15_18-00-00.json ✅
   └─ Saved to Google Drive

Jan 22 (Sunday)
└─ 18:00 → powerlift_backup_2025-01-22_18-00-00.json ✅
   └─ Saved to Google Drive

Jan 29 (Sunday)
└─ 18:00 → powerlift_backup_2025-01-29_18-00-00.json ✅
   └─ Saved to Google Drive

DEVICE LOST - JAN 31
└─ Use: powerlift_backup_2025-01-29_18-00-00.json ✅
   └─ Restore on new device
   └─ Data recovered! ✅
```

---

## 🎯 Success Criteria Checklist

```
✅ BACKUP FEATURES
   [✓] Create backup with one tap
   [✓] Automatic filename with date/time
   [✓] Share to cloud storage
   [✓] Update last backup date
   [✓] Show success notification
   [✓] Haptic feedback

✅ RESTORE FEATURES
   [✓] Select file with file picker
   [✓] Validate file integrity
   [✓] Show confirmation dialog
   [✓] Import data correctly
   [✓] Reload app state
   [✓] Show success notification

✅ UI/UX
   [✓] Clear instructions
   [✓] Data statistics displayed
   [✓] Last backup date shown
   [✓] Loading states
   [✓] Error messages
   [✓] Proper styling

✅ COMPATIBILITY
   [✓] Works on Android
   [✓] Works on iOS
   [✓] Works on Web
   [✓] Cross-platform restore
   [✓] All cloud services
```

---

**Document Version:** 1.0  
**Created:** January 2, 2025  
**Last Updated:** January 2, 2025
