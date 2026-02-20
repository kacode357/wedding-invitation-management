import api from '../config/axios';
import type { CategoriesResponse, CategoryDetailResponse, CategoryCreateResponse, CategoryUpdateResponse, CategoryDeleteResponse } from '../types/category/category.response';
import type { CreateCategoryPayload, UpdateCategoryPayload } from '../types/category/category.payload';

export const categoryService = {
  async getCategories(): Promise<CategoriesResponse> {
    const response = await api.get<CategoriesResponse>('/categories');
    return response.data;
  },

  async getCategoryById(id: string): Promise<CategoryDetailResponse> {
    const response = await api.get<CategoryDetailResponse>(`/categories/${id}`);
    return response.data;
  },

  async createCategory(payload: CreateCategoryPayload): Promise<CategoryCreateResponse> {
    const response = await api.post<CategoryCreateResponse>('/categories', payload);
    return response.data;
  },

  async updateCategory(id: string, payload: UpdateCategoryPayload): Promise<CategoryUpdateResponse> {
    const response = await api.put<CategoryUpdateResponse>(`/categories/${id}`, payload);
    return response.data;
  },

  async deleteCategory(id: string): Promise<CategoryDeleteResponse> {
    const response = await api.delete<CategoryDeleteResponse>(`/categories/${id}`);
    return response.data;
  },
};
