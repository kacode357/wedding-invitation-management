import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';
import type { Table } from '../../types/table/table.response';

interface UseGetTableByIdReturn {
  table: Table | null;
  isLoading: boolean;
  error: string | null;
  fetchTable: (id: string) => Promise<void>;
}

export function useGetTableById(): UseGetTableByIdReturn {
  const [table, setTable] = useState<Table | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTable = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tableService.getTableById(id);

      if (response.success && response.data?.table) {
        setTable(response.data.table);
      } else {
        setError(response.message || 'Failed to fetch table');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching table';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    table,
    isLoading,
    error,
    fetchTable,
  };
}
