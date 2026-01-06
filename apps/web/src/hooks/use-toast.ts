'use client';

import { toast as sonnerToast } from 'sonner';

interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export function useToast() {
  const toast = (props: ToastProps) => {
    const { title, description, variant, duration = 5000 } = props;

    if (variant === 'destructive') {
      sonnerToast.error(title, {
        description,
        duration,
      });
    } else {
      sonnerToast.success(title, {
        description,
        duration,
      });
    }
  };

  return { toast };
}

// Re-export for convenience
export { sonnerToast as toast };
