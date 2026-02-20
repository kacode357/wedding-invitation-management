import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCreateTable } from '../hooks/table/useCreateTable';
import { tableService } from '../services/table.service';
import type { CreateTablePayload } from '../types/table/table.payload';
import type { Guest } from '../types/guest/guest.response';

export default function AddTablePage() {
  const navigate = useNavigate();
  const { createTable, isLoading: isCreatingTable } = useCreateTable();

  const [availableGuests, setAvailableGuests] = useState<Guest[]>([]);
  const [isLoadingGuests, setIsLoadingGuests] = useState(true);
  const [guestsError, setGuestsError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateTablePayload>({
    tableName: '',
    capacity: 10,
    guestIds: [],
  });

  const [guestSearchTerm, setGuestSearchTerm] = useState('');
  const [guestGroupFilter, setGuestGroupFilter] = useState<string>('all');

  // Calculate total confirmed guests based on selected guest IDs
  const selectedConfirmedGuests = formData.guestIds?.reduce((total, guestId) => {
    const guest = availableGuests.find(g => (g._id || String(g.id)) === guestId);
    return total + (guest?.confirmedGuests || 0);
  }, 0) || 0;

  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailableGuests = async () => {
      setIsLoadingGuests(true);
      setGuestsError(null);

      try {
        const response = await tableService.getAvailableGuests();

        if (response.success && response.data) {
          setAvailableGuests(response.data.guests);
        } else {
          setGuestsError('Failed to load available guests');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading guests';
        setGuestsError(errorMessage);
      } finally {
        setIsLoadingGuests(false);
      }
    };

    fetchAvailableGuests();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' ? Number(value) : value
    }));
  };

  const handleGuestToggle = (guestId: string) => {
    setFormData(prev => {
      const currentGuestIds = prev.guestIds || [];
      const isSelected = currentGuestIds.includes(guestId);

      if (isSelected) {
        return {
          ...prev,
          guestIds: currentGuestIds.filter(id => id !== guestId)
        };
      } else {
        // Calculate total confirmed guests after adding this guest
        const guestToAdd = availableGuests.find(g => (g._id || String(g.id)) === guestId);
        const additionalGuests = guestToAdd?.confirmedGuests || 0;
        const currentConfirmedGuests = currentGuestIds.reduce((total, id) => {
          const guest = availableGuests.find(g => (g._id || String(g.id)) === id);
          return total + (guest?.confirmedGuests || 0);
        }, 0);

        // Check if capacity would be exceeded
        if (currentConfirmedGuests + additionalGuests > (prev.capacity || 10)) {
          setSubmitError(`Cannot add more guests. Banquet table capacity is ${prev.capacity}`);
          setTimeout(() => setSubmitError(null), 3000);
          return prev;
        }
        return {
          ...prev,
          guestIds: [...currentGuestIds, guestId]
        };
      }
    });
  };

  const handleSelectAll = () => {
    // Calculate total confirmed guests if all available guests are selected
    const totalConfirmedIfAllSelected = availableGuests.reduce((total, guest) => {
      return total + (guest.confirmedGuests || 0);
    }, 0);

    if (totalConfirmedIfAllSelected <= (formData.capacity || 10)) {
      setFormData(prev => ({
        ...prev,
        guestIds: availableGuests.map(g => g._id || String(g.id)).filter((id): id is string => !!id)
      }));
    } else {
      setSubmitError(`Cannot select all. Banquet table capacity is ${formData.capacity}`);
      setTimeout(() => setSubmitError(null), 3000);
    }
  };

  const handleDeselectAll = () => {
    setFormData(prev => ({
      ...prev,
      guestIds: []
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!formData.tableName.trim()) {
      toast.error('Please enter a banquet table name');
      return;
    }

    setSubmitError(null);

    try {
      const result = await createTable(formData);

      if (result?.success) {
        toast.success('Banquet table created successfully!');
        // Use setTimeout to ensure toast is shown before navigating
        setTimeout(() => {
          navigate('/tables');
        }, 100);
      } else {
        toast.error(result?.message || 'Failed to create table');
      }
    } catch (err) {
      toast.error('An error occurred while creating the table');
      console.error('Create table error:', err);
    }
  };

  const handleBack = () => {
    navigate('/tables');
  };

  // Extract unique groups for the filter dropdown
  const availableGroups = [...new Set(availableGuests.map(g => g.groupName).filter(Boolean))] as string[];

  // Filter guests by search term AND group filter
  const filteredGuests = availableGuests.filter((guest) => {
    const searchLower = guestSearchTerm.toLowerCase();
    const matchesSearch = guest.guestName.toLowerCase().includes(searchLower) ||
      (guest.categoryName || guest.category)?.toLowerCase().includes(searchLower);

    const matchesGroup = guestGroupFilter === 'all' ||
      (guestGroupFilter === 'none' && !guest.groupName) ||
      guest.groupName === guestGroupFilter;

    return matchesSearch && matchesGroup;
  });

  // Group filtered guests by category for better display
  const guestsByCategory = filteredGuests.reduce((acc, guest) => {
    const category = guest.categoryName || guest.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(guest);
    return acc;
  }, {} as Record<string, Guest[]>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100">
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
              Create Banquet Table
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Error Message */}
        {submitError && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{submitError}</span>
          </div>
        )}

        {/* Guests Loading/Error */}
        {isLoadingGuests ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        ) : guestsError ? (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6">
            {guestsError}
          </div>
        ) : null}

        {/* Table Creation Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Table Details Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-5">Banquet Table Details</h2>

            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Table Name - Required */}
                <div className="flex-[2]">
                  <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-2">
                    Table Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="tableName"
                    name="tableName"
                    value={formData.tableName}
                    onChange={handleChange}
                    required
                    placeholder="e.g., VIP Table, Bridal Party"
                    autoComplete="off"
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
                  />
                </div>

                {/* Capacity - Required */}
                <div className="flex-[1]">
                  <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="capacity"
                    name="capacity"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                    required
                    min={1}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 hover:border-purple-400 bg-white text-gray-800 transition-all duration-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Available Guests Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-800">
                Assign Guests to Seating
              </h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                  disabled={isLoadingGuests}
                >
                  Select All
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={handleDeselectAll}
                  className="text-sm text-gray-500 hover:text-gray-600"
                  disabled={isLoadingGuests}
                >
                  Deselect All
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Selected: {selectedConfirmedGuests} / {formData.capacity || 10} guests ({formData.guestIds?.length || 0} entries)
            </p>

            {/* Search and Filters */}
            <div className="mb-4 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by name or category..."
                  value={guestSearchTerm}
                  onChange={(e) => setGuestSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-12 bg-white/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-gray-800"
                />
                <svg
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="w-full sm:w-48">
                <select
                  value={guestGroupFilter}
                  onChange={(e) => setGuestGroupFilter(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer shadow-sm appearance-none"
                >
                  <option value="all">All Groups</option>
                  <option value="none">No Group</option>
                  {availableGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {isLoadingGuests ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : availableGuests.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <p className="text-gray-500">No unassigned guests available</p>
                <p className="text-sm text-gray-400 mt-1">All guests are already assigned to tables</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {Object.entries(guestsByCategory).map(([category, guests]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {category} ({guests.length})
                    </h3>
                    <div className="space-y-2">
                      {guests.map((guest) => {
                        const guestId = guest._id || String(guest.id);
                        const isSelected = formData.guestIds?.includes(guestId);

                        return (
                          <label
                            key={guestId}
                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${isSelected
                              ? 'bg-purple-50 border-purple-300'
                              : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => guestId && handleGuestToggle(guestId)}
                              className="w-4 h-4 text-purple-500 border-gray-300 rounded focus:ring-purple-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">
                                {guest.guestName}
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                  ({guest.categoryName || guest.category || 'Uncategorized'})
                                </span>
                              </p>
                              <p className="text-[11px] text-gray-500 truncate mt-0.5 flex items-center gap-1">
                                {guest.groupName ? (
                                  <>
                                    <span>{guest.groupName}</span>
                                    {guest.groupPriorityLevel && (
                                      <span className="px-1 bg-gray-100 rounded text-gray-400 font-medium">(P{guest.groupPriorityLevel})</span>
                                    )}
                                  </>
                                ) : (
                                  <span className="italic">No Group</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">
                                Total: {guest.numberOfGuests} guests | Confirmed: {guest.confirmedGuests}
                              </p>
                            </div>
                            {isSelected && (
                              <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreatingTable || isLoadingGuests}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:from-purple-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isCreatingTable ? (
              <>
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Creating Banquet Table...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                <span>Create Banquet Table</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
