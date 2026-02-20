import { useState, useCallback } from 'react';
import { categoryService } from '../../services/category.service';
import type { Category } from '../../types/category/category.response';

interface UseGetCategoryReturn {
  getCategoryById: (id: string) => Promise<Category | null>;
  isLoading: boolean;
  error: string | null;
}

export function useGetCategory(): UseGetCategoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCategoryById = useCallback(async (id: string): Promise<Category | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.getCategoryById(id);

      if (response.success && response.data?.category) {
        return response.data.category;
      } else {
        setError(response.message || 'Failed to fetch category');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching category';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    getCategoryById,
    isLoading,
    error,
  };
}
