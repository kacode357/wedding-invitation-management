import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useGetAllGuests } from '../hooks/guest/useGetAllGuests';
import { useCreateInvitation } from '../hooks/guest/useCreateInvitation';
import { useCategories } from '../hooks/category/useCategories';
import { useGroups } from '../hooks/group/useGroups';
import type { Guest } from '../types/guest/guest.response';

export default function CreateInvitationPage() {
    const navigate = useNavigate();

    // Hooks
    const { guests: allGuests, isLoading: allGuestsLoading, fetchGuests: fetchAllGuests } = useGetAllGuests();
    const { createInvitation, isLoading: isCreatingInvitation } = useCreateInvitation();
    const { categories, fetchCategories } = useCategories();
    const { groups, fetchGroups } = useGroups();

    // State
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [groupFilter, setGroupFilter] = useState<string>('all');
    const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    useEffect(() => {
        fetchAllGuests();
        fetchCategories();
        fetchGroups();
    }, [fetchAllGuests, fetchCategories, fetchGroups]);

    const handleBack = () => navigate('/home');

    const handleCreateInvitation = async (guest: Guest) => {
        const guestId = guest._id || (guest as any).id;
        if (!guestId) return;

        const result = await createInvitation(guestId);
        if (result.success && result.guest?.invitationId) {
            const guestName = result.guest.guestName || guest.guestName;
            const combinedData = `${result.guest.invitationId}|${guestName}`;
            const encodedHash = btoa(encodeURIComponent(combinedData)); // Base64 mã hoá để giấu ID và tên
            const inviteLink = `${window.location.origin}/invite/${encodedHash}`;
            setGeneratedLink(inviteLink);
            setIsLinkModalOpen(true);
            fetchAllGuests(); // Refresh list to update status
        } else {
            toast.error('Failed to create invitation');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Invitation link copied to clipboard!');
    };

    const filteredGuests = allGuests.filter(guest => {
        if (categoryFilter !== 'all') {
            if (categoryFilter === 'none' && guest.categoryName) return false;
            if (categoryFilter !== 'none' && guest.categoryName !== categoryFilter) return false;
        }
        if (groupFilter !== 'all') {
            if (groupFilter === 'none' && guest.groupName) return false;
            if (groupFilter !== 'none' && guest.groupName !== groupFilter) return false;
        }
        if (searchTerm) {
            if (!guest.guestName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        }
        return true;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100 pb-20">
            <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <div>
                            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-800">Create E-Invitations</h1>
                            <p className="text-[10px] sm:text-xs text-gray-500 font-medium">Dashboard / Invitations</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
                <div className="bg-white rounded-2xl shadow-xl border border-white/50 overflow-hidden">
                    {/* Filters Area */}
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Search guests by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2.5 pl-11 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent shadow-sm"
                                />
                                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <div className="flex gap-2 sm:gap-4">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="flex-1 md:w-48 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-sm"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="none">No Category</option>
                                    {categories.map(cat => <option key={cat._id} value={cat.name}>{cat.name}</option>)}
                                </select>
                                <select
                                    value={groupFilter}
                                    onChange={(e) => setGroupFilter(e.target.value)}
                                    className="flex-1 md:w-48 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer shadow-sm"
                                >
                                    <option value="all">All Groups</option>
                                    <option value="none">No Group</option>
                                    {groups.map(group => <option key={group._id} value={group.name}>{group.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* List Area */}
                    <div className="min-h-[400px]">
                        {allGuestsLoading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500 mb-4"></div>
                                <p className="text-gray-500 animate-pulse">Loading guest list...</p>
                            </div>
                        ) : filteredGuests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">No guests found</h3>
                                <p className="text-gray-500 mt-1 max-w-xs">We couldn't find any guests matching your search or filters.</p>
                                <button
                                    onClick={() => { setSearchTerm(''); setCategoryFilter('all'); setGroupFilter('all'); }}
                                    className="mt-6 text-rose-600 font-semibold hover:underline"
                                >
                                    Clear all filters
                                </button>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {filteredGuests.map((guest) => (
                                    <div key={guest._id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${guest.isInvitationCreated ? 'bg-green-50 text-green-600' : 'bg-rose-50 text-rose-600'}`}>
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-bold text-gray-800 sm:text-lg truncate">{guest.guestName}</h4>
                                                <div className="flex flex-wrap items-center gap-2 mt-1">
                                                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded uppercase tracking-wider">{guest.categoryName || 'No Category'}</span>
                                                    {guest.groupName && (
                                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-bold rounded uppercase tracking-wider">{guest.groupName}</span>
                                                    )}
                                                    <span className="text-[11px] text-gray-400 font-medium">• {guest.confirmedGuests}/{guest.numberOfGuests} guests</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 sm:self-center">
                                            <button
                                                onClick={() => handleCreateInvitation(guest)}
                                                disabled={isCreatingInvitation}
                                                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 ${guest.isInvitationCreated
                                                    ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                                                    : 'bg-rose-500 text-white hover:bg-rose-600'
                                                    }`}
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                {guest.isInvitationCreated ? 'View Details' : 'Generate Link'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Success Link Modal */}
            {isLinkModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsLinkModalOpen(false)}></div>
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-black text-gray-800 mb-2">Success!</h3>
                            <p className="text-gray-500 mb-8 font-medium">Your invitation link has been generated successfully.</p>

                            <div className="relative mb-8">
                                <div className="w-full px-4 py-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl text-xs text-rose-600 font-mono break-all pr-12 text-left">
                                    {generatedLink}
                                </div>
                                <button
                                    onClick={() => copyToClipboard(generatedLink)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white text-rose-500 rounded-xl shadow-lg border border-rose-50 hover:bg-rose-50 transition-all active:scale-90"
                                    title="Copy to clipboard"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                    </svg>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => window.open(generatedLink, '_blank')}
                                    className="px-4 py-3 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors flex items-center justify-center gap-2 border border-rose-100"
                                >
                                    Preview
                                </button>
                                <button
                                    onClick={() => setIsLinkModalOpen(false)}
                                    className="px-4 py-3 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
