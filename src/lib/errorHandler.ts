// Global error handler to safely handle third-party embed errors
export const setupGlobalErrorHandler = () => {
  // Handle message port errors from third-party embeds
  const originalAddEventListener = window.addEventListener;
  window.addEventListener = function(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
    if (type === 'message') {
      const wrappedListener = (event: Event) => {
        try {
          if (typeof listener === 'function') {
            listener.call(this, event);
          } else if (listener && typeof listener.handleEvent === 'function') {
            listener.handleEvent(event);
          }
        } catch (error) {
          // Safely ignore message port errors from third-party embeds
          if (error instanceof Error && error.message.includes('port closed')) {
            console.warn('Safely ignored message port error from third-party embed');
            return;
          }
          // Re-throw other errors
          throw error;
        }
      };
      return originalAddEventListener.call(this, type, wrappedListener, options);
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Handle postMessage errors
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message: any, targetOrigin: string, transfer?: Transferable[]) {
    try {
      return originalPostMessage.call(this, message, targetOrigin, transfer);
    } catch (error) {
      // Safely ignore postMessage errors from third-party embeds
      if (error instanceof Error && error.message.includes('port closed')) {
        console.warn('Safely ignored postMessage error from third-party embed');
        return;
      }
      // Re-throw other errors
      throw error;
    }
  };

  // Global error handler for unhandled errors
  window.addEventListener('error', (event) => {
    // Safely ignore message port errors
    if (event.error && event.error.message && event.error.message.includes('port closed')) {
      console.warn('Safely ignored unhandled message port error');
      event.preventDefault();
      return;
    }
    
    // Log other errors but don't block the app
    console.error('Unhandled error:', event.error);
  });

  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Safely ignore message port rejections
    if (event.reason && event.reason.message && event.reason.message.includes('port closed')) {
      console.warn('Safely ignored unhandled message port rejection');
      event.preventDefault();
      return;
    }
    
    // Log other rejections but don't block the app
    console.error('Unhandled promise rejection:', event.reason);
  });
};

// Cleanup function for removing event listeners
export const cleanupEventListeners = () => {
  // This would be called on component unmount if needed
  // For now, the global handler is sufficient
};
