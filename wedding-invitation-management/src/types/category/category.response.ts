// Category from API
export interface Category {
  _id: string;
  name: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

// For backward compatibility - some APIs return id instead of _id
export interface CategoryWithId {
  id: number;
  name: string;
  description?: string;
}

// Categories list response (wrapped in data)
export interface CategoriesResponse {
  success: boolean;
  data?: {
    categories: Category[];
    count?: number;
  };
  message?: string;
  timestamp?: string;
}

// Categories list response (direct)
export interface CategoriesResponseDirect {
  success: boolean;
  categories?: Category[];
  message?: string;
  timestamp?: string;
}

// Single category response (GET by ID)
export interface CategoryDetailResponse {
  success: boolean;
  data?: {
    category: Category;
  };
  message?: string;
  timestamp?: string;
}

// Category creation response
export interface CategoryCreateResponse {
  success: boolean;
  data?: {
    category: Category;
  };
  message?: string;
  timestamp?: string;
}

// Category update response
export interface CategoryUpdateResponse {
  success: boolean;
  data?: {
    category: Category;
  };
  message?: string;
  timestamp?: string;
}

// Category delete response
export interface CategoryDeleteResponse {
  success: boolean;
  message?: string;
  timestamp?: string;
}