import { useEffect, useState } from 'react';
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
import type { Table } from '../types/table/table.response';

export default function TablesPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { tables, isLoading, error, fetchTables } = useGetAllTables();
  const { table: selectedTable, isLoading: tableDetailLoading, fetchTable: fetchTableDetails } = useGetTableById();
  const { guests: unassignedGuests, isLoading: unassignedLoading, fetchGuests: fetchUnassignedGuests } = useGetUnassignedGuests();
  const { assignGuests, isLoading: assigningGuests } = useAssignGuestsToTable();
  const { removeGuests, isLoading: removingGuests } = useRemoveGuestsFromTable();
  const { isLoading: deletingTable, deleteTable } = useDeleteTable();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Table detail modal state
  const [showTableModal, setShowTableModal] = useState(false);

  // Assign guest modal state
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

  // Helper function to show confirmation
  const handleConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

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

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const filteredTables = tables.filter((table) => {
    const matchesSearch =
      table.tableName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      table.tableNumber?.toString().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

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
      toast.success(`Successfully assigned ${selectedGuestIds.length} guest(s) to table`);
      handleCloseAssignGuestModal();
      fetchTables(); // Refresh tables
      if (selectedTableId === selectedTable?._id) {
        fetchTableDetails(selectedTableId);
      }
    } else {
      toast.error('Failed to assign guests to table');
    }
  };

  const handleRemoveGuests = async (tableId: string, guestIds: string[]) => {
    const success = await removeGuests(tableId, guestIds);
    if (success) {
      toast.success(`Successfully removed guest(s) from table`);
      fetchTables(); // Refresh tables
      if (tableId === selectedTable?._id) {
        fetchTableDetails(tableId);
      }
    } else {
      toast.error('Failed to remove guests from table');
    }
  };

  const handleAddTable = () => {
    navigate('/add-table');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo and Back Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => navigate('/home')}
                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Go back"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
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
                onClick={() => navigate('/home')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/guests')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Guests</span>
              </button>
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
                onClick={() => navigate('/home')}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Home</span>
              </button>
              <button
                onClick={() => navigate('/guests')}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Guests</span>
              </button>
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800">Banquet Table Management</h1>
            <p className="text-gray-600 mt-1">Manage your wedding reception tables and seating arrangements</p>
          </div>
          <button
            onClick={handleAddTable}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Banquet Table</span>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/50 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search banquet tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/50 text-gray-800 placeholder-gray-400 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tables Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchTables()}
              className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium"
            >
              Try again
            </button>
          </div>
        ) : filteredTables.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-8 sm:p-12 shadow-lg border border-white/50 text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No banquet tables found</h3>
            <p className="text-gray-600 mb-6">Create your first banquet table to get started</p>
            <button
              onClick={handleAddTable}
              className="px-6 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Banquet Table
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredTables.map((table) => (
              <div
                key={table._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-purple-100 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">Table number {table.tableNumber} - {table.tableName}</h3>
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

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span>
                      {table.currentGuests || 0} / {table.capacity} guests
                    </span>
                  </div>
                  {table.availableSeats !== undefined && (
                    <div className="flex items-center gap-2 text-sm">
                      {table.availableSeats > 0 ? (
                        <>
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-600">{table.availableSeats} seats available</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="text-red-600">Table is full</span>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${((table.currentGuests || 0) / table.capacity) >= 1
                        ? 'bg-red-500'
                        : ((table.currentGuests || 0) / table.capacity) >= 0.8
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                        }`}
                      style={{ width: `${Math.min(((table.currentGuests || 0) / table.capacity) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewTableDetails(table._id)}
                    className="flex-1 px-3 py-2 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors font-medium"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleOpenAssignGuestModal(table._id)}
                    className="flex-1 px-3 py-2 bg-white border border-purple-200 text-purple-600 text-sm rounded-lg hover:bg-purple-50 transition-colors font-medium"
                  >
                    Add Guest
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
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
                                  onClick={() => handleRemoveGuests(selectedTable._id, [guest._id || ''])}
                                  disabled={removingGuests}
                                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Remove guest from table"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              )}
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
                  const tableId = selectedTable?._id;
                  if (!tableId) return;
                  handleConfirm('Are you sure you want to delete this table?', async () => {
                    const success = await deleteTable(tableId);
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
                    Delete Table
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  handleCloseTableModal();
                  if (selectedTable?._id) {
                    handleOpenAssignGuestModal(selectedTable._id);
                  }
                }}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
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
                  <p className="text-sm text-gray-500">All guests are already assigned to tables</p>
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
                        const guestId = guest._id || '';
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
                              onChange={() => guestId && handleToggleGuestSelection(guestId)}
                              className="w-4 h-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{guest.guestName}</p>
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
                        );
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
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
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
      )}

      {/* Edit Table Modal */}
      {showEditTableModal && editingTable && (
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
      )}
    </div>
  );
}
