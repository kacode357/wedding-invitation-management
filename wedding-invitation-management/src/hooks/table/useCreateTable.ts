import { useState, useCallback } from 'react';
import { tableService } from '../../services/table.service';
import type { CreateTablePayload } from '../../types/table/table.payload';
import type { TableResponse } from '../../types/table/table.response';

interface UseCreateTableReturn {
  createTable: (payload: CreateTablePayload) => Promise<TableResponse | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateTable(): UseCreateTableReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTable = useCallback(async (payload: CreateTablePayload): Promise<TableResponse | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response: TableResponse = await tableService.createTable(payload);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating the table';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createTable,
    isLoading,
    error,
  };
}
