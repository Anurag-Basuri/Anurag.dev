'use client';

/**
 * design-system/error/useErrorToast.ts
 * Hook for surfacing async errors as toast notifications.
 * Modules use this instead of manual setError().
 */

import { useCallback } from 'react';
import toast from 'react-hot-toast';
import { ErrorReporter } from './ErrorReporter';

export function useErrorToast(label?: string) {
  const reportError = useCallback(
    (error: unknown, userMessage?: string) => {
      ErrorReporter.captureAsync(error, label);

      const message =
        userMessage ??
        (error instanceof Error ? error.message : 'An unexpected error occurred');

      toast.error(message, {
        id: label ?? 'error',
        duration: 4000,
        style: {
          background: 'rgba(0,0,0,0.85)',
          color: '#f87171',
          border: '1px solid rgba(239,68,68,0.2)',
          backdropFilter: 'blur(12px)',
          borderRadius: '12px',
        },
      });
    },
    [label],
  );

  return { reportError };
}

