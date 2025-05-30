import { useState, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  startLoading: () => void;
  stopLoading: () => void;
  setError: (error: Error | null) => void;
  reset: () => void;
}

export function useLoadingState(initialLoading = false): LoadingState {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState<Error | null>(null);

  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setError,
    reset
  };
}

// Hook for managing multiple loading states
export function useMultipleLoadingStates<T extends string>(
  keys: readonly T[]
): Record<T, LoadingState> {
  const states = {} as Record<T, LoadingState>;
  
  keys.forEach(key => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    states[key] = useLoadingState();
  });

  return states;
}