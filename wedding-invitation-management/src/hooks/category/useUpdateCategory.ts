import { useState, useCallback } from 'react';
import { categoryService } from '../../services/category.service';
import type { Category } from '../../types/category/category.response';
import type { UpdateCategoryPayload } from '../../types/category/category.payload';

interface UseUpdateCategoryReturn {
  updateCategory: (id: string, payload: UpdateCategoryPayload) => Promise<Category | null>;
  isLoading: boolean;
  error: string | null;
}

export function useUpdateCategory(): UseUpdateCategoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCategory = useCallback(async (id: string, payload: UpdateCategoryPayload): Promise<Category | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.updateCategory(id, payload);

      if (response.success && response.data?.category) {
        return response.data.category;
      } else {
        setError(response.message || 'Failed to update category');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while updating category';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateCategory,
    isLoading,
    error,
  };
}
