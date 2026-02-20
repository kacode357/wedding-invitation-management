import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/auth/useAuth';
import { useGroups } from '../hooks/group/useGroups';
import { useCreateGroup } from '../hooks/group/useCreateGroup';
import { useUpdateGroup } from '../hooks/group/useUpdateGroup';
import { useDeleteGroup } from '../hooks/group/useDeleteGroup';
import type { Group } from '../types/group/group.response';
import type { CreateGroupPayload, UpdateGroupPayload } from '../types/group/group.payload';

export default function GroupsPage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { groups, isLoading, error, fetchGroups } = useGroups();
    const { createGroup, isLoading: createLoading, error: createError } = useCreateGroup();
    const { updateGroup, isLoading: updateLoading, error: updateError } = useUpdateGroup();
    const { deleteGroup, isLoading: deleteLoading, error: deleteGroupError } = useDeleteGroup();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Create modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createFormData, setCreateFormData] = useState<CreateGroupPayload>({ name: '', priorityLevel: 1 });
    const [createFormError, setCreateFormError] = useState<string | null>(null);

    // Edit modal state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [editFormData, setEditFormData] = useState<UpdateGroupPayload>({});
    const [editError, setEditError] = useState<string | null>(null);

    // Delete confirmation state
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        fetchGroups();
    }, [fetchGroups]);

    const filteredGroups = groups.filter((group) =>
        group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => logout();
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // ── Create ──────────────────────────────────────
    const handleOpenCreateModal = () => {
        setCreateFormData({ name: '', priorityLevel: 1 });
        setCreateFormError(null);
        setIsCreateModalOpen(true);
    };

    const handleCreateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCreateFormData(prev => ({
            ...prev,
            [name]: name === 'priorityLevel' ? Number(value) : value,
        }));
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!createFormData.name.trim()) {
            setCreateFormError('Group name is required');
            return;
        }
        setCreateFormError(null);
        const { data: newGroup, errorMessage } = await createGroup(createFormData);
        if (newGroup) {
            toast.success('Group created successfully!');
            setIsCreateModalOpen(false);
            fetchGroups();
        } else {
            // errorMessage comes directly from the BE response
            toast.error(errorMessage || 'Failed to create group');
        }
    };

    // ── Edit ────────────────────────────────────────
    const handleEditClick = (group: Group) => {
        setEditingGroup(group);
        setEditFormData({ name: group.name, priorityLevel: group.priorityLevel });
        setEditError(null);
        setIsEditModalOpen(true);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: name === 'priorityLevel' ? Number(value) : value,
        }));
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingGroup?._id) return;
        setEditError(null);
        const { data: updatedGroup, errorMessage } = await updateGroup(editingGroup._id, editFormData);
        if (updatedGroup) {
            toast.success('Group updated successfully!');
            setIsEditModalOpen(false);
            setEditingGroup(null);
            fetchGroups();
        } else {
            // errorMessage comes directly from the BE response
            toast.error(errorMessage || 'Failed to update group');
        }
    };

    const handleEditModalClose = () => {
        setIsEditModalOpen(false);
        setEditingGroup(null);
        setEditFormData({});
        setEditError(null);
    };

    // ── Delete ──────────────────────────────────────
    const handleDeleteClick = (group: Group) => {
        setDeletingGroupId(group._id);
        setDeleteError(null);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingGroupId) return;
        setDeleteError(null);
        const { success, errorMessage } = await deleteGroup(deletingGroupId);
        if (success) {
            toast.success('Group deleted successfully!');
            setIsDeleteModalOpen(false);
            setDeletingGroupId(null);
            fetchGroups();
        } else {
            // errorMessage comes directly from the BE response
            toast.error(errorMessage || 'Failed to delete group');
        }
    };

    const handleDeleteCancel = () => {
        setIsDeleteModalOpen(false);
        setDeletingGroupId(null);
        setDeleteError(null);
    };

    // ── Priority badge colour ────────────────────────
    const priorityColor = (level: number) => {
        if (level >= 9) return 'bg-rose-100 text-rose-700';
        if (level >= 6) return 'bg-amber-100 text-amber-700';
        if (level >= 3) return 'bg-blue-100 text-blue-700';
        return 'bg-gray-100 text-gray-600';
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
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-violet-500 rounded-full flex items-center justify-center">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm sm:text-xl font-serif font-bold text-gray-800 hidden xs:block">
                                    Groups
                                </span>
                            </div>
                        </div>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-3">
                            <button
                                onClick={handleOpenCreateModal}
                                className="flex items-center gap-2 px-4 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors text-sm font-medium shadow-md"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Group
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-3 py-2 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors text-sm font-medium"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={toggleMobileMenu}
                            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500"
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
                        <div className="md:hidden border-t border-gray-100 py-3 space-y-2 animate-fade-in">
                            <button
                                onClick={() => { handleOpenCreateModal(); setIsMobileMenuOpen(false); }}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Group
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors font-medium"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
                {/* Page Title */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-800">Groups</h1>
                        <p className="text-gray-600 mt-1">Total: {groups.length} group{groups.length !== 1 ? 's' : ''}</p>
                    </div>
                    {/* Mobile Add Button */}
                    <button
                        onClick={handleOpenCreateModal}
                        className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-colors font-medium shadow-md"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Group
                    </button>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search groups..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-3 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
                        />
                        <svg
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-center">
                        <p className="text-red-600">{error}</p>
                        <button
                            onClick={fetchGroups}
                            className="mt-3 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                ) : filteredGroups.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg border border-white/50">
                        <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 text-lg">
                            {searchTerm ? 'No groups match your search' : 'No groups found'}
                        </p>
                        {!searchTerm && (
                            <button
                                onClick={handleOpenCreateModal}
                                className="mt-4 px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors"
                            >
                                Add Your First Group
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/50 overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority Level</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredGroups.map((group) => (
                                        <tr key={group._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                        <svg className="w-4 h-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-900">{group.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${priorityColor(group.priorityLevel)}`}>
                                                    {group.priorityLevel}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {group.createdAt ? new Date(group.createdAt).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleEditClick(group)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit group"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteClick(group)}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete group"
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

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {filteredGroups.map((group) => (
                                <div
                                    key={group._id}
                                    className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/50"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 text-base">{group.name}</h3>
                                                {group.createdAt && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {new Date(group.createdAt).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priorityColor(group.priorityLevel)}`}>
                                            Priority {group.priorityLevel}
                                        </span>
                                    </div>

                                    {/* Mobile Action Buttons */}
                                    <div className="pt-3 border-t border-gray-100 flex gap-2">
                                        <button
                                            onClick={() => handleEditClick(group)}
                                            className="flex-1 py-2.5 px-3 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(group)}
                                            className="flex-1 py-2.5 px-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
                    </>
                )}
            </main>

            {/* ── Create Group Modal ───────────────────────── */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Add Group</h2>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {(createFormError || createError) && (
                            <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{createFormError || createError}</span>
                            </div>
                        )}

                        <form onSubmit={handleCreateSubmit} className="p-4 space-y-4">
                            <div>
                                <label htmlFor="create-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Group Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="create-name"
                                    name="name"
                                    value={createFormData.name}
                                    onChange={handleCreateChange}
                                    placeholder="e.g. Family, Friends, Co-workers"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-800"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="create-priority" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Priority Level <span className="text-gray-400 text-xs">(1 = lowest, 10 = highest)</span>
                                </label>
                                <input
                                    type="number"
                                    id="create-priority"
                                    name="priorityLevel"
                                    value={createFormData.priorityLevel}
                                    onChange={handleCreateChange}
                                    min={1}
                                    max={10}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-800"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={createLoading}
                                className="w-full py-2.5 px-4 bg-violet-500 text-white font-semibold rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {createLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </>
                                ) : 'Create Group'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Edit Group Modal ─────────────────────────── */}
            {isEditModalOpen && editingGroup && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleEditModalClose}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-800">Edit Group</h2>
                            <button
                                onClick={handleEditModalClose}
                                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {(editError || updateError) && (
                            <div className="mx-4 mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{editError || updateError}</span>
                            </div>
                        )}

                        <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
                            <div>
                                <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Group Name
                                </label>
                                <input
                                    type="text"
                                    id="edit-name"
                                    name="name"
                                    value={editFormData.name || ''}
                                    onChange={handleEditChange}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-800"
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="edit-priority" className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Priority Level <span className="text-gray-400 text-xs">(1 = lowest, 10 = highest)</span>
                                </label>
                                <input
                                    type="number"
                                    id="edit-priority"
                                    name="priorityLevel"
                                    value={editFormData.priorityLevel ?? ''}
                                    onChange={handleEditChange}
                                    min={1}
                                    max={10}
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 text-gray-800"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={updateLoading}
                                className="w-full py-2.5 px-4 bg-violet-500 text-white font-semibold rounded-xl hover:bg-violet-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {updateLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Saving...
                                    </>
                                ) : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Modal ──────────────── */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleDeleteCancel}></div>
                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                        <div className="flex justify-center mb-4">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-800 text-center mb-2">Delete Group</h3>
                        <p className="text-gray-600 text-center mb-6">
                            Are you sure you want to delete this group? This action cannot be undone.
                        </p>

                        {(deleteError || deleteGroupError) && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{deleteError || deleteGroupError}</span>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteCancel}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 px-4 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-70"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={deleteLoading}
                                className="flex-1 py-2.5 px-4 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Deleting...
                                    </>
                                ) : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
