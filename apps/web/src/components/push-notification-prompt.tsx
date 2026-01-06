'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, X, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/use-push-notifications';

interface PushNotificationPromptProps {
  userId: string;
  tenantId: string;
  variant?: 'banner' | 'card' | 'minimal';
  showOnce?: boolean;
}

export function PushNotificationPrompt({
  userId,
  tenantId,
  variant = 'card',
  showOnce = true,
}: PushNotificationPromptProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  const {
    permission,
    isSupported,
    isRegistered,
    isLoading,
    error,
    registerToken,
  } = usePushNotifications({ userId, tenantId, autoRegister: false });

  useEffect(() => {
    // Don't show if not supported
    if (!isSupported) return;

    // Don't show if already granted and registered
    if (permission === 'granted' && isRegistered) return;

    // Don't show if denied
    if (permission === 'denied') return;

    // Check if dismissed before
    if (showOnce) {
      const dismissed = localStorage.getItem('push_prompt_dismissed');
      if (dismissed) return;
    }

    // Show prompt after a delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isSupported, permission, isRegistered, showOnce]);

  const handleEnable = async () => {
    const success = await registerToken();
    if (success) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowPrompt(false);
    if (showOnce) {
      localStorage.setItem('push_prompt_dismissed', 'true');
    }
  };

  if (!showPrompt || isDismissed) return null;

  if (variant === 'minimal') {
    return (
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-primary p-3 text-primary-foreground shadow-lg">
        <Bell className="h-5 w-5" />
        <span className="text-sm">Enable notifications?</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={handleEnable}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enable'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleDismiss}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background p-4 shadow-lg">
        <div className="container flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">Stay Updated</p>
              <p className="text-sm text-muted-foreground">
                Enable push notifications to receive important updates about fees, exams, and announcements.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDismiss}>
              Not Now
            </Button>
            <Button onClick={handleEnable} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Enable
                </>
              )}
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-2 text-center text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-base">Push Notifications</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <CardDescription>
            Get instant updates about fee deadlines, exam results, attendance alerts, and important announcements.
          </CardDescription>
          {error && (
            <p className="mt-2 text-sm text-destructive">{error}</p>
          )}
        </CardContent>
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleDismiss}
          >
            Maybe Later
          </Button>
          <Button
            className="flex-1"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Enable'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Settings component for managing notifications
interface NotificationSettingsProps {
  userId: string;
  tenantId: string;
}

export function NotificationSettings({ userId, tenantId }: NotificationSettingsProps) {
  const {
    permission,
    isSupported,
    isRegistered,
    isLoading,
    error,
    registerToken,
    unregisterToken,
  } = usePushNotifications({ userId, tenantId, autoRegister: false });

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Manage push notification settings for this device.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Permission Status</p>
              <p className="text-sm text-muted-foreground capitalize">{permission}</p>
            </div>
            <div
              className={`h-3 w-3 rounded-full ${
                permission === 'granted' ? 'bg-green-500' : permission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Registration Status</p>
              <p className="text-sm text-muted-foreground">
                {isRegistered ? 'Registered for notifications' : 'Not registered'}
              </p>
            </div>
            <div
              className={`h-3 w-3 rounded-full ${isRegistered ? 'bg-green-500' : 'bg-gray-300'}`}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        {isRegistered ? (
          <Button
            variant="destructive"
            onClick={unregisterToken}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Disabling...
              </>
            ) : (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Disable Notifications
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={registerToken}
            disabled={isLoading || permission === 'denied'}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enabling...
              </>
            ) : permission === 'denied' ? (
              <>
                <BellOff className="mr-2 h-4 w-4" />
                Blocked in Browser
              </>
            ) : (
              <>
                <Bell className="mr-2 h-4 w-4" />
                Enable Notifications
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
