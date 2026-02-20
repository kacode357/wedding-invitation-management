import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSearchGuestByTable } from '../hooks/guest/useSearchGuestByTable';
import { useGetAllGuests } from '../hooks/guest/useGetAllGuests';
import type { Guest } from '../types/guest/guest.response';

export default function UserInfoPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get all guests on page load
  const { guests: allGuests, isLoading: isLoadingGuests, error: guestsError, fetchGuests } = useGetAllGuests();
  
  // Search guest by table
  const { 
    guest, 
    table, 
    tableGuests, 
    isLoading: isSearching, 
    error: searchError, 
    searchGuestByTable,
    reset 
  } = useSearchGuestByTable();

  // Fetch all guests on page load
  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  // Filter guests by name as user types
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim() || !allGuests) return [];
    const query = searchQuery.toLowerCase().trim();
    return allGuests.filter(guest => 
      guest.guestName?.toLowerCase().includes(query)
    );
  }, [searchQuery, allGuests]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBack = () => {
    navigate('/home');
  };

  const handleSelectGuest = async (guestItem: Guest) => {
    if (!guestItem._id) {
      toast.error('Guest ID not found');
      return;
    }
    
    setSearchQuery(guestItem.guestName || '');
    setShowDropdown(false);
    
    // Call search/table API
    await searchGuestByTable(guestItem._id);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    reset();
  };

  // Render guest info card
  const renderGuestInfo = () => {
    if (!guest) return null;

    return (
      <div className="space-y-6">
        {/* Guest Details Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
            <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Thông tin khách mời
          </h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Tên khách</p>
              <p className="font-medium text-gray-800">{guest.guestName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Danh mục</p>
              <p className="font-medium text-gray-800">{guest.categoryName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Số khách</p>
              <p className="font-medium text-gray-800">{guest.numberOfGuests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Xác nhận</p>
              <p className="font-medium text-gray-800">{guest.confirmedGuests}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Mời</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                guest.invitationSent 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {guest.invitationSent ? 'Đã gửi' : 'Chưa gửi'}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Đến</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                guest.isArrived 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {guest.isArrived ? 'Rồi' : 'Chưa'}
              </span>
            </div>
          </div>
        </div>

        {/* Table Information Card */}
        {table && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Thông tin bàn
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Tên bàn</p>
                <p className="font-medium text-gray-800">{table.tableName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Số bàn</p>
                <p className="font-medium text-gray-800">{table.tableNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sức chứa</p>
                <p className="font-medium text-gray-800">{table.capacity}</p>
              </div>
            </div>
          </div>
        )}

        {/* Table Guests Card */}
        {tableGuests && tableGuests.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-5 flex items-center gap-2">
              <svg className="w-5 h-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Khách cùng bàn ({tableGuests.length})
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên khách</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Danh mục</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Xác nhận</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Đến</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableGuests.map((tableGuest, index) => (
                    <tr key={tableGuest._id || index} className={tableGuest._id === guest._id ? 'bg-pink-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          {tableGuest._id === guest._id && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-pink-100 text-pink-800 mr-2">
                              Bạn
                            </span>
                          )}
                          <span className="text-sm font-medium text-gray-900">{tableGuest.guestName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tableGuest.categoryName || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tableGuest.numberOfGuests}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {tableGuest.confirmedGuests}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          tableGuest.isArrived 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {tableGuest.isArrived ? 'Rồi' : 'Chưa'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
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
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-gray-800">Thông tin khách mời</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-10 space-y-6">
        {/* Search Guest */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Tìm kiếm khách mời</h2>
          
          {/* Loading state */}
          {isLoadingGuests && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
              <span className="ml-3 text-gray-500">Đang tải danh sách khách...</span>
            </div>
          )}

          {/* Error state */}
          {guestsError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{guestsError}</p>
              <button 
                onClick={() => fetchGuests()}
                className="mt-2 text-sm text-pink-500 hover:text-pink-700 underline"
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Search Input */}
          {!isLoadingGuests && !guestsError && (
            <div className="relative" ref={dropdownRef}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Nhập tên khách mời..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 hover:border-pink-400 bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
                  />
                  {/* Dropdown arrow */}
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {guest && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 focus:ring-4 focus:ring-gray-200 transition-all font-medium"
                  >
                    Xóa
                  </button>
                )}
              </div>

              {/* Dropdown Results */}
              {showDropdown && filteredGuests.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredGuests.map((guestItem) => (
                    <button
                      key={guestItem._id}
                      type="button"
                      onClick={() => handleSelectGuest(guestItem)}
                      className="w-full px-4 py-3 text-left hover:bg-pink-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-800">{guestItem.guestName}</p>
                          <p className="text-sm text-gray-500">{guestItem.categoryName || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Bàn {guestItem.tableName || 'Chưa có'}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* No results */}
              {showDropdown && searchQuery.trim() && filteredGuests.length === 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4">
                  <p className="text-gray-500 text-center">Không tìm thấy khách mời</p>
                </div>
              )}
            </div>
          )}

          {/* Search Error */}
          {searchError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{searchError}</p>
            </div>
          )}

          {/* Searching */}
          {isSearching && (
            <div className="mt-4 flex items-center justify-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
              <span className="ml-2 text-gray-500">Đang tìm kiếm...</span>
            </div>
          )}
        </div>

        {/* Guest Information */}
        {renderGuestInfo()}
      </main>
    </div>
  );
}
