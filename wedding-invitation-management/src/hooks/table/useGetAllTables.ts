import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';
import type { Table } from '../../types/table/table.response';

interface UseGetAllTablesReturn {
  tables: Table[];
  count: number;
  isLoading: boolean;
  error: string | null;
  fetchTables: (sort?: string, order?: string) => Promise<void>;
}

export function useGetAllTables(): UseGetAllTablesReturn {
  const [tables, setTables] = useState<Table[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async (sort?: string, order?: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await tableService.getAllTables(sort, order);

      if (response.success && response.data) {
        setTables(response.data.tables);
        setCount(response.data.count);
      } else {
        setError('Failed to fetch tables');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching tables';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tables,
    count,
    isLoading,
    error,
    fetchTables,
  };
}
