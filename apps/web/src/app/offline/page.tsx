'use client';

import { WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gray-100 rounded-full">
            <WifiOff className="h-16 w-16 text-gray-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          You&apos;re Offline
        </h1>

        <p className="text-gray-600 mb-6 max-w-sm mx-auto">
          It seems like you&apos;ve lost your internet connection. Some features may not be available.
        </p>

        <div className="space-y-4">
          <Button onClick={handleRetry} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>

          <p className="text-sm text-gray-500">
            Don&apos;t worry, your data is safe. We&apos;ll sync everything once you&apos;re back online.
          </p>
        </div>

        <div className="mt-8 p-4 bg-indigo-50 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-900 mb-2">
            Available Offline Features
          </h3>
          <ul className="text-sm text-indigo-700 space-y-1">
            <li>• View cached attendance records</li>
            <li>• Access previously loaded fees</li>
            <li>• Check saved exam schedules</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
