import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { Guest } from '../../types/guest/guest.response';

interface UseMarkArrivedReturn {
  isLoading: boolean;
  error: string | null;
  markArrived: (id: string | number) => Promise<{ success: boolean; guest?: Guest }>;
}

export function useMarkArrived(): UseMarkArrivedReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markArrived = useCallback(async (id: string | number): Promise<{ success: boolean; guest?: Guest }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await guestService.markArrived(id);

      if (response.success) {
        return { success: true, guest: response.guest };
      } else {
        setError(response.message || 'Failed to mark guest as arrived');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while marking guest as arrived';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    markArrived,
  };
}
