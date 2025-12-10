# Powerlift Fitness Gym

## Overview

Powerlift Fitness Gym is a professional, gym-themed mobile application for attendance tracking, member management, and sales reporting. Built with React Native and Expo, it features a collapsible sidebar navigation, secure PIN authentication, QR code scanning for check-ins, and comprehensive member/subscription management. The app is designed to be responsive for both mobile devices and tablets in portrait and landscape orientations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo SDK 54
- **Navigation**: React Navigation with native stack navigator for screen transitions and a custom collapsible sidebar for main navigation
- **State Management**: React Context API (AppContext) for global app state including authentication, members, attendance, sales, and price settings
- **Data Fetching**: TanStack React Query for server state management
- **Styling**: StyleSheet API with a centralized theme system supporting light/dark modes
- **Animations**: React Native Reanimated for smooth UI transitions

### Authentication System
- **Method**: 4-digit PIN stored securely
- **Storage**: expo-secure-store for native platforms, localStorage fallback for web
- **Flow**: First launch prompts PIN creation; subsequent launches require PIN entry

### Screen Structure
1. **PinScreen** - Authentication entry point
2. **DashboardScreen** - Real-time gym statistics (active/expired members, check-ins, sales)
3. **RegisterScreen** - New member registration with photo capture
4. **ScanQRScreen** - QR code scanning for attendance tracking
5. **MembersScreen** - Member list with search and filtering
6. **MemberDetailScreen** - Individual member profile and history
7. **MemberCardScreen** - Printable/shareable member ID card with QR
8. **ReportsScreen** - Sales and attendance reports with export
9. **SettingsScreen** - Price configuration for memberships and sessions

### Backend Architecture
- **Runtime**: Node.js with Express
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Schema Validation**: Zod via drizzle-zod integration
- **Current Storage**: In-memory storage (MemStorage class) as placeholder

### Data Models
- **Members**: Personal info, membership type (student/regular/senior), subscription dates, QR codes
- **Attendance**: Member check-in/check-out records
- **Sales**: Transaction records for memberships, subscriptions, and sessions
- **Price Settings**: Configurable pricing for all membership and session types

### Path Aliases
- `@/` → `./client/` (frontend code)
- `@shared/` → `./shared/` (shared types and schemas)

## External Dependencies

### Core Services
- **PostgreSQL Database**: Primary data store (configured via DATABASE_URL environment variable)
- **Expo Services**: Build, updates, and development tooling

### Key Third-Party Libraries
- **expo-camera**: QR code scanning functionality
- **expo-image-picker**: Member photo capture
- **expo-secure-store**: Secure PIN storage on native platforms
- **expo-print/expo-sharing**: Member card export and sharing
- **react-native-qrcode-svg**: QR code generation for member cards
- **react-native-view-shot**: Screen capture for card exports

### Build Configuration
- **Babel**: Module resolver for path aliases, Reanimated plugin
- **TypeScript**: Strict mode enabled with Expo base config
- **Drizzle Kit**: Database migrations and schema management