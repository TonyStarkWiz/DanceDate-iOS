# DanceDate iOS Navigation Architecture

## Overview
This document outlines how the React Native (Expo) navigation structure mirrors your Android app's NavGraph architecture, specifically matching the `ScreenRoutes` class.

## Navigation Structure (Matching ScreenRoutes)

### 1. Root Layout (`app/_layout.tsx`)
- **Authentication Flow**: Controls access to main app
- **Loading State**: Shows loading screen while checking auth
- **Stack Navigation**: Manages screen transitions

### 2. Onboarding & Authentication Flow

#### Entry Screen (`/entry`)
- **Entry Point**: First screen users see
- **Navigation**: `Get Started` → `/welcome`

#### Welcome Screen (`/welcome`)
- **Main Welcome**: Entry point with shimmer effect
- **Navigation Options**:
  - `Continue with Google` → TODO: Implement Google Auth
  - `Log In with Email` → `/login`
  - `Create Account` → `/create_account`
  - `Continue as Guest` → TODO: Implement anonymous auth
  - `Take the Tour` → `/takeTour`

#### Onboarding Welcome (`/onboardingWelcome`)
- **Onboarding Entry**: Welcome to dance journey
- **Navigation Options**:
  - `Take the Tour` → `/takeTour`
  - `Skip to App` → `/(tabs)`

#### Take Tour Screen (`/takeTour`)
- **5-Step Onboarding**: App features and benefits
- **Navigation**:
  - `Skip Tour` → `/(tabs)` (main app)
  - `Next/Get Started` → `/(tabs)` (main app)

#### Create Account Screen (`/create_account`)
- **Fields**: Email, Username, Password, Confirm Password
- **Navigation**:
  - `Create Account` button → TODO: Implement registration
  - `Sign In` link → `/login`

#### Login Screen (`/login`)
- **Fields**: Email, Password, Username
- **Navigation**: 
  - `Sign In` button → TODO: Implement auth logic
  - `Sign Up` link → `/create_account`

### 3. Main App Flow (`app/(tabs)/_layout.tsx`)

#### Tab Navigation Order (as requested):
1. **Feed** (`/feed`) - Social feed and updates
2. **Events** (`/index`) - **HOME SCREEN** - Event discovery
3. **Ball** (`/ball`) - Ball events and competitions
4. **Classes** (`/classes`) - Dance classes and workshops
5. **Matches** (`/matches`) - Partner matching

### 4. Event Management

#### Event List Screen (`/event_list`)
- **Event Discovery**: List of available dance events
- **Navigation**: Event cards → `/eventDetail/[title]/[instructor]/[location]`

#### Event Detail Screen (`/eventDetail/[title]/[instructor]/[location]`)
- **Dynamic Route**: Event details with parameters
- **Navigation**: `Book Now` → `/bookingConfirmation/[eventTitle]`

#### Event Detail By ID (`/event_detail/[title]/[instructor]/[location]/[eventId]`)
- **Dynamic Route**: Event details with ID parameter
- **Navigation**: TODO: Implement

#### Booking Confirmation (`/bookingConfirmation/[eventTitle]`)
- **Dynamic Route**: Booking success confirmation
- **Navigation**: `Done` → `/(tabs)` (main app)

### 5. Profile & Settings

#### Profile Screen (`/profile_screen`)
- **Main Profile**: User profile view
- **Navigation**: TODO: Implement

#### Profile (`/profile/[partnerId]`)
- **Dynamic Route**: View other user profiles
- **Navigation**: TODO: Implement

#### Edit Profile (`/edit_profile`)
- **Profile Editing**: Edit user profile
- **Navigation**: TODO: Implement

#### Settings and Activity (`/settings_and_activity`)
- **Settings**: User settings and activity
- **Navigation**: TODO: Implement

### 6. Chat System

#### Chat (`/chat/[partnerId]?prefill={prefill}&autoSend={autoSend}`)
- **Dynamic Route**: Individual chat with partner
- **Query Parameters**: prefill, autoSend
- **Navigation**: TODO: Implement

#### Chat List (`/chat_list`)
- **Chat Overview**: List of all chats
- **Navigation**: TODO: Implement

### 7. Video Features

#### Video Upload (`/video_upload`)
- **Video Management**: Upload dance videos
- **Navigation**: TODO: Implement

#### Video Library (`/video_library`)
- **Video Collection**: User's video library
- **Navigation**: TODO: Implement

#### Video Detail (`/video_detail/[videoId]`)
- **Dynamic Route**: Video detail view
- **Navigation**: TODO: Implement

#### Video Debug (`/video_debug`)
- **Debug Tools**: Video debugging tools
- **Navigation**: TODO: Implement

### 8. Premium Features

#### Paywall (`/paywall`)
- **Premium Features**: Subscription and premium features
- **Navigation**: TODO: Implement

### 9. Matching

#### All Matches (`/allMatches`)
- **Match Overview**: All potential matches
- **Navigation**: TODO: Implement

## Key Differences from Android

### 1. Navigation Library
- **Android**: Jetpack Compose Navigation
- **React Native**: Expo Router (file-based routing)

### 2. State Management
- **Android**: Hilt ViewModels
- **React Native**: React hooks + Context (TODO: Add Redux/Zustand)

### 3. Authentication
- **Android**: Firebase Auth with Hilt
- **React Native**: Firebase Auth (TODO: Implement)

## Implementation Status

### ✅ Completed
- Entry Screen
- Welcome Screen with shimmer effect
- Onboarding Welcome Screen
- Create Account Screen
- Login Screen
- Take Tour Screen
- Event List Screen
- Event Detail Screen (dynamic route)
- Booking Confirmation Screen (dynamic route)
- Basic tab navigation structure
- Navigation between auth screens

### 🚧 In Progress
- Profile screens
- Chat system
- Video features
- Matching system

### ❌ TODO
- Firebase Authentication integration
- State management (Redux/Zustand)
- API integration for events
- Real-time matching system
- Video upload functionality
- Payment integration

## Testing Navigation

### Current Routes Available:
1. **http://localhost:8082/entry** - Entry screen
2. **http://localhost:8082/welcome** - Welcome screen
3. **http://localhost:8082/onboardingWelcome** - Onboarding welcome
4. **http://localhost:8082/takeTour** - Onboarding tour
5. **http://localhost:8082/create_account** - Create account
6. **http://localhost:8082/login** - Login
7. **http://localhost:8082/event_list** - Event list
8. **http://localhost:8082/eventDetail/[title]/[instructor]/[location]** - Event details
9. **http://localhost:8082/bookingConfirmation/[eventTitle]** - Booking confirmation
10. **http://localhost:8082/(tabs)** - Main app tabs

### Navigation Flow:
- Entry → Welcome → Create Account/Login (bidirectional)
- Welcome → Onboarding Welcome → Take Tour → Main App
- Event List → Event Detail → Booking Confirmation → Main App
- All auth screens can navigate to each other

## Architecture Benefits

1. **Exact Route Matching**: Mirrors your Android `ScreenRoutes` exactly
2. **File-based Routing**: Easy to understand and maintain
3. **Type Safety**: TypeScript throughout
4. **Component Reusability**: Shared components across screens
5. **Consistent Design**: Same visual language as Android app
6. **Scalable Structure**: Easy to add new features

This structure provides a solid foundation that exactly mirrors your Android app's navigation architecture while leveraging React Native and Expo's strengths.
