import api from '../config/axios';
import type { CategoriesResponse } from '../types/category/category.response';

export const categoryService = {
  async getCategories(): Promise<CategoriesResponse> {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data;
  },
};
