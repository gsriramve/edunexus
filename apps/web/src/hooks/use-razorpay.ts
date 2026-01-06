'use client';

import { useCallback, useEffect, useState } from 'react';

// Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description?: string;
  image?: string;
  order_id: string;
  handler: (response: RazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
    escape?: boolean;
    backdropclose?: boolean;
    confirm_close?: boolean;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  close: () => void;
  on: (event: string, handler: (response: any) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Razorpay script
  const loadScript = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Already loaded
    if (window.Razorpay) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(`script[src="${RAZORPAY_SCRIPT_URL}"]`);
    if (existingScript) {
      existingScript.addEventListener('load', () => setIsLoaded(true));
      return;
    }

    setIsLoading(true);
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT_URL;
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
    };

    script.onerror = () => {
      setError('Failed to load Razorpay checkout');
      setIsLoading(false);
    };

    document.body.appendChild(script);
  }, []);

  // Auto-load script on mount
  useEffect(() => {
    loadScript();
  }, [loadScript]);

  // Open checkout
  const openCheckout = useCallback(
    (options: {
      orderId: string;
      amount: number;
      currency: string;
      name: string;
      description?: string;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      onSuccess: (response: RazorpayResponse) => void;
      onError?: (error: any) => void;
      onDismiss?: () => void;
    }) => {
      if (!isLoaded || !window.Razorpay) {
        console.error('Razorpay not loaded');
        options.onError?.({ error: 'Razorpay not loaded' });
        return;
      }

      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKeyId) {
        console.error('Razorpay key not configured');
        options.onError?.({ error: 'Razorpay key not configured' });
        return;
      }

      const razorpayOptions: RazorpayOptions = {
        key: razorpayKeyId,
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description || 'Fee Payment',
        order_id: options.orderId,
        handler: options.onSuccess,
        prefill: options.prefill,
        theme: {
          color: '#4F46E5', // Indigo color matching the app theme
        },
        modal: {
          ondismiss: options.onDismiss,
          escape: true,
          backdropclose: false,
          confirm_close: true,
        },
      };

      try {
        const razorpay = new window.Razorpay(razorpayOptions);
        razorpay.on('payment.failed', (response: any) => {
          options.onError?.(response.error);
        });
        razorpay.open();
      } catch (err) {
        console.error('Error opening Razorpay checkout:', err);
        options.onError?.(err);
      }
    },
    [isLoaded]
  );

  return {
    isLoaded,
    isLoading,
    error,
    openCheckout,
    loadScript,
  };
}

// Hook for payment flow
export function usePaymentFlow() {
  const { isLoaded, isLoading, error, openCheckout } = useRazorpay();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const initiatePayment = useCallback(
    async (options: {
      orderId: string;
      amount: number;
      currency: string;
      name: string;
      description?: string;
      prefill?: {
        name?: string;
        email?: string;
        contact?: string;
      };
      onSuccess: (response: RazorpayResponse) => Promise<void> | void;
      onError?: (error: any) => void;
    }) => {
      setPaymentStatus('processing');
      setPaymentError(null);

      openCheckout({
        ...options,
        onSuccess: async (response) => {
          try {
            await options.onSuccess(response);
            setPaymentStatus('success');
          } catch (err: any) {
            setPaymentStatus('failed');
            setPaymentError(err.message || 'Payment verification failed');
            options.onError?.(err);
          }
        },
        onError: (err) => {
          setPaymentStatus('failed');
          setPaymentError(err?.description || err?.message || 'Payment failed');
          options.onError?.(err);
        },
        onDismiss: () => {
          if (paymentStatus === 'processing') {
            setPaymentStatus('idle');
          }
        },
      });
    },
    [openCheckout, paymentStatus]
  );

  const resetPayment = useCallback(() => {
    setPaymentStatus('idle');
    setPaymentError(null);
  }, []);

  return {
    isRazorpayLoaded: isLoaded,
    isRazorpayLoading: isLoading,
    razorpayError: error,
    paymentStatus,
    paymentError,
    initiatePayment,
    resetPayment,
  };
}
