import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/auth/useAuth';
import { useGetAllGuests } from '../hooks/guest/useGetAllGuests';
import { useUpdateGuest } from '../hooks/guest/useUpdateGuest';
import { useDeleteGuest } from '../hooks/guest/useDeleteGuest';
import { useCategories } from '../hooks/category/useCategories';
import { useNotes } from '../hooks/note/useNotes';
import { useGroups } from '../hooks/group/useGroups';
import { useCreateInvitation } from '../hooks/guest/useCreateInvitation';
import type { Guest } from '../types/guest/guest.response';
import type { UpdateGuestPayload } from '../types/guest/guest.payload';

export default function GuestsPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { guests, count, isLoading, error, fetchGuests } = useGetAllGuests();
  const { updateGuest, isLoading: isUpdating } = useUpdateGuest();
  const { deleteGuest, isLoading: isDeleting } = useDeleteGuest();
  const { categories, fetchCategories } = useCategories();
  const { notes, fetchNotes } = useNotes();
  const { groups, fetchGroups } = useGroups();
  const { createInvitation, isLoading: isCreatingInvitation } = useCreateInvitation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedNote, setSelectedNote] = useState<string>('all');
  const [selectedTable, setSelectedTable] = useState<string>('all');

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<'category' | 'group' | 'guest' | 'confirmed' | 'note' | null>(null);

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editFormData, setEditFormData] = useState<UpdateGuestPayload>({});
  const [editError, setEditError] = useState<string | null>(null);

  // Delete confirmation state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingGuestId, setDeletingGuestId] = useState<string | number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Invitation Link state
  const [isInviteLinkModalOpen, setIsInviteLinkModalOpen] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState('');

  // Extract unique options from guests
  const guestCategories = ['all', ...new Set(guests.map(guest => guest.categoryName).filter(Boolean))];
  const guestGroups = ['all', ...new Set(guests.map(guest => guest.groupName).filter(Boolean))];
  const guestNotes = ['all', ...new Set(guests.map(guest => guest.noteName).filter(Boolean))];
  const guestTables = ['all', ...new Set(guests.map(guest => guest.tableName).filter(Boolean))];

  useEffect(() => {
    fetchGuests();
    fetchCategories();
    fetchNotes();
    fetchGroups();
  }, [fetchGuests, fetchCategories, fetchNotes, fetchGroups]);

  const filteredGuests = guests.filter((guest) => {
    const categoryName = guest.categoryName || '';
    const groupName = guest.groupName || '';
    const noteName = guest.noteName || '';
    const tableName = guest.tableName || '';

    const matchesSearch =
      guest.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      categoryName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory;
    const matchesGroup = selectedGroup === 'all' || groupName === selectedGroup;
    const matchesNote = selectedNote === 'all' || noteName === selectedNote;
    const matchesTable = selectedTable === 'all' || tableName === selectedTable;

    return matchesSearch && matchesCategory && matchesGroup && matchesNote && matchesTable;
  });

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Edit functions
  const handleEditClick = (guest: Guest) => {
    setEditingGuest(guest);
    setEditFormData({
      guestName: guest.guestName,
      numberOfGuests: guest.numberOfGuests,
      confirmedGuests: guest.confirmedGuests,
      categoryId: guest.categoryId || '',
      groupId: guest.groupId || '',
      tableId: guest.tableId || '',
      noteId: guest.noteId || '',
    });
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: name === 'numberOfGuests' || name === 'categoryId' || name === 'tableId' || name === 'confirmedGuests'
        ? value === '' ? undefined : Number(value)
        : value
    }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGuest) return;

    const guestId = editingGuest._id || editingGuest.id;
    if (!guestId) {
      setEditError('Invalid guest ID');
      return;
    }

    setEditError(null);
    const result = await updateGuest(guestId, editFormData);

    if (result.success) {
      toast.success('Guest updated successfully!');
      setIsEditModalOpen(false);
      setEditingGuest(null);
      fetchGuests();
    } else {
      toast.error('Failed to update guest');
    }
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingGuest(null);
    setEditFormData({});
    setEditError(null);
    setOpenDropdown(null);
  };

  // Delete functions
  const handleDeleteClick = (guest: Guest) => {
    const guestId = guest._id || guest.id;
    if (!guestId) return;
    setDeletingGuestId(guestId);
    setDeleteError(null);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGuestId) return;

    setDeleteError(null);
    const success = await deleteGuest(deletingGuestId);

    if (success) {
      toast.success('Guest deleted successfully!');
      setIsDeleteModalOpen(false);
      setDeletingGuestId(null);
      fetchGuests();
    } else {
      toast.error('Failed to delete guest. Please try again.');
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setDeletingGuestId(null);
    setDeleteError(null);
  };

  const handleCreateInvitation = async (guest: Guest) => {
    const guestId = guest._id || guest.id;
    if (!guestId) return;

    const result = await createInvitation(guestId);
    if (result.success && result.guest?.invitationId) {
      const inviteLink = `${window.location.origin}/invite/${result.guest.invitationId}`;
      setGeneratedInviteLink(inviteLink);
      setIsInviteLinkModalOpen(true);
      fetchGuests(); // Refresh list to update status
    } else {
      toast.error('Failed to create invitation');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Invitation link copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100">
      {/* Mobile-friendly Header */}
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
                  All Guests
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
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800">Invitations</h1>
          <p className="text-gray-600 mt-1">
            Total: {count} {count === 1 ? 'invitation' : 'invitations'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name, category, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm"
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
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm cursor-pointer"
            >
              <option value="all">All Categories</option>
              {guestCategories.filter(cat => cat !== 'all').map(cat => (
                <option key={cat!} value={cat!}>{cat}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Group Filter */}
          <div className="relative">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm cursor-pointer"
            >
              <option value="all">All Groups</option>
              {guestGroups.filter(grp => grp !== 'all').map((grp, index) => (
                <option key={`grp-${index}`} value={grp!}>{grp}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Note Filter */}
          <div className="relative">
            <select
              value={selectedNote}
              onChange={(e) => setSelectedNote(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm cursor-pointer"
            >
              <option value="all">All Notes</option>
              {guestNotes.filter(n => n !== 'all').map((n, index) => (
                <option key={`note-${index}`} value={n!}>{n}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Table Filter */}
          <div className="relative">
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full appearance-none px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm cursor-pointer"
            >
              <option value="all">All Tables</option>
              {guestTables.filter(t => t !== 'all').map((t, index) => (
                <option key={`table-${index}`} value={t!}>{t}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={fetchGuests}
              className="mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : filteredGuests.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-white/50">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'No guests match your search' : 'No guests found'}
            </p>
          </div>
        ) : (
          /* Desktop Table View */
          <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Guests</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Table</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Note</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => (
                  <tr key={guest._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{guest.guestName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                        {guest.categoryName || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guest.confirmedGuests}/{guest.numberOfGuests}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guest.groupName ? (
                        <div className="flex flex-col">
                          <span>{guest.groupName}</span>
                          {guest.groupPriorityLevel && (
                            <span className="text-xs text-gray-400">Priority {guest.groupPriorityLevel}</span>
                          )}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {guest.tableName || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {guest.noteName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCreateInvitation(guest)}
                          className={`p-1.5 rounded-lg transition-colors ${guest.isInvitationCreated ? 'text-green-600 hover:bg-green-50' : 'text-rose-600 hover:bg-rose-50'}`}
                          title={guest.isInvitationCreated ? "Regenerate/View Link" : "Create Invitation"}
                          disabled={isCreatingInvitation}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditClick(guest)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit guest"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(guest)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete guest"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Mobile Card View */}
        {filteredGuests.length > 0 && !isLoading && (
          <div className="md:hidden space-y-4">
            {filteredGuests.map((guest) => (
              <div
                key={guest._id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{guest.guestName}</h3>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
                    {guest.categoryName || 'Uncategorized'}
                  </span>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>{guest.confirmedGuests}/{guest.numberOfGuests} guests</span>
                  </div>
                  {guest.groupName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>{guest.groupName} {guest.groupPriorityLevel ? `(P${guest.groupPriorityLevel})` : ''}</span>
                    </div>
                  )}
                  {guest.tableName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                      <span>{guest.tableName}</span>
                    </div>
                  )}
                  {guest.noteName && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>{guest.noteName}</span>
                    </div>
                  )}
                </div>
                {/* Mobile Action Buttons */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex gap-2">
                  <button
                    onClick={() => handleCreateInvitation(guest)}
                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${guest.isInvitationCreated ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    disabled={isCreatingInvitation}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {guest.isInvitationCreated ? 'Link' : 'Invite'}
                  </button>
                  <button
                    onClick={() => handleEditClick(guest)}
                    className="flex-1 py-2 px-3 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteClick(guest)}
                    className="flex-1 py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit Guest Modal */}
      {isEditModalOpen && editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setOpenDropdown(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleEditModalClose}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Edit Guest</h2>
              <button
                onClick={handleEditModalClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {editError && (
              <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{editError}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="p-4 space-y-4" onClick={(e) => e.stopPropagation()}>
              {/* Guest Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Guest Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.guestName || ''}
                  onChange={handleEditChange}
                  name="guestName"
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 text-gray-800"
                  required
                />
              </div>

              {/* Category Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'category' ? null : 'category')}
                    className={`w-full px-3 py-2.5 text-left border rounded-xl bg-white transition-all duration-200 flex items-center justify-between ${editFormData.categoryId ? 'border-rose-400' : 'border-gray-300 hover:border-rose-400'
                      }`}
                  >
                    <span className={editFormData.categoryId ? 'text-gray-800' : 'text-gray-400'}>
                      {categories.find(c => c._id === editFormData.categoryId)?.name || 'Select a category'}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === 'category' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'category' && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {categories.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No categories</div>
                      ) : (
                        categories.map((cat) => (
                          <button
                            key={cat._id}
                            type="button"
                            onClick={() => {
                              setEditFormData({ ...editFormData, categoryId: cat._id });
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${cat._id === editFormData.categoryId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                              }`}
                          >
                            <span>{cat.name}</span>
                            {cat._id === editFormData.categoryId && (
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
              </div>

              {/* Group Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Group <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'group' ? null : 'group')}
                    className={`w-full px-3 py-2.5 text-left border rounded-xl bg-white transition-all duration-200 flex items-center justify-between ${editFormData.groupId && editFormData.groupId.trim() !== '' ? 'border-rose-400' : 'border-gray-300 hover:border-rose-400'
                      }`}
                  >
                    <span className={editFormData.groupId === '' || !editFormData.groupId ? 'text-gray-400' : 'text-gray-800'}>
                      {editFormData.groupId && groups.find(g => g._id === editFormData.groupId)
                        ? `${groups.find(g => g._id === editFormData.groupId)?.name} · P${groups.find(g => g._id === editFormData.groupId)?.priorityLevel}`
                        : 'Select a group (optional)'}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === 'group' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'group' && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData({ ...editFormData, groupId: '' });
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${!editFormData.groupId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                          }`}
                      >
                        <span>None</span>
                        {!editFormData.groupId && (
                          <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      {groups.length === 0 ? (
                        <div className="px-4 py-3 text-gray-500 text-sm">No groups available</div>
                      ) : (
                        groups.map((grp) => (
                          <button
                            key={grp._id}
                            type="button"
                            onClick={() => {
                              setEditFormData({ ...editFormData, groupId: grp._id });
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${grp._id === editFormData.groupId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                              }`}
                          >
                            <span>{grp.name} <span className="text-xs text-gray-400 ml-1">· P{grp.priorityLevel}</span></span>
                            {grp._id === editFormData.groupId && (
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
              </div>

              {/* Number of Guests and Confirmed Guests */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Number of Guests
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'guest' ? null : 'guest')}
                      className="w-full px-3 py-2.5 text-left border border-gray-300 hover:border-rose-400 rounded-xl bg-white transition-all duration-200 flex items-center justify-between"
                    >
                      <span className="text-gray-800">{editFormData.numberOfGuests || 1} {editFormData.numberOfGuests === 1 ? 'Guest' : 'Guests'}</span>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === 'guest' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === 'guest' && (
                      <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                          <button
                            key={`guest-${num}`}
                            type="button"
                            onClick={() => {
                              const newData = { ...editFormData, numberOfGuests: num };
                              if ((newData.confirmedGuests || 0) > num) {
                                newData.confirmedGuests = num;
                              }
                              setEditFormData(newData);
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${num === editFormData.numberOfGuests ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                              }`}
                          >
                            <span>{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                            {num === editFormData.numberOfGuests && (
                              <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirmed
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === 'confirmed' ? null : 'confirmed')}
                      className="w-full px-3 py-2.5 text-left border border-gray-300 hover:border-rose-400 rounded-xl bg-white transition-all duration-200 flex items-center justify-between"
                    >
                      <span className="text-gray-800 truncate pr-2">
                        {(editFormData.confirmedGuests || 0) === (editFormData.numberOfGuests || 1)
                          ? 'Attend all'
                          : `${editFormData.confirmedGuests || 0} Confirmed`}
                      </span>
                      <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openDropdown === 'confirmed' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openDropdown === 'confirmed' && (
                      <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setEditFormData({ ...editFormData, confirmedGuests: editFormData.numberOfGuests || 1 });
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${(editFormData.confirmedGuests || 0) === (editFormData.numberOfGuests || 1) ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                            }`}
                        >
                          <span className="truncate pr-2">Attend all</span>
                          {(editFormData.confirmedGuests || 0) === (editFormData.numberOfGuests || 1) && (
                            <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                        {Array.from({ length: (editFormData.numberOfGuests || 1) - 1 }, (_, i) => i + 1).map((opt) => (
                          <button
                            key={`confirmed-${opt}`}
                            type="button"
                            onClick={() => {
                              setEditFormData({ ...editFormData, confirmedGuests: opt });
                              setOpenDropdown(null);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${opt === editFormData.confirmedGuests ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                              }`}
                          >
                            <span className="truncate pr-2">{opt} Confirmed</span>
                            {opt === editFormData.confirmedGuests && (
                              <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Note Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Note
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setOpenDropdown(openDropdown === 'note' ? null : 'note')}
                    className={`w-full px-3 py-2.5 text-left border rounded-xl bg-white transition-all duration-200 flex items-center justify-between ${editFormData.noteId ? 'border-rose-300' : 'border-gray-300 hover:border-rose-400'
                      }`}
                  >
                    <span className={editFormData.noteId ? 'text-gray-800' : 'text-gray-400'}>
                      {notes.find(n => n._id === editFormData.noteId)?.name || 'Select a note (optional)'}
                    </span>
                    <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown === 'note' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'note' && (
                    <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setEditFormData({ ...editFormData, noteId: '' });
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${!editFormData.noteId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                          }`}
                      >
                        <span>None</span>
                        {!editFormData.noteId && (
                          <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                      {notes.map((note) => (
                        <button
                          key={note._id}
                          type="button"
                          onClick={() => {
                            setEditFormData({ ...editFormData, noteId: note._id });
                            setOpenDropdown(null);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${note._id === editFormData.noteId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'
                            }`}
                        >
                          <span>{note.name}</span>
                          {note._id === editFormData.noteId && (
                            <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 px-4 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDeleteCancel}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Title and Message */}
            <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Guest</h3>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete this guest? This action cannot be undone.
            </p>

            {/* Error Message */}
            {deleteError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{deleteError}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteCancel}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invitation Link Modal */}
      {isInviteLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsInviteLinkModalOpen(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">E-Invitation Link</h3>
              <button
                onClick={() => setIsInviteLinkModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              The invitation link has been generated. You can share this link with your guest.
            </p>

            <div className="flex gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl mb-6">
              <input
                type="text"
                readOnly
                value={generatedInviteLink}
                className="flex-1 bg-transparent border-none text-sm text-gray-800 focus:ring-0"
              />
              <button
                onClick={() => copyToClipboard(generatedInviteLink)}
                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Copy to clipboard"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.open(generatedInviteLink, '_blank')}
                className="flex-1 py-2.5 px-4 bg-rose-500 text-white font-semibold rounded-xl hover:bg-rose-600 transition-colors flex items-center justify-center gap-2"
              >
                Preview Invitation
              </button>
              <button
                onClick={() => setIsInviteLinkModalOpen(false)}
                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
