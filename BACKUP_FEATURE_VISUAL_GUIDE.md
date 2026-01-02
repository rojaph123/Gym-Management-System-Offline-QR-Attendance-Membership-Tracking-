# Visual Guide - Data Backup & Restore Feature

## Settings Screen (Updated)

```
┌─────────────────────────────────────────┐
│          SETTINGS SCREEN                │
├─────────────────────────────────────────┤
│                                         │
│  ☀ Appearance                           │
│  ├─ Dark Mode  [Toggle Switch]          │
│                                         │
│  💾 Data Backup & Restore          →   │ ← NEW
│  ├─ "Protect your gym data"             │ ← NEW
│                                         │
│  💳 Membership Fee                      │
│  ├─ ₱ [Text Input: 300]                 │
│                                         │
│  📅 Monthly Subscription Rates          │
│  ├─ Student: ₱ [600]                    │
│  ├─ Regular: ₱ [700]                    │
│  └─ Senior: ₱ [560]                     │
│                                         │
│  ⏰ Per Session Rates                   │
│  ├─ Member: ₱ [70]                      │
│  ├─ Member Senior: ₱ [40]               │
│  ├─ Non-member: ₱ [100]                 │
│  └─ Non-member Senior: ₱ [60]           │
│                                         │
│       [💾 Save Settings]                │
│                                         │
└─────────────────────────────────────────┘
```

## Data Backup & Restore Screen

### Full Screen Layout

```
┌─────────────────────────────────────────────────┐
│  ← Back    Data Backup & Restore                │ (Header)
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 Data Backup & Restore                       │
│     Protect your gym data                       │
│                                                 │
│  ℹ️  HOW TO USE                                  │ (Info Section)
│  ├─ 1. Create Backup saves your data            │
│  ├─ 2. File saves to device storage             │
│  ├─ 3. Backup regularly to stay safe            │
│  ├─ 4. Use Restore to recover data              │
│  └─ 5. Restores replace all current data        │
│                                                 │
│  📈 CURRENT DATA                                │ (Stats Section)
│  ├─ 👥 Members  [Count]   Divider │ 💰 Sales   │
│  │   [Count]   Divider   📝 Records [Count]    │
│                                                 │
│  🕐 LAST BACKUP                                 │ (Last Backup)
│  └─ [Date/Time or "Never"]                      │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ✓ Create Backup                          │ │ (Action Buttons)
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │  ⤵️ Restore from Backup                   │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘
```

## Backup Creation Process

### Visual Flow

```
Settings → Data Backup & Restore Button
                    ↓
         DataBackupScreen Opens
                    ↓
       User taps "Create Backup"
                    ↓
       [Haptic Feedback - Phone Vibrates]
                    ↓
    File Saved to Device Storage
    (PowerliftBackups/powerlift_backup_2025-01-15_14-30-45.json)
                    ↓
         Success Alert Appears
      "Backup created successfully!"
                    ↓
      Last Backup Date Updates
    (Shows current date and time)
```

## Restore Process with Progress Modal

### Step 1: Select File
```
┌──────────────────────────────┐
│    File Picker Opens         │
├──────────────────────────────┤
│  📁 PowerliftBackups/        │
│  ├─ powerlift_backup_...json │ ← User selects
│  ├─ powerlift_backup_...json │
│  └─ powerlift_backup_...json │
└──────────────────────────────┘
```

### Step 2: Confirmation Dialog
```
┌─────────────────────────────────┐
│  ⚠️  Restore Backup?            │
├─────────────────────────────────┤
│                                 │
│  This will replace all          │
│  current data with the backup.  │
│  This action cannot be undone.  │
│                                 │
│  Are you sure?                  │
│                                 │
│  [Cancel]        [Confirm]      │
└─────────────────────────────────┘
```

### Step 3: Progress Modal (Restoring)

```
┌─────────────────────────────────┐
│          ⟳ Restoring            │
├─────────────────────────────────┤
│                                 │
│        [Spinning Circle]        │
│                                 │
│   ████████░░░░░░░░░░░░░░░░  45% │  ← Progress Bar
│                                 │
│     "Restoring..."              │  ← Status Message
│                                 │
└─────────────────────────────────┘
 (Overlay with semi-transparent background)
```

### Progress Stages

```
Timeline of Restore Operation:

0% ──→ 10% ──→ 20% ──→ ... ──→ 80% ──→ 100%
 │       │       │              │       │
 └──┬──┘ └──┬──┘ └─────┬─────┘ └──┬──┘
    │       │          │          │
 Validating Restore Starting Refresh Complete
 Backup     Members,   Database   Data
 File       Sales,     State      Ready
           Attendance Updates
```

### Step 4: Completion

```
Success Alert After Restore:
┌────────────────────────┐
│ ✓ Restore Complete     │
├────────────────────────┤
│ Your data has been     │
│ successfully restored. │
│                        │
│       [Dismiss]        │
└────────────────────────┘

Then: Screen shows updated data
      - Last Backup unchanged
      - Member count updated
      - Sales/Attendance updated
      - All data from backup visible
```

## Testing Scenario Visualization

