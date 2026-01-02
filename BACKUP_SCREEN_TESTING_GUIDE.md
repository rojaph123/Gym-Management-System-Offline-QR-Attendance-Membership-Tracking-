# Data Backup & Restore - Quick Testing Guide

## Access the Feature

### From Main App
1. **Settings Tab** → Located at bottom of screen
2. **Data Backup & Restore Button** → Between "Appearance" and "Membership Fee" sections
3. **Tap the button** → Opens DataBackupScreen with full backup/restore interface

## Test Scenario 1: Create and Restore Backup

### Step 1: Add Member Data
- Go to Members → Register screen
- Add a new member with:
  - Name: "Test Member"
  - Photo (optional)
  - Other details
- Verify member appears in Members list

### Step 2: Create Backup
- Navigate to Settings → Data Backup & Restore
- Tap **"Create Backup"** button (green button)
- Wait for haptic feedback (phone will vibrate)
- See success alert: "Backup created successfully"
- Verify "Last Backup" date updates to current time

### Step 3: Delete Member
- Go to Members list
- Find "Test Member"
- Delete the member (usually swipe or tap delete)
- Verify member is gone from list

### Step 4: Restore from Backup
- Settings → Data Backup & Restore
- Tap **"Restore from Backup"** button (red button)
- File picker opens
- Navigate to folder and select latest backup file
  - File location: Device storage → PowerliftBackups folder
  - Filename format: `powerlift_backup_YYYY-MM-DD_HH-mm-ss.json`
- Tap "Confirm" on warning dialog
- **Progress modal appears** showing:
  - Progress bar (0-100%)
  - Percentage text (e.g., "45%")
  - Status message:
    - "Validating..." (start)
    - "Restoring..." (middle)
    - "Refreshing..." (end)
    - "Complete!" (finish)

### Step 5: Verify Restoration
- Wait for progress to reach 100%
- Success alert: "Restore completed successfully"
- Go to Members list
- **"Test Member" should reappear** with all data intact
- Check other screens:
  - **Reports** → Verify attendance/sales data restored
  - **Dashboard** → Check member count updated

## Test Scenario 2: Progress Bar Display

### Create Large Backup (if many members exist)
1. Ensure app has significant data:
   - 20+ members
   - 50+ sales records
   - 100+ attendance records

2. Create backup → Should complete quickly (< 2 seconds)

3. Delete some data

4. Restore backup
   - **Watch progress modal** progress from 0% to 100%
   - Observe status message changes:
     - Starts: "Validating..."
     - Middle: "Restoring..."
     - End: "Refreshing..."
   - Verify smooth visual transitions

## Test Scenario 3: Error Handling

### Attempt Invalid Restore
1. Settings → Data Backup & Restore
2. Tap "Restore from Backup"
3. Try to select a non-JSON file
4. Should see error: "Invalid backup file"

### Simulate Network/Storage Issue
1. Create backup (should succeed)
2. Delete backup file from device storage
3. Tap "Restore from Backup"
4. Select any backup file
5. See error: "Backup file not found"

## UI Elements Verification

### DataBackupScreen Header
- ✅ "Data Backup & Restore" title
- ✅ Back button (chevron-left icon)
- ✅ "Protect your gym data" subtitle

### Information Section
- ✅ "How to Use" heading with info icon
- ✅ 5-step instructions displayed

### Current Data Stats
- ✅ Members count (red icon)
- ✅ Sales count (green icon)
- ✅ Attendance records count (orange icon)
- ✅ Dividers between stat items

### Last Backup Info
- ✅ Clock icon
- ✅ "Last Backup" label
- ✅ Date/time or "Never" if no backup

### Action Buttons
- **Create Backup**
  - ✅ Green/primary color
  - ✅ Download icon
  - ✅ Text: "Create Backup"
  - ✅ Loading state text: "Creating Backup..."

- **Restore from Backup**
  - ✅ Red/danger color
  - ✅ Upload icon
  - ✅ Text: "Restore from Backup"
  - ✅ Loading state text: "Restoring..."

