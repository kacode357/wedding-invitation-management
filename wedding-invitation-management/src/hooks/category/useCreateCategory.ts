import { useState, useCallback } from 'react';
import { categoryService } from '../../services/category.service';
import type { Category } from '../../types/category/category.response';
import type { CreateCategoryPayload } from '../../types/category/category.payload';

interface UseCreateCategoryReturn {
  createCategory: (payload: CreateCategoryPayload) => Promise<Category | null>;
  isLoading: boolean;
  error: string | null;
}

export function useCreateCategory(): UseCreateCategoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createCategory = useCallback(async (payload: CreateCategoryPayload): Promise<Category | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.createCategory(payload);

      if (response.success && response.data?.category) {
        return response.data.category;
      } else {
        setError(response.message || 'Failed to create category');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while creating category';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createCategory,
    isLoading,
    error,
  };
}
