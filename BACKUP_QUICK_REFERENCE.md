# Backup & Restore - Quick Reference

## 🚀 Quick Start (2 Minutes)

### Create Your First Backup

```
1. Open Settings (⚙️ icon)
2. Scroll to "Data Backup & Restore"
3. Tap "Create Backup" (Green button)
4. Choose where to save:
   - Email to yourself
   - Google Drive
   - Dropbox
   - OneDrive
   - Your computer
5. Done! Your data is saved
```

### Restore from Backup

```
1. Open Settings (⚙️ icon)
2. Scroll to "Data Backup & Restore"
3. Tap "Restore Backup" (Red button)
4. Select your backup file
5. Confirm you want to restore
6. Wait for completion (30 seconds - 2 minutes)
7. Done! Your data is restored
```

---

## 📊 What Gets Backed Up

| Item | Status |
|------|--------|
| Member profiles | ✅ Backed up |
| Member photos | ✅ Backed up |
| Attendance records | ✅ Backed up |
| Sales/transactions | ✅ Backed up |
| Membership fees | ✅ Backed up |
| Session rates | ✅ Backed up |
| PIN code | ❌ NOT backed up (for security) |

---

## 🎯 Common Scenarios

### Scenario 1: Getting a New Device
```
Step 1: Create backup on old device
Step 2: Install app on new device
Step 3: Open Settings on new device
Step 4: Tap "Restore Backup"
Step 5: Select your backup file
Step 6: Done! Your gym data is on the new device
```

### Scenario 2: Device Gets Lost/Damaged
```
Step 1: Use backup file from your email/cloud
Step 2: Install app on replacement device
Step 3: Restore from your saved backup file
Step 4: All your data is recovered
```

### Scenario 3: Regular Data Protection
```
Every Week (Sunday evening):
  1. Go to Settings
  2. Tap "Create Backup"
  3. Save to Google Drive or email
  4. Done - protected for another week!
```

### Scenario 4: Moving to Different Gym Management System
```
Step 1: Create backup in Powerlift
Step 2: Open backup file (JSON format)
Step 3: Export to Excel/CSV if needed
Step 4: Import to new system
```

---

## 💾 Storage & File Names

### Backup File Format
```
powerlift_backup_2025-01-02_15-30-45.json
                    └─ Date  └─ Time
```

### File Size
- Small gym (< 100 members): 50-300 KB
- Medium gym (100-500 members): 300 KB - 2 MB
- Large gym (500+ members): 2-10 MB

### Where to Store
- ☁️ Google Drive (automatic sync)
- ☁️ Dropbox (easy access)
- 📧 Email (to yourself)
- 💾 Computer (local backup)
- 📱 External drive (archive)

---

## ❓ FAQ

**Q: Will backup slow down my app?**
A: No, backups are fast (under 30 seconds) and don't affect app performance.

**Q: Can I restore a partial backup?**
A: No, restore replaces all data. You'll need to manually remove unwanted records afterward.

**Q: How often should I backup?**
A: Weekly for most gyms, daily if you record lots of transactions.

**Q: What if my backup file gets corrupted?**
A: Create a new backup immediately. Keep multiple recent backups.

**Q: Can I backup on Android and restore on iOS?**
A: Yes! Backups work across all platforms.

**Q: What if I forget my PIN after restoring?**
A: You'll need to create a new PIN (it's not in the backup for security).

**Q: Can multiple people use one backup file?**
A: Yes, everyone can restore the same backup file.

**Q: Does backup backup my photos?**
A: Yes, member photos are included in the backup file.

---

## ⚠️ Important Notes

1. **Backups contain sensitive data** - Keep them secure
2. **PIN is NOT backed up** - You'll create a new PIN on restored device
3. **Restoring overwrites data** - Make sure you want to replace current data
4. **Keep multiple backups** - Don't rely on just one copy
5. **Test your backups** - Periodically restore to verify they work

---

## 🆘 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| File picker won't open | Grant storage permission to app |
| "Invalid backup file" | Ensure file is .json, not corrupted |
| Restore takes too long | App is processing data - be patient |
| Can't find backup file | Check email, Downloads, Google Drive |
| Backup button is grayed out | Wait for previous operation to complete |

---

## 📱 Platform Specific Notes

### Android
- Backup files saved to Downloads by default
- Use "Send to" > "Gmail" or cloud app to save
- File manager can locate `powerlift_backup_*.json`

### iOS
- Use Files app to browse saved backups
- iCloud Drive option available
- AirDrop can share with other devices

### Web
- Backups saved to Downloads folder
- Open file in text editor to view
- Can use as reference or for Excel import

---

## 🔗 Related Guides

- [Full Backup Guide](./BACKUP_RESTORE_GUIDE.md)
- [Security Features](./SECURITY_UPDATES.md)
- [Data Persistence](./DATABASE_PERSISTENCE_FIX.md)

---

## 💡 Pro Tips

✅ **DO:**
- Backup weekly
- Store in 2+ locations
- Test restoration process
- Email backups to yourself
- Label files with dates

❌ **DON'T:**
- Store backup in one place only
- Use outdated backup files
- Share backup files on unsecured networks
- Delete backups without verification
- Assume backup is encrypted (it's not)

---

**Last Updated:** January 2, 2025  
**Version:** 1.0
