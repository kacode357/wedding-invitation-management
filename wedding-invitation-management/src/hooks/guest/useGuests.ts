import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { BulkGuestPayload } from '../../types/guest/guest.payload';
import type { Guest } from '../../types/guest/guest.response';

interface UseGuestsReturn {
  guests: Guest[];
  isLoading: boolean;
  error: string | null;
  bulkCreateGuests: (payload: BulkGuestPayload) => Promise<boolean>;
}

export function useGuests(): UseGuestsReturn {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const bulkCreateGuests = useCallback(async (payload: BulkGuestPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await guestService.bulkCreateGuests(payload);
      if (response.success && response.data?.guests) {
        setGuests(response.data.guests);
        return true;
      } else {
        setError(response.message || 'Failed to create guests');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating guests';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    guests,
    isLoading,
    error,
    bulkCreateGuests,
  };
}
