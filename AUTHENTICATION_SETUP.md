# Authentication Setup Guide

This guide explains how to set up the simplified authentication features for the Anuschka Circle application.

## Features

- **Google Authentication**: Sign in/sign up with Google accounts
- **Mobile Authentication**: Phone number-based authentication with captcha verification
- **Captcha Verification**: Google reCAPTCHA integration (replaces OTP)
- **Seamless Flow**: Users can continue with mobile after Google auth

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication in the left sidebar
4. Go to Authentication > Sign-in method
5. Enable Google provider
6. Go to Project Settings > General
7. Copy your Firebase config values

### 2. Google reCAPTCHA Setup

1. Go to [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Create a new site
3. Choose reCAPTCHA v2 "I'm not a robot" Checkbox
4. Add your domain(s)
5. Copy the Site Key

### 3. Environment Variables

Create a `.env` file in your project root with the following variables:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your_app_id

# Google reCAPTCHA
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_site_key_here
```

### 4. Package Installation

The required packages are already installed:

```bash
npm install react-google-recaptcha @types/react-google-recaptcha firebase
```

## Authentication Flow

### Sign In Page
1. **Google Sign In**: Direct Google authentication
2. **Continue with Mobile**: Navigate to create account with pre-filled phone
3. **Mobile Authentication**: Phone number + captcha verification
4. **Captcha Verification**: Required for all authentication methods

### Create Account Page
1. **Google Sign Up**: Direct Google account creation
2. **Continue with Mobile**: Navigate to sign in with pre-filled phone
3. **Mobile Authentication**: Phone number + captcha verification
4. **Captcha Verification**: Required for all authentication methods

## Mobile Authentication

The system now uses a simplified mobile authentication approach:

- **Phone Number**: User enters their mobile number
- **Captcha Verification**: Google reCAPTCHA replaces traditional OTP
- **No Passwords**: Eliminates password management complexity
- **Simulated Flow**: Currently simulated, ready for real SMS integration

## Security Features

- **Captcha Verification**: Prevents automated attacks and replaces OTP
- **Firebase Security**: Google's enterprise-grade security
- **Input Validation**: Client-side and server-side validation
- **Secure Storage**: Firebase handles secure token storage

## Implementation Details

### Form Fields
- **Full Name**: Required for user identification
- **Phone Number**: Primary authentication method
- **Captcha**: Security verification (replaces OTP)

### Authentication Methods
1. **Google OAuth**: Direct Google account integration
2. **Mobile + Captcha**: Phone number with reCAPTCHA verification

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check environment variables
2. **Captcha not working**: Verify reCAPTCHA site key
3. **Google auth popup blocked**: Check browser popup settings
4. **Environment variables not loading**: Restart development server

### Development vs Production

- **Development**: Uses demo keys and simulated authentication
- **Production**: Requires real Firebase and reCAPTCHA keys

## Testing

1. Test Google authentication with test accounts
2. Verify captcha functionality
3. Test mobile number input validation
4. Verify form submission flow
5. Test error handling

## Next Steps

1. **Implement Real Mobile Authentication**:
   - Integrate with SMS service (Twilio, AWS SNS, etc.)
   - Add real phone number verification
   - Implement SMS delivery confirmation

2. **Enhanced Security**:
   - Add phone number format validation
   - Implement rate limiting for captcha attempts
   - Add device fingerprinting

3. **User Experience**:
   - Add phone number formatting
   - Implement country code selection
   - Add phone number validation feedback

4. **Additional Features**:
   - Add biometric authentication
   - Implement multi-factor authentication
   - Add social login providers (Facebook, Apple)

## Benefits of Simplified Approach

- **Reduced Complexity**: No password management or email verification
- **Better UX**: Faster authentication flow
- **Enhanced Security**: Captcha prevents automated attacks
- **Mobile-First**: Optimized for mobile device usage
- **Lower Friction**: Fewer steps to complete authentication
