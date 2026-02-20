import { useState, useCallback } from 'react';
import { categoryService } from '../../services/category.service';

interface UseDeleteCategoryReturn {
  deleteCategory: (id: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function useDeleteCategory(): UseDeleteCategoryReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteCategory = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.deleteCategory(id);

      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete category');
        return false;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while deleting category';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    deleteCategory,
    isLoading,
    error,
  };
}
