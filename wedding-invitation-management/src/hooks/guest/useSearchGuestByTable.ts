import { useState, useCallback } from 'react';
import { guestService } from '../../services/guest.service';
import type { Guest, GuestSearchTableResponse, TableInfo } from '../../types/guest/guest.response';

interface UseSearchGuestByTableReturn {
  guest: Guest | null;
  table: TableInfo | null;
  tableGuests: Guest[];
  isLoading: boolean;
  error: string | null;
  searchGuestByTable: (guestId: string) => Promise<void>;
  reset: () => void;
}

export function useSearchGuestByTable(): UseSearchGuestByTableReturn {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [table, setTable] = useState<TableInfo | null>(null);
  const [tableGuests, setTableGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchGuestByTable = useCallback(async (guestId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: GuestSearchTableResponse = await guestService.searchGuestByTable(guestId);

      if (response.success && response.data) {
        setGuest(response.data.guest);
        setTable(response.data.table);
        setTableGuests(response.data.tableGuests);
      } else {
        setError('Failed to fetch guest information');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while searching for guest';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGuest(null);
    setTable(null);
    setTableGuests([]);
    setError(null);
  }, []);

  return {
    guest,
    table,
    tableGuests,
    isLoading,
    error,
    searchGuestByTable,
    reset,
  };
}
