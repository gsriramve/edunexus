'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessagePayload } from 'firebase/messaging';
import {
  requestNotificationPermission,
  getFCMToken,
  onForegroundMessage,
  PushNotificationPayload,
} from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface UsePushNotificationsOptions {
  userId: string;
  tenantId: string;
  autoRegister?: boolean;
}

interface UsePushNotificationsReturn {
  permission: NotificationPermission | 'default';
  isSupported: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  registerToken: () => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;
}

export function usePushNotifications({
  userId,
  tenantId,
  autoRegister = true,
}: UsePushNotificationsOptions): UsePushNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission | 'default'>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  const { toast } = useToast();

  // Check browser support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'Notification' in window && 'serviceWorker' in navigator;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
      }
    }
  }, []);

  // Handle foreground messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload: MessagePayload) => {
      const notification = payload.notification;
      if (notification) {
        // Show toast for foreground notifications
        toast({
          title: notification.title || 'New Notification',
          description: notification.body,
        });

        // Optionally show browser notification too
        if (permission === 'granted' && notification.title) {
          new Notification(notification.title, {
            body: notification.body,
            icon: notification.icon || '/icons/icon-192x192.png',
          });
        }
      }
    });

    return () => unsubscribe();
  }, [permission, toast]);

  // Register token with backend
  const registerTokenWithBackend = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const response = await fetch(`${API_URL}/notifications/push/register-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-tenant-id': tenantId,
          },
          body: JSON.stringify({
            userId,
            tenantId,
            token,
            deviceType: 'web',
            deviceName: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser',
            deviceModel: navigator.platform,
            appVersion: '1.0.0',
          }),
        });

        const data = await response.json();
        if (data.success) {
          setCurrentToken(token);
          setIsRegistered(true);
          // Store token in localStorage for reference
          localStorage.setItem('fcm_token', token);
          return true;
        } else {
          throw new Error(data.error || 'Failed to register token');
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to register token';
        console.error('Error registering token:', errorMessage);
        setError(errorMessage);
        return false;
      }
    },
    [userId, tenantId],
  );

  // Unregister token from backend
  const unregisterTokenFromBackend = useCallback(async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/notifications/push/unregister-token`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentToken(null);
        setIsRegistered(false);
        localStorage.removeItem('fcm_token');
        return true;
      } else {
        throw new Error(data.error || 'Failed to unregister token');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unregister token';
      console.error('Error unregistering token:', errorMessage);
      setError(errorMessage);
      return false;
    }
  }, []);

  // Request notification permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const permissionResult = await requestNotificationPermission();
      setPermission(permissionResult);

      if (permissionResult === 'granted') {
        return true;
      } else if (permissionResult === 'denied') {
        setError('Notification permission denied. Please enable notifications in your browser settings.');
        return false;
      } else {
        setError('Notification permission not granted');
        return false;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to request permission';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Register for push notifications
  const registerToken = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await getFCMToken();
      if (!token) {
        setError('Failed to get FCM token');
        return false;
      }

      const registered = await registerTokenWithBackend(token);
      return registered;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register for push notifications';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, requestPermission, registerTokenWithBackend]);

  // Unregister from push notifications
  const unregisterToken = useCallback(async (): Promise<boolean> => {
    if (!currentToken) {
      // Try to get token from localStorage
      const storedToken = localStorage.getItem('fcm_token');
      if (storedToken) {
        return unregisterTokenFromBackend(storedToken);
      }
      return true; // Already unregistered
    }

    setIsLoading(true);
    setError(null);

    try {
      return await unregisterTokenFromBackend(currentToken);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to unregister';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentToken, unregisterTokenFromBackend]);

  // Auto-register on mount if permission granted and not already registered
  useEffect(() => {
    if (autoRegister && isSupported && permission === 'granted' && !isRegistered && userId && tenantId) {
      // Check if we have a stored token
      const storedToken = localStorage.getItem('fcm_token');
      if (storedToken) {
        // Re-register with stored token
        registerTokenWithBackend(storedToken);
      } else {
        // Get new token and register
        registerToken();
      }
    }
  }, [autoRegister, isSupported, permission, isRegistered, userId, tenantId, registerToken, registerTokenWithBackend]);

  return {
    permission,
    isSupported,
    isRegistered,
    isLoading,
    error,
    requestPermission,
    registerToken,
    unregisterToken,
  };
}

// Send push notification via API
export async function sendPushNotification(
  tenantId: string,
  userId: string,
  notification: PushNotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/notifications/push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        userId,
        tenantId,
        notification,
      }),
    });

    return await response.json();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send notification';
    return { success: false, error: errorMessage };
  }
}

// Send bulk push notification
export async function sendBulkPushNotification(
  tenantId: string,
  userIds: string[],
  notification: PushNotificationPayload,
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_URL}/notifications/push/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-tenant-id': tenantId,
      },
      body: JSON.stringify({
        userIds,
        tenantId,
        notification,
      }),
    });

    return await response.json();
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to send notifications';
    return { success: false, error: errorMessage };
  }
}
