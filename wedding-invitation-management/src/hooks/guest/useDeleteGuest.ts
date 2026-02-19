import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';

interface UseDeleteGuestReturn {
  isLoading: boolean;
  error: string | null;
  deleteGuest: (id: string | number) => Promise<boolean>;
}

export function useDeleteGuest(): UseDeleteGuestReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteGuest = useCallback(async (id: string | number): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await guestService.deleteGuest(id);

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete guest');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting guest';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    deleteGuest,
  };
}
