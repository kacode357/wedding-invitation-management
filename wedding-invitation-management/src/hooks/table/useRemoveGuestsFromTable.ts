import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';
import type { Table } from '../../types/table/table.response';

interface UseRemoveGuestsFromTableReturn {
  table: Table | null;
  isLoading: boolean;
  error: string | null;
  removeGuests: (tableId: string, guestIds: string[]) => Promise<boolean>;
  reset: () => void;
}

export function useRemoveGuestsFromTable(): UseRemoveGuestsFromTableReturn {
  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeGuests = useCallback(async (tableId: string, guestIds: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tableService.removeGuestsFromTable(tableId, guestIds);

      if (response.success) {
        if (response.table) {
          setTable(response.table);
        }
        return true;
      } else {
        setError(response.message || 'Failed to remove guests from table');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while removing guests';
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
    removeGuests,
    reset,
  };
}
