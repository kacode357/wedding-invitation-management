import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/auth/useAuth';
import { useGetAllTables } from '../hooks/table/useGetAllTables';
import { useGetTableById } from '../hooks/table/useGetTableById';
import { useGetUnassignedGuests } from '../hooks/guest/useGetUnassignedGuests';
import { useAssignGuestsToTable } from '../hooks/table/useAssignGuestsToTable';
import { useRemoveGuestsFromTable } from '../hooks/table/useRemoveGuestsFromTable';
import { useDeleteTable } from '../hooks/table/useDeleteTable';
import { useUpdateTable } from '../hooks/table/useUpdateTable';
import { dashboardService } from '../services/dashboard.service';
import type { Statistics } from '../types/dashboard/dashboard.response';
import type { Table } from '../types/table/table.response';

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
  const { isLoading: assigningGuests, assignGuests } = useAssignGuestsToTable();
  const { isLoading: removingGuests, removeGuests } = useRemoveGuestsFromTable();
  const { isLoading: deletingTable, deleteTable } = useDeleteTable();
  const [showTableModal, setShowTableModal] = useState(false);

  // Assign guest to table state
  const [showAssignGuestModal, setShowAssignGuestModal] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [selectedGuestIds, setSelectedGuestIds] = useState<string[]>([]);
  const [unassignedGroupFilter, setUnassignedGroupFilter] = useState<string>('all');
  const [unassignedCategoryFilter, setUnassignedCategoryFilter] = useState<string>('all');
  const [unassignedSearchTerm, setUnassignedSearchTerm] = useState('');

  // Confirmation modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [confirmAction, setConfirmAction] = useState<(() => void) | null>(null);

  // Edit table modal state
  const { updateTable, isLoading: updatingTable } = useUpdateTable();
  const [showEditTableModal, setShowEditTableModal] = useState(false);
  const [editingTable, setEditingTable] = useState<{ id: string; name: string; number?: number; capacity: number } | null>(null);

  const handleOpenEditModal = (table: Table) => {
    setEditingTable({
      id: table._id,
      name: table.tableName,
      number: table.tableNumber,
      capacity: table.capacity
    });
    setShowEditTableModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditTableModal(false);
    setEditingTable(null);
  };

  const handleSaveEditTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable) return;

    const success = await updateTable(editingTable.id, {
      tableName: editingTable.name,
      tableNumber: editingTable.number,
      capacity: editingTable.capacity
    });

    if (success) {
      handleCloseEditModal();
      if (selectedTable?._id === editingTable.id) {
        fetchTableDetails(editingTable.id);
      }
      fetchTables();
    }
  };

  // Helper function to show confirmation
  const handleConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await dashboardService.getDashboard();
        if (response.success) {
          setDashboardData({
            guests: {
              confirmedGuests: response.guests?.confirmedGuests || 0,
              numberOfGuests: response.guests?.numberOfGuests || 0
            },
            invitations: {
              familiesInvited: response.invitations?.familiesInvited || 0,
              invitationsSent: response.invitations?.invitationsSent || 0
            },
            guestsByCategory: response.guestsByCategory || []
          });
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
    setUnassignedGroupFilter('all');
    setUnassignedCategoryFilter('all');
    setUnassignedSearchTerm('');
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

  const unassignedGroups = [...new Set(unassignedGuests.map(g => g.groupName).filter(Boolean))] as string[];
  const unassignedCategories = [...new Set(unassignedGuests.map(g => g.categoryName).filter(Boolean))] as string[];

  const filteredUnassignedGuests = unassignedGuests.filter(guest => {
    // Group filter
    if (unassignedGroupFilter !== 'all') {
      if (unassignedGroupFilter === 'none' && guest.groupName) return false;
      if (unassignedGroupFilter !== 'none' && guest.groupName !== unassignedGroupFilter) return false;
    }
    // Category filter
    if (unassignedCategoryFilter !== 'all') {
      if (unassignedCategoryFilter === 'none' && guest.categoryName) return false;
      if (unassignedCategoryFilter !== 'none' && guest.categoryName !== unassignedCategoryFilter) return false;
    }
    // Search filter
    if (unassignedSearchTerm) {
      if (!guest.guestName.toLowerCase().includes(unassignedSearchTerm.toLowerCase())) return false;
    }
    return true;
  });

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
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.87 7 21 10.13 21 14V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V14C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2ZM12 4C11.45 4 11 4.45 11 5C11 5.55 11.45 6 12 6C12.55 6 13 5.55 13 5C13 4.45 12.55 4 12 4ZM5 14V19H19V14C19 11.24 16.76 9 14 9H10C7.24 9 5 11.24 5 14Z" />
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
              {/* Card 1: Families Invited */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{dashboardData?.invitations?.familiesInvited ?? 0}</span>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Families</h3>
                </div>
              </div>

              {/* Card 2: Invited */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{dashboardData?.invitations?.invitationsSent ?? 0}</span>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Invited</h3>
                </div>
              </div>

              {/* Card 3: Total Guests */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{dashboardData?.guests?.numberOfGuests ?? 0}</span>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Total Guests</h3>
                </div>
              </div>

              {/* Card 4: Confirmed Guests */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{dashboardData?.guests?.confirmedGuests ?? 0}</span>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Confirmed</h3>
                </div>
              </div>

              {/* Card 5: Tables */}
              <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 shadow-lg border border-white/50 flex items-center gap-3">
                <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">{tables.length}</span>
                  <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Tables</h3>
                </div>
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
                    onClick={() => navigate('/tables')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    Add Table
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                  {tables.slice(0, 3).map((table, index) => (
                    <div
                      key={table._id}
                      className={`bg-gradient-to-br from-purple-50 to-rose-50 rounded-xl p-4 border border-purple-100 hover:shadow-md transition-shadow ${index > 0 ? 'hidden md:block' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-800">Table number {table.tableNumber} - {table.tableName}</h4>
                        </div>
                        <button
                          onClick={() => handleOpenEditModal(table)}
                          className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors ml-2"
                          title="Edit Table"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
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

          {/* Add Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Add</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Add Guest */}
              <button
                onClick={() => navigate('/add-guest')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl hover:from-rose-100 hover:to-rose-200 transition-all border border-rose-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Add Guest</span>
              </button>

              {/* Add Table */}
              <button
                onClick={() => navigate('/tables')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all border border-purple-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Add Table</span>
              </button>
            </div>
          </div>

          {/* Invitation Check Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Invitations Check</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
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

              {/* Create Invitation */}
              <button
                onClick={() => navigate('/create-invitation')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all border border-blue-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">E-Invitation</span>
              </button>
            </div>
          </div>

          {/* Wedding Day Section */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Wedding Day</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* User Info */}
              <button
                onClick={() => navigate('/user-info')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl hover:from-pink-100 hover:to-pink-200 transition-all border border-pink-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-pink-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">User Info</span>
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
            </div>
          </div>

          {/* Manager Section - CRUD */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Manager</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Notes */}
              <button
                onClick={() => navigate('/notes')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl hover:from-teal-100 hover:to-teal-200 transition-all border border-teal-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Notes</span>
              </button>

              {/* Categories */}
              <button
                onClick={() => navigate('/categories')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl hover:from-indigo-100 hover:to-indigo-200 transition-all border border-indigo-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Categories</span>
              </button>

              {/* Groups */}
              <button
                onClick={() => navigate('/groups')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl hover:from-violet-100 hover:to-violet-200 transition-all border border-violet-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Groups</span>
              </button>

              {/* Location - Public Page */}
              <button
                onClick={() => navigate('/location')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl hover:from-cyan-100 hover:to-cyan-200 transition-all border border-cyan-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-cyan-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">Location</span>
              </button>

              {/* 3D Invitation - Public Page */}
              <button
                onClick={() => navigate('/invitation')}
                className="flex flex-col items-center gap-2 sm:gap-3 p-3 sm:p-4 h-24 sm:h-28 bg-gradient-to-br from-fuchsia-50 to-fuchsia-100 rounded-xl hover:from-fuchsia-100 hover:to-fuchsia-200 transition-all border border-fuchsia-200 active:scale-95"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-fuchsia-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-lg sm:text-xl text-white">💌</span>
                </div>
                <span className="text-xs sm:text-sm font-semibold text-gray-800 text-center">3D Invitation</span>
              </button>
            </div>
          </div>
        </div>
      </main >

      {/* Table Detail Modal */}
      {
        showTableModal && (
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
                              className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${guest.isArrived ? 'bg-green-100' : 'bg-purple-100'}`}>
                                  <svg className={`w-4 h-4 ${guest.isArrived ? 'text-green-600' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{guest.guestName}</p>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {guest.categoryName && (
                                      <span className="text-[11px] text-gray-600 border border-gray-200 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {guest.categoryName}
                                      </span>
                                    )}
                                    <span className="text-[11px] text-gray-600 border border-gray-200 bg-gray-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                      {guest.groupName || 'No Group'}
                                      {guest.groupName && guest.groupPriorityLevel && (
                                        <span className="text-gray-400 font-medium">
                                          (P{guest.groupPriorityLevel})
                                        </span>
                                      )}
                                    </span>
                                    {guest.noteName && (
                                      <span className="text-[11px] text-gray-600 border border-gray-200 bg-gray-50 px-1.5 py-0.5 rounded">
                                        {guest.noteName}
                                      </span>
                                    )}
                                    <span className="text-[11px] text-gray-500 flex items-center ml-1">
                                      • {guest.confirmedGuests}/{guest.numberOfGuests} confirmed
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {guest.isArrived ? (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    Arrived
                                  </span>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      const guestId = guest._id;
                                      if (!guestId) return;
                                      // TODO: Implement check-in
                                      toast.info('Check-in feature coming soon');
                                    }}
                                    className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Check in guest"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={async () => {
                                    const guestId = guest._id;
                                    const tableId = selectedTable?._id;
                                    if (!guestId || !tableId) return;
                                    handleConfirm('Are you sure you want to remove this guest from the table?', async () => {
                                      const success = await removeGuests(tableId, [guestId]);
                                      if (success) {
                                        toast.success('Guest removed from table');
                                        fetchTables();
                                        fetchTableDetails(tableId);
                                      } else {
                                        toast.error('Failed to remove guest from table');
                                      }
                                    });
                                  }}
                                  disabled={removingGuests}
                                  className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title="Remove from table"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
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
                    handleConfirm('Are you sure you want to delete this table?', async () => {
                      const success = await deleteTable(selectedTable._id);
                      if (success) {
                        toast.success('Table deleted successfully');
                        handleCloseTableModal();
                        fetchTables();
                      } else {
                        toast.error('Failed to delete table');
                      }
                    });
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
              </div>
            </div>
          </div>
        )
      }

      {/* Assign Guest to Table Modal */}
      {
        showAssignGuestModal && (
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
                  <div className="space-y-4">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search by name..."
                          value={unassignedSearchTerm}
                          onChange={(e) => setUnassignedSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <svg
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={unassignedCategoryFilter}
                          onChange={(e) => setUnassignedCategoryFilter(e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                        >
                          <option value="all">All Categories</option>
                          <option value="none">No Category</option>
                          {unassignedCategories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <select
                          value={unassignedGroupFilter}
                          onChange={(e) => setUnassignedGroupFilter(e.target.value)}
                          className="w-full sm:w-auto px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent cursor-pointer"
                        >
                          <option value="all">All Groups</option>
                          <option value="none">No Group</option>
                          {unassignedGroups.map(group => (
                            <option key={group} value={group}>{group}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {filteredUnassignedGuests.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">No guests match the selected group.</p>
                    ) : (
                      <div className="space-y-2">
                        {filteredUnassignedGuests.map((guest) => {
                          const guestId = guest._id;
                          if (!guestId) return null;
                          return (
                            <label
                              key={guestId}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedGuestIds.includes(guestId)
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
                                <div className="flex items-center gap-2">
                                  <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
                                  {guest.categoryName && (
                                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 whitespace-nowrap">
                                      {guest.categoryName}
                                    </span>
                                  )}
                                </div>
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
                              </div>
                              <span className="text-xs text-gray-500">
                                {guest.numberOfGuests} guest{guest.numberOfGuests > 1 ? 's' : ''}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    )}
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
        )
      }

      {/* Confirmation Modal */}
      {
        showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-center text-gray-700 font-medium mb-6">{confirmMessage}</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setConfirmAction(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (confirmAction) {
                        confirmAction();
                      }
                      setShowConfirmModal(false);
                      setConfirmAction(null);
                    }}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Edit Table Modal */}
      {
        showEditTableModal && editingTable && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-100">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                  Edit Banquet Table
                </h3>
                <button
                  onClick={handleCloseEditModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSaveEditTable} className="p-4 sm:p-6 space-y-4">
                <div>
                  <label htmlFor="editTableName" className="block text-sm font-medium text-gray-700 mb-1">
                    Table Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="editTableName"
                    value={editingTable.name}
                    onChange={(e) => setEditingTable({ ...editingTable, name: e.target.value })}
                    required
                    placeholder="e.g., VIP Table"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label htmlFor="editTableNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Table Number
                    </label>
                    <input
                      type="number"
                      id="editTableNumber"
                      value={editingTable.number || ''}
                      onChange={(e) => setEditingTable({ ...editingTable, number: e.target.value ? parseInt(e.target.value) : undefined })}
                      min={1}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="editTableCapacity" className="block text-sm font-medium text-gray-700 mb-1">
                      Capacity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="editTableCapacity"
                      value={editingTable.capacity}
                      onChange={(e) => setEditingTable({ ...editingTable, capacity: parseInt(e.target.value) || 1 })}
                      required
                      min={1}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium border border-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingTable}
                    className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {updatingTable ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

    </div >
  );
}
