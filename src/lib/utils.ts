import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Connection tracking utilities
export class ConnectionTracker {
  private static instance: ConnectionTracker;
  private connectionStatus: boolean = false;
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 seconds

  private constructor() {}

  static getInstance(): ConnectionTracker {
    if (!ConnectionTracker.instance) {
      ConnectionTracker.instance = new ConnectionTracker();
    }
    return ConnectionTracker.instance;
  }

  setConnectionStatus(status: boolean): void {
    this.connectionStatus = status;
    this.lastCheck = Date.now();
  }

  getConnectionStatus(): boolean {
    return this.connectionStatus;
  }

  getLastCheck(): number {
    return this.lastCheck;
  }

  getCheckInterval(): number {
    return this.checkInterval;
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.status === 'healthy';
    }
    return false;
  } catch (error) {
    console.warn('Backend health check failed:', error);
    return false;
  }
}