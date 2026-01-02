#!/bin/bash

# Powerlift Tracker - Offline Verification Script
# Run this before deployment to ensure everything is configured correctly

echo "🔍 Powerlift Tracker - Offline Mode Verification"
echo "================================================"
echo ""

# Check 1: API Request disabled
echo "✓ Check 1: API Request Disabled"
if grep -q 'OFFLINE MODE' client/lib/query-client.ts; then
    echo "  ✅ query-client.ts is in offline mode"
else
    echo "  ❌ query-client.ts may still have backend dependency"
fi
echo ""

# Check 2: WAL mode enabled
echo "✓ Check 2: Database WAL Mode"
if grep -q 'PRAGMA journal_mode = WAL' client/lib/database.ts; then
    echo "  ✅ SQLite WAL mode is enabled"
else
    echo "  ❌ SQLite WAL mode not found"
fi
echo ""

# Check 3: No API calls in client files
echo "✓ Check 3: No Unexpected API Calls"
api_calls=$(grep -r "fetch\|axios\|apiRequest\|getApiUrl" client/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | wc -l)
if [ $api_calls -eq 0 ]; then
    echo "  ✅ No API calls found in client code"
else
    echo "  ⚠️  Found $api_calls potential API references (check if they're in comments)"
fi
echo ""

# Check 4: Dependencies installed
echo "✓ Check 4: Dependencies"
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules exists (dependencies installed)"
else
    echo "  ⚠️  node_modules not found. Run 'npm install' first"
fi
echo ""

# Check 5: SQLite availability
echo "✓ Check 5: SQLite Support"
if grep -q 'expo-sqlite' package.json; then
    echo "  ✅ expo-sqlite is in dependencies"
else
    echo "  ❌ expo-sqlite not found in package.json"
fi
echo ""

# Check 6: AsyncStorage availability
echo "✓ Check 6: AsyncStorage Support"
if grep -q '@react-native-async-storage/async-storage' package.json; then
    echo "  ✅ AsyncStorage is in dependencies"
else
    echo "  ❌ AsyncStorage not found in package.json"
fi
echo ""

# Check 7: Environment variables
echo "✓ Check 7: Environment Variables"
if grep -q "EXPO_PUBLIC_DOMAIN" app.json eas.json .env 2>/dev/null; then
    echo "  ⚠️  EXPO_PUBLIC_DOMAIN still found in config files (optional)"
else
    echo "  ✅ EXPO_PUBLIC_DOMAIN not in config (not needed)"
fi
echo ""

echo "================================================"
echo "✅ Verification Complete!"
echo ""
echo "Next steps:"
echo "1. npm install"
echo "2. npx expo prebuild --clean"
echo "3. eas build --platform android (or ios)"
echo "4. Install APK/IPA on device"
echo "5. Test offline functionality"
echo ""
echo "For detailed instructions, see: OFFLINE_DEPLOYMENT_GUIDE.md"
