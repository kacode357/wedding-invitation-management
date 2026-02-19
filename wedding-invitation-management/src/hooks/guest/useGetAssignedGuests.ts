import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { Guest, GuestListResponse } from '../../types/guest/guest.response';

interface UseGetAssignedGuestsReturn {
  guests: Guest[];
  count: number;
  isLoading: boolean;
  error: string | null;
  fetchGuests: () => Promise<void>;
}

export function useGetAssignedGuests(): UseGetAssignedGuestsReturn {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GuestListResponse = await guestService.getAssignedGuests();

      if (response.success && response.data) {
        setGuests(response.data.guests);
        setCount(response.data.count);
      } else {
        setError('Failed to fetch assigned guests');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching assigned guests';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    guests,
    count,
    isLoading,
    error,
    fetchGuests,
  };
}