### Progress Modal (During Restore)
- ✅ Centered on screen
- ✅ Semi-transparent dark overlay
- ✅ Activity indicator (spinning circle)
- ✅ Progress bar (visual width 0-100%)
- ✅ Percentage text (e.g., "67%")
- ✅ Status message below

## Theme Testing

### Dark Mode
1. Settings → Appearance
2. Toggle "Dark Mode" ON
3. Navigate back to Data Backup & Restore
4. Verify:
   - ✅ Background is dark
   - ✅ Text is light/white
   - ✅ Icons are visible
   - ✅ Buttons contrast properly

### Light Mode
1. Toggle "Dark Mode" OFF
2. Navigate back to Data Backup & Restore
3. Verify:
   - ✅ Background is light/white
   - ✅ Text is dark/black
   - ✅ Icons are visible
   - ✅ Buttons contrast properly

## Settings Integration

### Positioning Test
1. Open Settings screen
2. Verify button order from top:
   - ✅ Appearance (with dark mode toggle)
   - ✅ **Data Backup & Restore** (NEW - should be here)
   - ✅ Membership Fee
   - ✅ Monthly Subscription Rates
   - ✅ Per Session Rates

### Button Interaction
- ✅ Tap reduces opacity (visual feedback)
- ✅ Release navigates to DataBackupScreen
- ✅ Back button returns to Settings

## File System Verification

### Backup Files Location
- **Path:** Device Storage → PowerliftBackups folder
- **Filename:** `powerlift_backup_YYYY-MM-DD_HH-mm-ss.json`
- **Format:** Plain text JSON (can view in text editor)

### File Content Validation
Open backup file in text editor:
```json
{
  "members": [...],
  "attendance": [...],
  "sales": [...],
  "priceSettings": {...},
  "timestamp": "...",
  "version": "1.0"
}
```

## Haptic Feedback Testing

### Create Backup Button
- Tap button
- **Feel vibration on device** (haptic feedback)
- Indicates operation started

### Restore Progress Complete
- After progress reaches 100%
- **Feel vibration on device**
- Indicates operation completed

## Navigation Testing

### From Settings
- ✅ Tap Data Backup & Restore button
- ✅ Screen slides in/transitions to DataBackupScreen
- ✅ Header shows "Data Backup & Restore" title

### Back Navigation
- ✅ Tap back button (chevron-left)
- ✅ Or use Android back gesture
- ✅ Returns to Settings screen
- ✅ Settings button still highlighted in bottom tab

## Performance Testing

### Backup Creation Time
- Create backup with 50+ members
- Should complete in **< 2 seconds**
- No UI freezing
- Button shows "Creating Backup..." state

### Restore Time
- Restore backup with 50+ members
- Should complete in **< 5 seconds**
- Progress bar updates smoothly
- Modal stays responsive

### Memory Usage
- App should not crash
- No out-of-memory errors
- Smooth scrolling maintained
- All screens still responsive

## Common Issues & Solutions

### Issue: "Backup folder not available"
- **Solution:** Use mobile device (web has limited file system)
- **Workaround:** Test on Android/iOS simulator instead

### Issue: Progress bar stuck at 0%
- **Solution:** Wait longer (depends on data size)
- **Alternative:** Check console for errors (use Expo dev tools)

### Issue: Restored members don't appear
- **Solution:** 
  - Manually refresh app (pull down)
  - Go to different screen and back to Members
  - Restart app

### Issue: File picker not opening
- **Solution:**
  - Grant file system permissions if prompted
  - Try again
  - Check app settings → Permissions

## Success Criteria

✅ Backup button creates timestamped file
✅ Last backup date displays and updates
✅ Restore file picker opens correctly
✅ Progress modal shows 0-100% during restore
✅ Progress messages display: Validating → Restoring → Refreshing → Complete
✅ Deleted members reappear after restore
✅ All data (sales, attendance) restores correctly
✅ Dark/light theme works properly
✅ Haptic feedback triggers on actions
✅ Navigation to/from screen works smoothly
✅ Error dialogs show for invalid files
✅ Confirmation prevents accidental overwrites
✅ No UI freezing during operations
✅ Button states update (loading, disabled)
✅ Settings positioning is correct

---

**Last Updated:** 2025-01-15
**Status:** Ready for Testing
