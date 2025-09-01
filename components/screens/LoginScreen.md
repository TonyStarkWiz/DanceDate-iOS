# LoginScreen Component

A modern, feature-rich login screen for the DanceDate iOS app with comprehensive validation, error handling, and user experience enhancements.

## Features

### 🎨 **Modern Design**
- Beautiful gradient background with purple/blue theme
- Smooth fade-in and slide-up animations
- Glass-morphism form container with shadows
- Responsive design that works on all screen sizes

### 🔐 **Authentication Features**
- Email and password validation with real-time feedback
- Password visibility toggle
- Remember credentials functionality using AsyncStorage
- Integration with Firebase Auth via AuthContext
- Auto-redirect if user is already authenticated

### 🛡️ **Error Handling**
- Comprehensive validation for email format and password strength
- Specific error messages for different Firebase auth errors:
  - User not found
  - Wrong password
  - Invalid email
  - Network errors
  - Rate limiting
- Real-time error clearing when user starts typing

### 🎯 **User Experience**
- Keyboard avoiding behavior for better mobile experience
- Loading states with activity indicators
- Smooth transitions and animations
- Auto-complete support for email and password fields
- Proper text content types for iOS password autofill

### 🔗 **Navigation Integration**
- Google Sign-In (temporarily disabled with informative message)
- Guest mode with limited functionality warning
- Navigation to create account screen
- Forgot password functionality (placeholder for future implementation)

## Usage

```tsx
import LoginScreen from '@/components/screens/LoginScreen';

// In your route file
export default function LoginRoute() {
  return <LoginScreen />;
}
```

## Props

This component doesn't accept any props as it uses the AuthContext for all authentication logic.

## Dependencies

- `@/contexts/AuthContext` - For authentication state and methods
- `expo-router` - For navigation
- `@react-native-async-storage/async-storage` - For credential persistence
- `expo-linear-gradient` - For gradient background
- `@expo/vector-icons` - For icons

## State Management

The component manages several pieces of local state:

- `email` - User's email input
- `password` - User's password input
- `isPasswordVisible` - Toggle for password visibility
- `isLoading` - Loading state during authentication
- `rememberCredentials` - Toggle for credential persistence
- `emailError` - Email validation error message
- `passwordError` - Password validation error message
- `fadeAnim` - Animation value for fade-in effect
- `slideAnim` - Animation value for slide-up effect

## Validation Rules

### Email Validation
- Required field
- Must be a valid email format (regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`)

### Password Validation
- Required field
- Minimum 6 characters

## Error Handling

The component handles various Firebase authentication errors:

- `auth/user-not-found` - Shows "No account found with this email"
- `auth/wrong-password` - Shows "Incorrect password"
- `auth/invalid-email` - Shows "Invalid email address"
- `auth/too-many-requests` - Shows alert with retry message
- `auth/network-request-failed` - Shows network error alert

## Testing

The component includes comprehensive tests covering:

- Rendering of all UI elements
- Form validation
- Error handling
- User interactions
- Navigation
- Loading states
- Animation behavior

Run tests with:
```bash
npm test LoginScreen.test.tsx
```

## Accessibility

- Proper text content types for screen readers
- Touch targets meet minimum size requirements
- High contrast colors for better visibility
- Clear error messages and feedback

## Future Enhancements

- Password reset functionality
- Biometric authentication (Face ID/Touch ID)
- Social media login options
- Two-factor authentication
- Account recovery options
- Dark mode support
