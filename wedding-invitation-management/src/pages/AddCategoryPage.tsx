import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetCategory } from '../hooks/category/useGetCategory';
import { useCreateCategory } from '../hooks/category/useCreateCategory';
import { useUpdateCategory } from '../hooks/category/useUpdateCategory';
import type { CreateCategoryPayload } from '../types/category/category.payload';

export default function AddCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const { getCategoryById, isLoading: getLoading } = useGetCategory();
  const { createCategory: createCategoryFn, isLoading: createLoading, error: createError } = useCreateCategory();
  const { updateCategory, isLoading: updateLoading, error: updateError } = useUpdateCategory();

  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch existing category if editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchCategory = async () => {
        const category = await getCategoryById(id);
        if (category) {
          setFormData({ name: category.name });
        } else {
          toast.error('Category not found');
          navigate('/categories');
        }
      };
      fetchCategory();
    }
  }, [id, isEditing, getCategoryById, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setFormError('Category name is required');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      if (isEditing && id) {
        const result = await updateCategory(id, { name: formData.name });
        if (result) {
          toast.success('Category updated successfully!');
          navigate('/categories');
        } else {
          toast.error('Failed to update category');
        }
      } else {
        const result = await createCategoryFn(formData);
        if (result) {
          toast.success('Category created successfully!');
          navigate('/categories');
        } else {
          toast.error('Failed to create category');
        }
      }
    } catch (err) {
      setFormError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/categories');
  };

  const operationLoading = createLoading || updateLoading;
  const operationError = createError || updateError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <button 
              onClick={handleBack} 
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-800">
              {isEditing ? 'Edit Category' : 'Add Category'}
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Loading */}
        {getLoading && isEditing && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        )}

        {/* Error Message */}
        {(formError || operationError) && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formError || operationError}</span>
          </div>
        )}

        {/* Form */}
        {!getLoading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8">
              {/* Category Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter category name"
                  autoComplete="off"
                  className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-indigo-400 bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || operationLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl shadow-lg hover:from-indigo-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting || operationLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{isEditing ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{isEditing ? 'Update Category' : 'Create Category'}</span>
                </>
              )}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
