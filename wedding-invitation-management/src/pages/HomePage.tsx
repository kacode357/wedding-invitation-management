import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/auth/useAuth';
import { useGetAllTables } from '../hooks/table/useGetAllTables';
import { useGetTableById } from '../hooks/table/useGetTableById';
import { useGetUnassignedGuests } from '../hooks/guest/useGetUnassignedGuests';
import { useGetAssignedGuests } from '../hooks/guest/useGetAssignedGuests';
import { useAssignGuestsToTable } from '../hooks/table/useAssignGuestsToTable';
import { useSwapGuests } from '../hooks/table/useSwapGuests';
import { useDeleteTable } from '../hooks/table/useDeleteTable';
import { dashboardService } from '../services/dashboard.service';
import type { Statistics } from '../types/dashboard/dashboard.response';

export default function HomePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Table management state
  const { tables, isLoading: tablesLoading, fetchTables } = useGetAllTables();
  const { table: selectedTable, isLoading: tableDetailLoading, fetchTable: fetchTableDetails } = useGetTableById();
  const { guests: unassignedGuests, isLoading: unassignedLoading, fetchGuests: fetchUnassignedGuests } = useGetUnassignedGuests();
  const { guests: assignedGuests, isLoading: assignedLoading, fetchGuests: fetchAssignedGuests } = useGetAssignedGuests();
  const { isLoading: assigningGuests, assignGuests } = useAssignGuestsToTable();
  const { isLoading: swappingGuests, swapGuests } = useSwapGuests();
  const { isLoading: deletingTable, deleteTable } = useDeleteTable();
  const [showTableModal, setShowTableModal] = useState(false);

  // Swap guests state
  const [showSwapGuestsModal, setShowSwapGuestsModal] = useState(false);
  const [showSwapFromTableModal, setShowSwapFromTableModal] = useState(false);
  const [selectedGuestForSwap, setSelectedGuestForSwap] = useState<string | null>(null);
  const [selectedGuest1, setSelectedGuest1] = useState<string | null>(null);
  const [selectedGuest2, setSelectedGuest2] = useState<string | null>(null);

  // Assign guest to table state
  const [showAssignGuestModal, setShowAssignGuestModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await dashboardService.getDashboard();
        if (response.success && response.statistics) {
          setDashboardData(response.statistics);
        } else {
          setError(response.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred while loading dashboard data';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch tables for table management section
  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCreateTable = () => {
    navigate('/add-table');
  };

  const handleViewTableDetails = async (tableId: string) => {
    await fetchTableDetails(tableId);
    setShowTableModal(true);
  };

  const handleCloseTableModal = () => {
    setShowTableModal(false);
  };

  const handleOpenAssignGuestModal = async (tableId: string) => {
    setSelectedTableId(tableId);
    setSelectedGuestIds([]);
    await fetchUnassignedGuests();
    setShowAssignGuestModal(true);
  };

  const handleCloseAssignGuestModal = () => {
    setShowAssignGuestModal(false);
    setSelectedTableId(null);
    setSelectedGuestIds([]);
  };

  const handleToggleGuestSelection = (guestId: string) => {
    setSelectedGuestIds(prev => 
      prev.includes(guestId) 
        ? prev.filter(id => id !== guestId)
        : [...prev, guestId]
    );
  };

  const handleAssignGuests = async () => {
    if (!selectedTableId || selectedGuestIds.length === 0) return;
    
    const success = await assignGuests(selectedTableId, selectedGuestIds);
    if (success) {
      toast.success(`Successfully assigned ${selectedGuestIds.length} guest(s) to banquet table`);
      handleCloseAssignGuestModal();
      fetchTables(); // Refresh tables
    } else {
      toast.error('Failed to assign guests to banquet table');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100">
      {/* Mobile-friendly Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.87 7 21 10.13 21 14V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V14C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2ZM12 4C11.45 4 11 4.45 11 5C11 5.55 11.45 6 12 6C12.55 6 13 5.55 13 5C13 4.45 12.55 4 12 4ZM5 14V19H19V14C19 11.24 16.76 9 14 9H10C7.24 9 5 11.24 5 14Z"/>
                  </svg>
                </div>
                <span className="text-sm sm:text-xl font-serif font-bold text-gray-800 hidden xs:block">
                  Wedding Invitations
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-3 space-y-3 animate-fade-in">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Dashboard Cards - Responsive Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600">{error}</p>
          </div>
        ) : (
        <div className="space-y-6 sm:space-y-8 mb-8 sm:mb-10 lg:mb-12">
          {/* Main Stats Row */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1: Guests */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{dashboardData?.guests?.total ?? 0}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">Guests</h3>
              <p className="text-xs text-gray-500 hidden sm:block">Total guests</p>
            </div>

            {/* Card 2: Tables */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-5 shadow-lg border border-white/50 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{dashboardData?.tables?.total ?? 0}</span>
              </div>
              <h3 className="text-xs sm:text-sm font-semibold text-gray-800 mb-0.5">Tables</h3>
              <p className="text-xs text-gray-500 hidden sm:block">Total tables</p>
            </div>

          </div>

          {/* Guest Categories */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">View All Guests</h3>
              <button
                onClick={() => navigate('/guests')}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {dashboardData?.guestsByCategory && dashboardData.guestsByCategory.length > 0 ? (
                dashboardData.guestsByCategory.map((cat, index) => (
                  <div key={index} className="flex items-center justify-between bg-gradient-to-r from-rose-50 to-amber-50 px-3 py-2 rounded-lg border border-rose-100">
                    <span className="text-xs sm:text-sm text-gray-700 truncate" title={cat.category}>{cat.category}</span>
                    <span className="text-sm sm:text-base font-bold text-rose-600">{cat.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 col-span-full text-center py-4">No guest categories yet</p>
              )}
            </div>
          </div>

          {/* Table Management */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800">Banquet Table Management</h3>
              <button
                onClick={() => navigate('/tables')}
                className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-1 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {tablesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">No banquet tables created yet</p>
                <button
                  onClick={handleCreateTable}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  Create Table
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                {tables.slice(0, 3).map((table, index) => (
                  <div
                    key={table._id}
                    className={`bg-gradient-to-br from-purple-50 to-rose-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow ${index > 0 ? 'hidden md:block' : ''}`}
                  >
<div className="flex items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">Table number {table.tableNumber} - {table.tableName}</h4>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <span>
                          {table.currentGuests || 0} / {table.capacity} guests
                        </span>
                      </div>
                      {table.availableSeats !== undefined && (
                        <div className="flex items-center gap-2 mt-1">
                          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600">{table.availableSeats} seats available</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewTableDetails(table._id)}
                        className="flex-1 px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleOpenAssignGuestModal(table._id)}
                        className="flex-1 px-3 py-1.5 bg-white border border-purple-200 text-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        Add Guest
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-white/50">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-800 mb-4 sm:mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Add Guest */}
            <button 
              onClick={() => navigate('/add-guest')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all border border-amber-200 active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Add Guest</span>
            </button>

            {/* Create Table */}
            <button 
              onClick={handleCreateTable}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border border-purple-200 active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Create Table</span>
            </button>

            {/* Invited Guests */}
            <button 
              onClick={() => navigate('/invited-guests')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:from-green-100 hover:to-green-200 transition-all border border-green-200 active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Invited</span>
            </button>

            {/* Uninvited Guests */}
            <button 
              onClick={() => navigate('/uninvited-guests')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:from-amber-100 hover:to-amber-200 transition-all border border-amber-200 active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Uninvited</span>
            </button>

            {/* Attendance */}
            <button 
              onClick={() => navigate('/attendance')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl hover:from-rose-100 hover:to-rose-200 transition-all border border-rose-200 active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Attendance</span>
            </button>

            {/* Tables */}
            <button 
              onClick={() => navigate('/tables')}
              className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200 active:scale-95"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </div>
              <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Tables</span>
            </button>
          </div>
        </div>
      </main>

      {/* Table Detail Modal */}
      {showTableModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {selectedTable?.tableName}
                </h3>
                {selectedTable?.tableNumber && (
                  <span className="text-sm text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    Banquet Table {selectedTable.tableNumber}
                  </span>
                )}
              </div>
              <button
                onClick={handleCloseTableModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {tableDetailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-gray-500">Capacity</p>
                    <p className="font-semibold text-gray-800">
                      {selectedTable?.currentGuests || 0} / {selectedTable?.capacity} guests
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Guests at this banquet table</p>
                    {selectedTable?.guests && selectedTable.guests.length > 0 ? (
                      <div className="space-y-2">
                        {selectedTable.guests.map((guest) => (
                          <div
                            key={guest._id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
                            </div>
                            <button
                              onClick={async () => {
                                const guestId = guest._id;
                                if (!guestId) return;
                                await fetchAssignedGuests();
                                setSelectedGuestForSwap(guestId);
                                setShowSwapFromTableModal(true);
                              }}
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Swap with another table"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">No guests assigned to this banquet table yet</p>
                    )}
                  </div>
                </>
              )}
            </div>
            <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={async () => {
                  if (!selectedTable?._id) return;
                  if (confirm('Are you sure you want to delete this table?')) {
                    const success = await deleteTable(selectedTable._id);
                    if (success) {
                      toast.success('Table deleted successfully');
                      handleCloseTableModal();
                      fetchTables();
                    } else {
                      toast.error('Failed to delete table');
                    }
                  }
                }}
                disabled={deletingTable}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {deletingTable ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </>
                )}
              </button>
              <div className="flex-1"></div>
              <button
                onClick={handleCloseTableModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleCloseTableModal();
                  navigate('/add-guest');
                }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
              >
                Add Guest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Guest to Table Modal */}
      {showAssignGuestModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Add Guests to Banquet Table
                </h3>
                <p className="text-sm text-gray-500">
                  Select guests to assign
                </p>
              </div>
              <button
                onClick={handleCloseAssignGuestModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {unassignedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : unassignedGuests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No unassigned guests</p>
                  <p className="text-sm text-gray-500">All guests are already assigned to banquet tables</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {unassignedGuests.map((guest) => {
                    const guestId = guest._id;
                    if (!guestId) return null;
                    return (
                    <label
                      key={guestId}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedGuestIds.includes(guestId)
                          ? 'bg-purple-50 border-purple-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedGuestIds.includes(guestId)}
                        onChange={() => handleToggleGuestSelection(guestId)}
                        className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {guest.numberOfGuests} guest{guest.numberOfGuests > 1 ? 's' : ''}
                      </span>
                    </label>
                  )})}
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleCloseAssignGuestModal}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignGuests}
                disabled={selectedGuestIds.length === 0 || assigningGuests}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {assigningGuests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  `Assign ${selectedGuestIds.length} Guest${selectedGuestIds.length !== 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap Guests Modal */}
      {showSwapGuestsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Swap Guests
                </h3>
                <p className="text-sm text-gray-500">
                  Select two guests to swap between tables
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSwapGuestsModal(false);
                  setSelectedGuest1(null);
                  setSelectedGuest2(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {assignedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : assignedGuests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No assigned guests</p>
                  <p className="text-sm text-gray-500">Assign guests to banquet tables first to swap them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Guest 1 Selection */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Select First Guest</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {assignedGuests
                        .filter(g => g._id !== selectedGuest2)
                        .map((guest) => {
                          const guestId = guest._id;
                          if (!guestId) return null;
                          return (
                        <label
                          key={guestId}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedGuest1 === guestId
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="guest1"
                            checked={selectedGuest1 === guestId}
                            onChange={() => setSelectedGuest1(guestId)}
                            className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
                            <p className="text-xs text-gray-500">
                              {guest.table?.tableName || guest.table?.tableNumber ? `Banquet Table: ${guest.table.tableName || guest.table.tableNumber}` : 'No banquet table'}
                            </p>
                          </div>
                        </label>
                      )})}
                    </div>
                  </div>

                  {/* Swap Icon */}
                  <div className="flex justify-center">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                  </div>

                  {/* Guest 2 Selection */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Select Second Guest</p>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {assignedGuests
                        .filter(g => g._id !== selectedGuest1)
                        .map((guest) => {
                          const guestId = guest._id;
                          if (!guestId) return null;
                          return (
                        <label
                          key={guestId}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            selectedGuest2 === guestId
                              ? 'bg-rose-50 border-rose-200'
                              : 'bg-white border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="guest2"
                            checked={selectedGuest2 === guestId}
                            onChange={() => setSelectedGuest2(guestId)}
                            className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
                            <p className="text-xs text-gray-500">
                              {guest.table?.tableName || guest.table?.tableNumber ? `Banquet Table: ${guest.table.tableName || guest.table.tableNumber}` : 'No banquet table'}
                            </p>
                          </div>
                        </label>
                      )})}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => {
                  setShowSwapGuestsModal(false);
                  setSelectedGuest1(null);
                  setSelectedGuest2(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!selectedGuest1 || !selectedGuest2) return;
                  
                  const success = await swapGuests(selectedGuest1, selectedGuest2);
                  if (success) {
                    toast.success('Successfully swapped guests between banquet tables');
                    setShowSwapGuestsModal(false);
                    setSelectedGuest1(null);
                    setSelectedGuest2(null);
                    const tableId = selectedTable?._id;
                    if (tableId) {
                      fetchTableDetails(tableId);
                    }
                    fetchTables(); // Refresh tables
                  } else {
                    toast.error('Failed to swap guests');
                  }
                }}
                disabled={!selectedGuest1 || !selectedGuest2 || swappingGuests}
                className="flex-1 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {swappingGuests ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Swapping...
                  </>
                ) : (
                  'Swap Guests'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Swap From Table Modal */}
      {showSwapFromTableModal && selectedGuestForSwap && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Swap Guest
                </h3>
                <p className="text-sm text-gray-500">
                  Select a guest from another table to swap with
                </p>
              </div>
              <button
                onClick={() => {
                  setShowSwapFromTableModal(false);
                  setSelectedGuestForSwap(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh]">
              {assignedLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
                </div>
              ) : assignedGuests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">No assigned guests</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {assignedGuests
                    .filter(g => g._id !== selectedGuestForSwap)
                    .map((guest) => (
                    <label
                      key={guest._id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-white border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="radio"
                        name="swapGuest"
                        onChange={async () => {
                          const targetGuestId = guest._id;
                          const currentGuestId = selectedGuestForSwap;
                          if (!targetGuestId || !currentGuestId) return;
                          const success = await swapGuests(currentGuestId, targetGuestId);
                          if (success) {
                            toast.success('Successfully swapped guests between banquet tables');
                            setShowSwapFromTableModal(false);
                            setSelectedGuestForSwap(null);
                            fetchTables();
                            const tableId = selectedTable?._id;
                            if (tableId) {
                              fetchTableDetails(tableId);
                            }
                          } else {
                            toast.error('Failed to swap guests');
                          }
                        }}
                        className="w-4 h-4 text-rose-600 border-gray-300 focus:ring-rose-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
                        <p className="text-xs text-gray-500">
                          {guest.table?.tableName || guest.table?.tableNumber ? `Banquet Table: ${guest.table.tableName || guest.table.tableNumber}` : 'No banquet table'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            <div className="p-4 sm:p-6 border-t border-gray-100">
              <button
                onClick={() => {
                  setShowSwapFromTableModal(false);
                  setSelectedGuestForSwap(null);
                }}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
