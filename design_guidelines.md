# Powerlift Fitness Gym - Mobile App Design Guidelines

## Overview
A professional, modern, gym-themed offline-first mobile application for attendance tracking, member management, and sales reporting. Must be responsive for mobile and tablets in both portrait and landscape orientations.

## Architecture Decisions

### Authentication
- **Secure PIN Login** (4-digit)
  - First install: User creates PIN
  - Future launches: User enters PIN
  - Storage: Flutter Secure Storage
  - Login Screen Layout:
    - Centered Powerlift Fitness Gym logo (not zoomed/stretched)
    - Title: "Welcome to Powerlift Fitness Gym"
    - PIN input field
    - Footer: "Developed by Rov · 2025"

### Navigation Structure
**Collapsible Sidebar Navigation**
- Collapsed width: ~70px
- Expanded width: ~230px
- No overflow when collapsed (adaptive to prevent "Right Overflowed" errors)
- Navigation Items:
  1. Dashboard
  2. Register
  3. Scan QR
  4. Members
  5. Reports
  6. Settings
- Theme toggle at bottom
- Professional layout with icons and labels

### Screen Specifications

#### 1. Dashboard
**Purpose:** Real-time overview of gym operations
- **Stat Cards:**
  - Total Active Members
  - Total Expired Members
  - Today Check-ins
  - Today Check-outs (optional)
  - Today Sales (in pesos)
- **Design:** Red accent, clean spacing, professional gym-style cards

#### 2. Registration Module
**Purpose:** Register new members and process subscriptions
- **Form Fields:**
  - First name, Last name
  - Gender, Age
  - Email, Phone
  - Profile photo capture
  - Membership Type: Student / Regular / Senior
  - Registration Option:
    - A. Member Only
    - B. Member + Monthly Subscription
    - C. Member + Per Session
- **Business Rules:**
  - Membership (full) is yearly with lifetime QR
  - Monthly subscription calculated: subscription_end = subscription_start + 1 month
  - If expired, new subscription starts from current date
  - Auto-record sales based on selection

#### 3. QR Scan Module
**Purpose:** Validate member entry and record attendance
- **Scanner Interface:**
  - Live camera view with QR detection
  - Beep sound on successful scan (assets/sounds/beep.mp3)
  - Vibration on error (HapticFeedback.mediumImpact())
- **Validation Flow:**
  - QR must start with "GYM-"
  - If invalid: Red popup "QR not recognized"
  - If valid: Display member info card with:
    - Full name
    - Profile photo
    - Membership type
    - Subscription status (active/expired)
    - Expiry date
- **Action Flow:**
  - Active subscription → Record attendance
  - Expired subscription → Prompt: Renew monthly OR Pay per session
  - Member-Only (no subscription) → Offer: Monthly OR Per session
  - Walk-in (no QR) → Manual session sale only
- **Safeguards:**
  - Prevent double scan within 5 seconds
  - Detect invalid QR images

#### 4. Member List Module
**Purpose:** Browse and manage all members
- **Layout:**
  - Search bar at top
  - Grid layout of member cards
- **Member Card:**
  - Profile picture
  - Name
  - Tap to open Member Profile Screen
- **Member Profile Screen:**
  - Name, Member type
  - Subscription start/end dates
  - Renew subscription button
  - Pay per session button
  - View membership card (QR) button

#### 5. Reports Module
**Purpose:** Financial and attendance analytics
- **Filters:** Daily / Weekly / Monthly
- **Summary Cards:**
  - Total Earnings
  - Total Attendance
- **Visualizations:**
  - Bar chart (using fl_chart)
  - List of earnings per day
- **Sales Breakdown Categories:**
  - Membership fee
  - Monthly (student/regular/senior)
  - Session (member/non-member)
- **Export:** PDF and CSV for member lists, attendance, financial summaries (daily/weekly/monthly/annual)

#### 6. Settings Module
**Purpose:** Configure pricing
- **Editable Pricing Fields:**
  - Membership fee
  - Student monthly, Regular monthly, Senior monthly
  - Session member, Session non-member

## Design System

### Color Palette
- **Dark Mode (Default):**
  - Background: Black
  - Primary: Red
  - Accent: Red
- **Light Mode:**
  - Background: White
  - Primary: Red
  - Accent: Red

### Theme System
- Toggle available in sidebar bottom
- Consistent red accent throughout for gym branding
- Dark mode set as default

### Visual Design
- **Logo:** Powerlift Fitness Gym logo (provided) integrated throughout
- **Typography:** Professional, clean, modern gym aesthetic
- **Cards:** Red accent borders/highlights, clean spacing
- **Stat Cards:** Redesigned with red accent, professional gym-style
- **Buttons:** Clear call-to-action styling with red primary color

### Assets & QR Code Design
- **Member QR Code:**
  - Format: "GYM-[unique_id]"
  - Generated automatically for each member
  - Stored as qr_image_path
- **Membership Card Design:**
  - Member name
  - Profile photo
  - QR code (scannable)
  - Downloadable as soft copy
  - Professional gym-themed design
  - NO QR codes for walk-ins/non-members
- **Sounds:**
  - Beep sound file: assets/sounds/beep.mp3

### Responsive Design
- Adaptive for mobile and tablets
- Portrait and landscape orientations
- Sidebar collapses appropriately
- No UI overflow errors
- Grid layouts adjust based on screen size

### Interaction Design
- **Feedback:**
  - Audio beep on successful QR scan
  - Haptic vibration on errors
  - Visual confirmation (green for success, red for error)
- **Validations:**
  - Prevent rapid duplicate scans (5-second cooldown)
  - QR format validation
  - Form field validations