@echo off
REM Powerlift Tracker - Offline Verification Script (Windows)
REM Run this before deployment to ensure everything is configured correctly

echo.
echo 0x1F50D Powerlift Tracker - Offline Mode Verification
echo ================================================
echo.

REM Check 1: API Request disabled
echo 0x2713 Check 1: API Request Disabled
findstr /M "OFFLINE MODE" client\lib\query-client.ts >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   0x2705 query-client.ts is in offline mode
) else (
    echo   0x274C query-client.ts may still have backend dependency
)
echo.

REM Check 2: WAL mode enabled
echo 0x2713 Check 2: Database WAL Mode
findstr /M "PRAGMA journal_mode = WAL" client\lib\database.ts >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   0x2705 SQLite WAL mode is enabled
) else (
    echo   0x274C SQLite WAL mode not found
)
echo.

REM Check 3: Dependencies installed
echo 0x2713 Check 3: Dependencies
if exist "node_modules" (
    echo   0x2705 node_modules exists ^(dependencies installed^)
) else (
    echo   0x26A0 node_modules not found. Run 'npm install' first
)
echo.

REM Check 4: SQLite availability
echo 0x2713 Check 4: SQLite Support
findstr "expo-sqlite" package.json >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   0x2705 expo-sqlite is in dependencies
) else (
    echo   0x274C expo-sqlite not found in package.json
)
echo.

REM Check 5: AsyncStorage availability
echo 0x2713 Check 5: AsyncStorage Support
findstr "@react-native-async-storage/async-storage" package.json >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   0x2705 AsyncStorage is in dependencies
) else (
    echo   0x274C AsyncStorage not found in package.json
)
echo.

echo ================================================
echo 0x2705 Verification Complete!
echo.
echo Next steps:
echo 1. npm install
echo 2. npx expo prebuild --clean
echo 3. eas build --platform android ^(or ios^)
echo 4. Install APK/IPA on device
echo 5. Test offline functionality
echo.
echo For detailed instructions, see: OFFLINE_DEPLOYMENT_GUIDE.md
echo.

pause
