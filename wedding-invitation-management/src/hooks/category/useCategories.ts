import { useState, useCallback } from 'react';
import { categoryService } from '../../services/category.service';
import type { Category } from '../../types/category/category.response';

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await categoryService.getCategories();

      // Handle both response structures: direct or wrapped in data
      const categories = response.data?.categories;
      
      if (response.success && categories) {
        setCategories(categories);
      } else {
        setError(response.message || 'Failed to fetch categories');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while fetching categories';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
  };
}
