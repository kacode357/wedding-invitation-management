import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';
import type { Table } from '../../types/table/table.response';

interface UseAssignGuestsToTableReturn {
  table: Table | null;
  isLoading: boolean;
  error: string | null;
  assignGuests: (tableId: string, guestIds: string[]) => Promise<boolean>;
  reset: () => void;
}

export function useAssignGuestsToTable(): UseAssignGuestsToTableReturn {
  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assignGuests = useCallback(async (tableId: string, guestIds: string[]): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tableService.assignGuestsToTable(tableId, guestIds);

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to assign guests to table');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while assigning guests';
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
    assignGuests,
    reset,
  };
}
