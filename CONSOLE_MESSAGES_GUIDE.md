# Console Messages Guide

## Overview
This guide explains the console messages you might see in the browser's developer tools and how to handle them.

## Common Console Messages

### 1. React DevTools Message
```
Download the React DevTools for a better development experience: https://reactjs.org/link/react-devtools
```
**What it is:** A helpful suggestion from React to install the React DevTools browser extension
**Action:** This is optional - you can install the extension for better debugging, or ignore it

### 2. Embed Script Messages
```
load_embeds.js:1 The message port closed before a response was received.
embed_script.js:23 {dataType: undefined}
embed_script.js:23 {environmentVars: {…}}
embed_script.js:23 {dataType: 'floater-button'}
```
**What it is:** Messages from third-party embed scripts (likely chat widgets, analytics, or other services)
**Action:** These are normal and can be safely ignored

### 3. Camera Functionality Logs
```
ImageUploadPage.tsx:176 🎥 Camera option selected, starting camera...
ImageUploadPage.tsx:56 🎥 Starting camera...
ImageUploadPage.tsx:66 🎥 Camera stream obtained: MediaStream
```
**What it is:** Debug logs from the camera functionality in the ImageUploadPage component
**Action:** These have been cleaned up and will only show in development mode

## Console Log Management

### Development vs Production
- **Development:** Console logs are shown to help with debugging
- **Production:** Most console logs are suppressed for cleaner user experience

### Using the Debug Logger
```typescript
import debugLog from '@/lib/debugLogger';

// Only logs in development
debugLog.log('This will only show in development');

// Always logs errors
debugLog.error('This will always show');

// Only logs warnings in development
debugLog.warn('This will only show in development');
```

### Cleaning Up Console Logs
If you want to reduce console noise:

1. **Use the debug logger** instead of `console.log`
2. **Remove unnecessary logs** from production builds
3. **Filter console messages** in browser dev tools

## Browser Console Filtering

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Console tab
3. Use the filter box to:
   - Hide specific message types
   - Filter by source file
   - Show only errors

### Firefox DevTools
1. Open DevTools (F12)
2. Go to Console tab
3. Use the filter options to:
   - Hide specific log levels
   - Filter by source
   - Show only errors

## Troubleshooting

### If you see too many console messages:
1. Check if you're in development mode
2. Use the debug logger for new logs
3. Filter console messages in browser dev tools
4. Consider removing unnecessary third-party scripts

### If you need to debug an issue:
1. Enable all console messages
2. Use the debug logger for structured logging
3. Check the browser's Network tab for API calls
4. Use React DevTools for component debugging

## Best Practices

1. **Use debug logger** for new console logs
2. **Keep error logging** for production
3. **Remove debug logs** before production deployment
4. **Use meaningful log messages** with context
5. **Group related logs** with consistent prefixes
