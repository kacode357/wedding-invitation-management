import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCategories } from '../hooks/category/useCategories';
import { guestService } from '../services/guest.service';
import type { GuestData } from '../types/guest/guest.payload';

// Storage key for persisting form data
const STORAGE_KEY = 'addGuestFormData';

// Initial empty guest data
const createEmptyGuest = (defaultCategoryId?: number): GuestData => ({
  guestName: '',
  numberOfGuests: 1,
  notes: '',
  categoryId: defaultCategoryId || 0,
});

interface GuestFormData extends GuestData {
  id: string;
}

// Load saved form data from localStorage
const loadSavedData = (): GuestFormData[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load saved form data:', e);
  }
  return [{ id: crypto.randomUUID(), ...createEmptyGuest() }];
};

// Save form data to localStorage
const saveData = (guests: GuestFormData[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(guests));
  } catch (e) {
    console.error('Failed to save form data:', e);
  }
};

// Clear saved form data
const clearSavedData = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear saved data:', e);
  }
};

export default function AddGuestPage() {
  const navigate = useNavigate();
  const { categories, isLoading: isLoadingCategories, error: categoriesError, fetchCategories } = useCategories();
  
  const [guests, setGuests] = useState<GuestFormData[]>(() => loadSavedData());
  const [lastCategoryId, setLastCategoryId] = useState<string>('0');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Save to localStorage whenever guests change
  useEffect(() => {
    saveData(guests);
  }, [guests]);

  const handleChange = (id: string, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Only convert numberOfGuests to number, keep categoryId as string (MongoDB _id is a string)
    const numValue = name === 'numberOfGuests' ? Number(value) : value;
    
    setGuests(prev => prev.map(guest => 
      guest.id === id 
        ? { ...guest, [name]: numValue }
        : guest
    ));
    
    // Track last selected category for auto-fill
    if (name === 'categoryId' && value !== '0') {
      setLastCategoryId(String(value));
    }
  };

  const addMoreGuests = () => {
    // Auto-fill: inherit category from last guest or last selected category
    const lastGuest = guests[guests.length - 1];
    const defaultCategoryId = lastGuest?.categoryId && lastGuest.categoryId !== 0 
      ? lastGuest.categoryId 
      : lastCategoryId !== '0' 
        ? lastCategoryId 
        : 0;
    setGuests(prev => [...prev, { id: crypto.randomUUID(), ...createEmptyGuest(Number(defaultCategoryId)) }]);
  };

  const removeGuest = (id: string) => {
    if (guests.length > 1) {
      setGuests(prev => prev.filter(guest => guest.id !== id));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check if at least one guest has a name and category
    const validGuests = guests.filter(g => {
      const hasName = g.guestName.trim() !== '';
      const hasCategory = g.categoryId !== 0 && g.categoryId !== undefined && g.categoryId !== '';
      return hasName && hasCategory;
    });
    
    if (validGuests.length === 0) {
      toast.error('Please add at least one guest with a name and category');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await guestService.bulkCreateGuests({
        guests: validGuests,
      });

      if (response.success) {
        toast.success(`Successfully added ${validGuests.length} guest${validGuests.length > 1 ? 's' : ''}!`);
        // Clear saved form data after successful submission
        clearSavedData();
        // Reset to single empty form, keeping last selected category for convenience
        setGuests([{ id: crypto.randomUUID(), ...createEmptyGuest(Number(lastCategoryId)) }]);
      } else {
        toast.error(response.message || 'Failed to add guests');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while adding guests';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/home');
  };

  // Custom dropdown component
  const CustomSelect = ({ 
    value, 
    onChange, 
    name, 
    id, 
    placeholder,
    disabled,
    guestIndex
  }: { 
    value: number | string; 
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; 
    name: string; 
    id: string;
    placeholder?: string;
    disabled?: boolean;
    guestIndex: number;
  }) => {
    // Convert value to string for comparison with _id
    const stringValue = String(value);
    const selectedCategory = categories.find(c => c._id === stringValue);
    
    return (
      <div className="relative">
        <select
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="hidden"
        >
          <option value={0}>{placeholder || 'Select'}</option>
          {categories.map((category) => (
            <option key={category._id} value={category._id}>
              {category.name}
            </option>
          ))}
        </select>
        
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setShowDropdown(showDropdown === guestIndex ? null : guestIndex)}
          className={`w-full px-4 py-3 text-left border rounded-xl bg-white transition-all duration-200 flex items-center justify-between ${
            disabled 
              ? 'bg-gray-100 cursor-not-allowed border-gray-200' 
              : value !== 0 
                ? 'border-rose-300 bg-rose-50/50' 
                : 'border-gray-300 hover:border-rose-300 hover:bg-rose-50/30'
          }`}
        >
          <span className={value === 0 ? 'text-gray-400' : 'text-gray-800'}>
            {selectedCategory?.name || (placeholder || 'Select a category')}
          </span>
          <svg className={`w-5 h-5 text-gray-400 transition-transform ${showDropdown === guestIndex ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {showDropdown === guestIndex && !disabled && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
            {categories.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm">No categories available</div>
            ) : (
              categories.map((category) => (
                <button
                  key={category._id}
                  type="button"
                  onClick={() => {
                    // Use the string _id value for categoryId
                    const event = {
                      target: { name, value: category._id }
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onChange(event);
                    setShowDropdown(null);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${
                    (category._id === stringValue) ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                  }`}
                >
                  <span>{category.name}</span>
                  {(category._id === stringValue) && (
                    <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100" onClick={() => setShowDropdown(null)}>
      {/* Header with back navigation */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            {/* Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mr-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            
            {/* Title */}
            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-800">
              Add Guests
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Success Message */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* Categories Loading/Error */}
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
          </div>
        ) : categoriesError ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {categoriesError}
          </div>
        ) : null}

        {/* Guest Forms */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {guests.map((guest, index) => (
            <div 
              key={guest.id} 
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8 relative"
            >
              {/* Guest Number Badge */}
              <div className="absolute -top-3 left-4 bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                Guest {index + 1}
              </div>

              {/* Remove Button */}
              {guests.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeGuest(guest.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                  title="Remove this guest"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              <div className="space-y-5" onClick={(e) => e.stopPropagation()}>
                {/* Guest Name - Required */}
                <div>
                  <label htmlFor={`guestName-${guest.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Guest Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id={`guestName-${guest.id}`}
                    name="guestName"
                    value={guest.guestName}
                    onChange={(e) => handleChange(guest.id, e)}
                    required
                    placeholder="Enter guest name"
                    autoComplete="off"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 hover:border-rose-400 bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                {/* Category - Custom Dropdown */}
                <div>
                  <label htmlFor={`categoryId-${guest.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <CustomSelect
                    id={`categoryId-${guest.id}`}
                    name="categoryId"
                    value={guest.categoryId}
                    onChange={(e) => handleChange(guest.id, e)}
                    placeholder="Select a category"
                    disabled={isLoadingCategories}
                    guestIndex={index}
                  />
                </div>

                {/* Number of Guests */}
                <div>
                  <label htmlFor={`numberOfGuests-${guest.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Guests
                  </label>
                  <input
                    type="number"
                    id={`numberOfGuests-${guest.id}`}
                    name="numberOfGuests"
                    value={guest.numberOfGuests}
                    onChange={(e) => handleChange(guest.id, e)}
                    min="1"
                    max="10"
                    autoComplete="off"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-gray-800 transition-all duration-200"
                  />
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor={`notes-${guest.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    id={`notes-${guest.id}`}
                    name="notes"
                    value={guest.notes}
                    onChange={(e) => handleChange(guest.id, e)}
                    rows={2}
                    placeholder="Any additional notes (optional)"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 bg-white text-gray-800 placeholder-gray-400 transition-all duration-200 resize-none"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Add More Guests Button */}
          <button
            type="button"
            onClick={addMoreGuests}
            className="w-full py-3 px-4 border-2 border-dashed border-rose-300 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Add Another Guest</span>
          </button>

          {/* Submit Buttons */}
          <div className="flex gap-3">
            {/* Add Guests Button */}
            <button
              type="submit"
              disabled={isSubmitting || isLoadingCategories}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span>Add All Guests</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
