import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error Boundary caught an error:', error);
    console.error('Error details:', errorInfo);
    
    // Log error to console with detailed information
    console.group('🔍 ERROR DETAILS');
    console.error('Error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Component stack:', errorInfo.componentStack);
    console.groupEnd();
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to localStorage for debugging
    try {
      const errorLog = {
        timestamp: new Date().toISOString(),
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo: {
          componentStack: errorInfo.componentStack
        },
        url: window.location.href,
        userAgent: navigator.userAgent
      };
      
      const existingLogs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      existingLogs.push(errorLog);
      
      // Keep only last 10 errors
      if (existingLogs.length > 10) {
        existingLogs.splice(0, existingLogs.length - 10);
      }
      
      localStorage.setItem('errorLogs', JSON.stringify(existingLogs));
      console.log('📝 Error logged to localStorage for debugging');
    } catch (logError) {
      console.error('Failed to log error to localStorage:', logError);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-8">
          <div className="text-center max-w-2xl">
            <div className="text-6xl mb-4">🚨</div>
            <h1 className="text-2xl font-bold text-red-800 mb-4">
              Something went wrong
            </h1>
            <p className="text-red-600 mb-6">
              We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
            </p>
            
            <div className="bg-white p-4 rounded-lg border border-red-200 mb-6 text-left">
              <h2 className="font-semibold text-red-800 mb-2">Error Details:</h2>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Type:</strong> {this.state.error?.name}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Message:</strong> {this.state.error?.message}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Time:</strong> {new Date().toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Refresh Page
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                🚪 Try Again
              </button>
              
              <button
                onClick={() => window.history.back()}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                ⬅️ Go Back
              </button>
            </div>
            
            <div className="mt-6 text-sm text-gray-500">
              <p>If this error persists, please check the browser console for more details.</p>
              <p>Error ID: {this.state.error?.name}-{Date.now()}</p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
