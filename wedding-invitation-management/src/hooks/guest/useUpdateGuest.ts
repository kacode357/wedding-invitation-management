import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { UpdateGuestPayload } from '../../types/guest/guest.payload';
import type { Guest } from '../../types/guest/guest.response';

interface UseUpdateGuestReturn {
  isLoading: boolean;
  error: string | null;
  updateGuest: (id: string | number, payload: UpdateGuestPayload) => Promise<{ success: boolean; guest?: Guest }>;
}

export function useUpdateGuest(): UseUpdateGuestReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateGuest = useCallback(async (id: string | number, payload: UpdateGuestPayload): Promise<{ success: boolean; guest?: Guest }> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await guestService.updateGuest(id, payload);

      if (response.success) {
        return { success: true, guest: response.guest };
      } else {
        setError(response.message || 'Failed to update guest');
        return { success: false };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating guest';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    updateGuest,
  };
}
