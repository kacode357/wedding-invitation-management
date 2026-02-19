import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';
import type { Table } from '../../types/table/table.response';

interface UseSwapGuestsReturn {
  table: Table | null;
  isLoading: boolean;
  error: string | null;
  swapGuests: (guestId1: string, guestId2: string) => Promise<boolean>;
  reset: () => void;
}

export function useSwapGuests(): UseSwapGuestsReturn {
  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const swapGuests = useCallback(async (guestId1: string, guestId2: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tableService.swapGuests(guestId1, guestId2);

      if (response.success) {
        if (response.table) {
          setTable(response.table);
        }
        return true;
      } else {
        setError(response.message || 'Failed to swap guests');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while swapping guests';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setTable(null);
    setError(null);
  }, []);

  return {
    table,
    isLoading,
    error,
    swapGuests,
    reset,
  };
}