### Before Backup
```
Members List:
├─ Alice
├─ Bob
├─ Charlie
└─ [David] ← NEW member

Sales Records: 15
Attendance: 42 records
```

### After Creating Backup
```
Backup File Created:
📁 PowerliftBackups/
  └─ powerlift_backup_2025-01-15_14-30-45.json
     {
       "members": [Alice, Bob, Charlie, David],
       "sales": 15,
       "attendance": 42,
       ...
     }

Last Backup: 2025-01-15 at 2:30 PM ✓
```

### After Deleting Member
```
Members List:
├─ Alice
├─ Bob
└─ Charlie
   (David is GONE!)

Sales Records: 15
Attendance: 42 records
```

### During Restore (Progress)
```
Progress Modal Shows:

0% ─ [░░░░░░░░░░░░░░░░░░░░░░░░] "Validating..."

20% ─ [████░░░░░░░░░░░░░░░░░░░░] "Restoring..."

50% ─ [████████████░░░░░░░░░░░░] "Restoring..."

80% ─ [████████████████░░░░░░░░] "Refreshing..."

100% ─ [████████████████████████] "Complete!"
```

### After Restore
```
Members List:
├─ Alice
├─ Bob
├─ Charlie
└─ [David] ← RESTORED! ✓

Sales Records: 15 ✓
Attendance: 42 records ✓

Screen shows: "Restore completed successfully!"

Last Backup: Still 2025-01-15 at 2:30 PM
             (Unchanged from earlier backup)
```

## Dark Mode vs Light Mode

### Light Mode
```
┌─────────────────────────────┐
│ Dark Text                   │
│ White Background            │
│ Primary Blue Icons          │
│ Light Borders               │
│ Good Contrast ✓             │
└─────────────────────────────┘
```

### Dark Mode
```
┌─────────────────────────────┐
│ Light Text                  │
│ Dark Background             │
│ Primary Blue Icons          │
│ Dark Borders                │
│ Good Contrast ✓             │
└─────────────────────────────┘
```

## Button States

### Create Backup Button

**Normal State:**
```
┌───────────────────────────────────┐
│  ✓  Create Backup                 │ (Green/Primary)
└───────────────────────────────────┘
```

**Pressed State:**
```
┌───────────────────────────────────┐
│  ✓  Create Backup  (Opacity 0.7)  │ (Slightly faded)
└───────────────────────────────────┘
```

**Loading State:**
```
┌───────────────────────────────────┐
│  ⟳  Creating Backup...             │ (Disabled)
└───────────────────────────────────┘
```

### Restore from Backup Button

**Normal State:**
```
┌───────────────────────────────────┐
│  ⤵️  Restore from Backup            │ (Red/Danger)
└───────────────────────────────────┘
```

**Pressed State:**
```
┌───────────────────────────────────┐
│  ⤵️  Restore from Backup (0.7 opt)  │ (Slightly faded)
└───────────────────────────────────┘
```

**Loading State:**
```
┌───────────────────────────────────┐
│  ⟳  Restoring...                   │ (Disabled)
└───────────────────────────────────┘
```

## Navigation Button in Settings

### Normal State
```
┌────────────────────────────────────────────┐
│  💾  Data Backup & Restore          →      │
│      Protect your gym data                 │
└────────────────────────────────────────────┘
```

### Pressed State (Opacity Changes)
```
┌────────────────────────────────────────────┐
│  💾  Data Backup & Restore          →      │ (Faded)
│      Protect your gym data                 │
└────────────────────────────────────────────┘
```

## File Picker Dialog

```
┌─────────────────────────────────────┐
│  📁 Select Backup File              │
├─────────────────────────────────────┤
│  Location: /DocumentDirectory/      │
│           PowerliftBackups/         │
│                                     │
│  📄 powerlift_backup_2025-01-14...  │
│  📄 powerlift_backup_2025-01-13...  │
│  📄 powerlift_backup_2025-01-12...  │
│                                     │
│        [Cancel]      [Select]       │
└─────────────────────────────────────┘
```

## Data Restoration Result

### Before Restore
```
Dashboard Summary:
├─ Total Members: 3
├─ Total Sales: $1,200
└─ Attendance Today: 8
```

### After Restore
```
Dashboard Summary:
├─ Total Members: 4 ← +1 restored
├─ Total Sales: $1,270 ← restored value
└─ Attendance Today: 12 ← restored records
```

## Icon Reference

- 💾 Database/Save icon - Main feature icon
- ← Back arrow - Navigation
- → Chevron right - Navigate to screen
- ℹ️ Info icon - Information section
- 📈 Chart icon - Data/statistics
- 👥 Users icon - Members count
- 💰 Money icon - Sales count
- 📝 Note icon - Records count
- ⏰ Clock icon - Timestamp
- ✓ Checkmark - Success
- ⚠️ Warning - Confirmation dialog
- ⤵️ Upload arrow - Restore action
- ✓ Download - Create/backup
- ⟳ Loading spinner - In progress

---

This visual guide helps understand the exact UI/UX flow of the Data Backup & Restore feature.
