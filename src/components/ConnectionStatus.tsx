import React, { useState, useEffect, useRef } from 'react';
import { ConnectionTracker, checkBackendHealth } from '@/lib/utils';

interface ConnectionStatusProps {
  showDetails?: boolean;
}

interface HealthData {
  status: string;
  timestamp: string;
  uptime: number;
  environment: string;
  port: number;
  nodeVersion: string;
  platform: string;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
  distPath: string;
  distExists: boolean;
  geminiApiKey: string;
  willUseLLM: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ showDetails = false }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [lastCheck, setLastCheck] = useState<number>(0);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Use refs to prevent duplicate calls
  const checkInProgress = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const checkConnection = async () => {
    // Prevent duplicate simultaneous calls
    if (checkInProgress.current) {
      return;
    }
    
    checkInProgress.current = true;
    setIsChecking(true);
    
    try {
      const connected = await checkBackendHealth();
      setIsConnected(connected);
      setLastCheck(Date.now());
      setErrorMessage('');
      
      if (connected) {
        try {
          const response = await fetch('/api/health');
          if (response.ok) {
            const data = await response.json();
            setHealthData(data);
          }
        } catch (error) {
          console.warn('Failed to fetch detailed health data:', error);
        }
      }
    } catch (error) {
      setIsConnected(false);
      setErrorMessage(error instanceof Error ? error.message : 'Connection check failed');
      console.error('Connection check failed:', error);
    } finally {
      setIsChecking(false);
      checkInProgress.current = false;
    }
  };

  useEffect(() => {
    // Initial connection check
    checkConnection();
    
    // Set up interval for periodic checks (every 30 seconds)
    intervalRef.current = setInterval(checkConnection, 30000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleManualCheck = () => {
    if (!isChecking) {
      checkConnection();
    }
  };

  const getStatusColor = () => {
    if (isChecking) return 'text-yellow-600';
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isChecking) return '🔄';
    return isConnected ? '✅' : '❌';
  };

  const getStatusText = () => {
    if (isChecking) return 'Checking...';
    return isConnected ? 'Connected' : 'Disconnected';
  };

  const formatLastCheck = () => {
    if (lastCheck === 0) return 'Never';
    const date = new Date(lastCheck);
    return date.toLocaleTimeString();
  };

  const getMemoryUsage = () => {
    if (!healthData?.memory) return 'N/A';
    const heapUsed = Math.round(healthData.memory.heapUsed / 1024 / 1024);
    const heapTotal = Math.round(healthData.memory.heapTotal / 1024 / 1024);
    return `${heapUsed}MB / ${heapTotal}MB`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 min-w-[300px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Backend Connection
          </h3>
          <button
            onClick={handleManualCheck}
            disabled={isChecking}
            className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
          >
            {isChecking ? 'Checking...' : 'Check Now'}
          </button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Last check: {formatLastCheck()}
          </div>
          
          {showDetails && healthData && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-medium">{healthData.environment}</span>
                </div>
                <div className="flex justify-between">
                  <span>Port:</span>
                  <span className="font-medium">{healthData.port}</span>
                </div>
                <div className="flex justify-between">
                  <span>Uptime:</span>
                  <span className="font-medium">{Math.round(healthData.uptime)}s</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span className="font-medium">{getMemoryUsage()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gemini API:</span>
                  <span className="font-medium">{healthData.geminiApiKey ? '✅' : '❌'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Node Version:</span>
                  <span className="font-medium">{healthData.nodeVersion}</span>
                </div>
              </div>
            </div>
          )}
          
          {errorMessage && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <div className="text-xs text-red-700 dark:text-red-300">
                ⚠️ {errorMessage}
              </div>
            </div>
          )}
          
          {!isConnected && !errorMessage && (
            <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
              <div className="text-xs text-red-700 dark:text-red-300">
                ⚠️ Backend service is not responding. Check if the server is running on port 8001.
              </div>
            </div>
          )}
          
          <div className="text-xs text-gray-400 dark:text-gray-500 text-center pt-2">
            Auto-check every 30s
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionStatus;
