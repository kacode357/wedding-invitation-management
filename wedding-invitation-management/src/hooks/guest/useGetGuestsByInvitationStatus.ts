import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { Guest, GuestListResponse } from '../../types/guest/guest.response';

interface UseGetGuestsByInvitationStatusReturn {
  guests: Guest[];
  count: number;
  isLoading: boolean;
  error: string | null;
  fetchGuests: (status: 'invited' | 'uninvited') => Promise<void>;
}

export function useGetGuestsByInvitationStatus(): UseGetGuestsByInvitationStatusReturn {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGuests = useCallback(async (status: 'invited' | 'uninvited'): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GuestListResponse = await guestService.getGuestsByInvitationStatus(status);

      if (response.success && response.data) {
        setGuests(response.data.guests);
        setCount(response.data.count);
      } else {
        setError('Failed to fetch guests by invitation status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching guests by invitation status';
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
