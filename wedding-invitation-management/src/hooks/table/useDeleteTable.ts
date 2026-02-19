import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';

interface UseDeleteTableReturn {
  isLoading: boolean;
  error: string | null;
  deleteTable: (id: string) => Promise<boolean>;
}

export function useDeleteTable(): UseDeleteTableReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteTable = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tableService.deleteTable(id);

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete table');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting table';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    deleteTable,
  };
}
