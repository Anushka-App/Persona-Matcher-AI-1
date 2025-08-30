# 🔍 Frontend-Backend Communication Debugging Guide

## 📋 Overview

This guide explains how to debug and monitor communication between the frontend and backend services in the Persona Matcher AI application.

## 🚀 Quick Start

### 1. Start Development Environment
```bash
npm run dev
```

This will:
- Build the React app
- Start backend server on port 8001
- Start frontend on port 3001
- Enable comprehensive logging

### 2. Test Communication
```bash
npm run test:communication
```

This will test all API endpoints and communication channels.

### 3. Test Health Check Optimization
```bash
npm run test:health
```

This will test the rate limiting and caching mechanisms for health checks.

## 🚀 Performance Optimizations

### Health Check Optimization
- **Rate Limiting**: Prevents excessive health check calls (5-second minimum interval)
- **Response Caching**: Returns cached health data for rapid successive calls
- **Memory Management**: Automatic cleanup of old rate limit entries
- **Reduced Logging**: Health checks only logged in debug mode to reduce console noise

### Frontend Caching
- **Health Check Caching**: 10-second cache duration for health check results
- **Duplicate Prevention**: Prevents simultaneous health check calls
- **Smart Intervals**: 30-second auto-check interval with manual override

## 🔧 Logging Configuration

### Backend Logging
The backend server now includes comprehensive logging middleware:

- **Request Logging**: All incoming requests are logged with timestamps
- **Response Logging**: Response status codes and response times
- **Error Logging**: Detailed error tracking with stack traces
- **Health Monitoring**: System health endpoints with detailed metrics

### Frontend Logging
The frontend includes enhanced logging utilities:

- **API Call Tracking**: All fetch requests are logged
- **Response Monitoring**: Response status and timing
- **Error Handling**: Detailed error logging for failed requests
- **Connection Status**: Real-time backend connection monitoring

## 📊 Monitoring Dashboard

### Connection Status Component
A floating connection status component shows:
- ✅ **Connected**: Backend is responding
- ❌ **Disconnected**: Backend is not responding
- 🔄 **Checking**: Currently testing connection
- 📊 **System Details**: Memory usage, uptime, API key status
- 🚫 **Rate Limited**: Prevents excessive health check calls
- 💾 **Cached Results**: Uses cached health data for performance

### Health Check Endpoints
- `/api/health` - Comprehensive system health
- `/api/status` - Basic API status
- `/api/debug` - Detailed debugging information

## 🐛 Debugging Common Issues

### 1. Backend Not Responding
**Symptoms**: Frontend shows "Disconnected" status
**Solutions**:
- Check if backend server is running on port 8001
- Verify no firewall blocking the port
- Check server logs for errors

### 2. API Endpoints Missing
**Symptoms**: 404 errors on API calls
**Solutions**:
- Ensure all endpoints are properly defined in `server/index.ts`
- Check if services are properly imported
- Verify route definitions

### 3. CORS Issues
**Symptoms**: Browser console shows CORS errors
**Solutions**:
- Backend CORS is configured for localhost:3001 and localhost:3000
- Check if frontend is running on correct port
- Verify CORS configuration in server

### 4. Environment Variables
**Symptoms**: Logging not working or wrong configuration
**Solutions**:
- Check `env.local.txt` file exists
- Verify environment variables are loaded
- Restart development environment

## 📝 Log Levels

### Backend Log Levels
- `debug` - Detailed request/response logging
- `info` - Standard information logging
- `warn` - Warning messages
- `error` - Error messages with stack traces

### Frontend Log Levels
- `debug` - Detailed API call logging
- `info` - Standard information logging
- `warn` - Warning messages
- `error` - Error messages

## 🔍 API Endpoints Status

### ✅ Working Endpoints
- `/api/health` - Health check
- `/api/status` - Status information
- `/api/debug` - Debug information
- `/api/personality-quiz/*` - Quiz endpoints
- `/api/user/*` - User management
- `/api/anuschka-circle/*` - Circle features

### ✅ Recently Added Endpoints
- `/api/user/profile` - User profile
- `/api/user/personality-report` - User reports
- `/api/products/recommendations` - Product recommendations
- `/api/user/update-preferences` - User preferences

## 🛠️ Troubleshooting Commands

### Check Backend Status
```bash
curl http://localhost:8001/api/health
```

### Check Frontend Status
```bash
curl http://localhost:3001
```

### View Server Logs
```bash
npm run server
```

### Test Communication
```bash
npm run test:communication
```

## 📱 Frontend Integration

### Using Logged Fetch
Replace standard `fetch` calls with `loggedFetch`:

```typescript
import { loggedFetch } from '@/lib/utils';

// This will automatically log all API calls
const response = await loggedFetch('/api/user/profile');
```

### Connection Status Component
The `ConnectionStatus` component is automatically included in the main App and shows:
- Real-time connection status
- System health information
- Manual connection testing

## 🔄 Development Workflow

1. **Start Services**: `npm run dev`
2. **Monitor Logs**: Watch console for detailed logging
3. **Check Status**: Use connection status component
4. **Test APIs**: Use test script to verify endpoints
5. **Debug Issues**: Use logging information to identify problems

## 📚 Additional Resources

- **Server Logs**: Check terminal running `npm run dev`
- **Browser Console**: Frontend logging and errors
- **Network Tab**: Browser developer tools for API calls
- **Health Endpoints**: `/api/health` for system status

## 🆘 Getting Help

If you encounter issues:

1. Check the logs for error messages
2. Verify all services are running
3. Test communication with `npm run test:communication`
4. Check the connection status component
5. Review this documentation

---

**Last Updated**: $(date)
**Version**: 1.0.0
