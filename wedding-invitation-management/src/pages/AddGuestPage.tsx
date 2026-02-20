import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCategories } from '../hooks/category/useCategories';
import { useNotes } from '../hooks/note/useNotes';
import { useGuests } from '../hooks/guest/useGuests';
import { useGroups } from '../hooks/group/useGroups';

interface GuestDraft {
  id: string;
  guestName: string;
  categoryId: string;
  groupId: string;
  numberOfGuests: number;
  confirmedGuests: number;
  noteId: string;
}

export default function AddGuestPage() {
  const navigate = useNavigate();
  const { categories, isLoading: isLoadingCategories, error: categoriesError, fetchCategories } = useCategories();
  const { notes, isLoading: isLoadingNotes, error: notesError, fetchNotes } = useNotes();
  const { groups, isLoading: isLoadingGroups, error: groupsError, fetchGroups } = useGroups();
  const { bulkCreateGuests, isLoading: isLoadingGuests } = useGuests();

  const [guests, setGuests] = useState<GuestDraft[]>(() => {
    const saved = localStorage.getItem('draftGuests');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [{ id: Date.now().toString(), guestName: '', categoryId: '', groupId: '', numberOfGuests: 1, confirmedGuests: 1, noteId: '' }];
  });

  const [openDropdown, setOpenDropdown] = useState<{ index: number; type: 'category' | 'group' | 'guest' | 'confirmed' | 'note' } | null>(null);

  useEffect(() => {
    fetchCategories();
    fetchNotes();
    fetchGroups();
  }, [fetchCategories, fetchNotes, fetchGroups]);

  useEffect(() => {
    localStorage.setItem('draftGuests', JSON.stringify(guests));
  }, [guests]);

  const handleBack = () => navigate('/home');

  const updateGuest = (index: number, field: keyof GuestDraft, value: string | number) => {
    const newGuests = [...guests];

    if (field === 'numberOfGuests') {
      const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
      // Kiểm tra xem hiện tại có đang là "Attend all" không
      const isCurrentlyAttendAll = newGuests[index].confirmedGuests === newGuests[index].numberOfGuests;

      newGuests[index].numberOfGuests = numValue;

      // Nếu đang là "Attend all", cho nó nhảy theo để tiếp tục là "Attend all"
      if (isCurrentlyAttendAll) {
        newGuests[index].confirmedGuests = numValue;
      }
      // Nếu số khách mới thấp hơn cả số confirmed cũ, thì ép confirmed xuống bằng
      else if (newGuests[index].confirmedGuests > numValue) {
        newGuests[index].confirmedGuests = numValue;
      }
    }
    else if (field === 'confirmedGuests') {
      newGuests[index].confirmedGuests = typeof value === 'string' ? parseInt(value, 10) : value;
    }
    else {
      newGuests[index] = { ...newGuests[index], [field]: value };
    }

    setGuests(newGuests);
    setOpenDropdown(null);
  };

  const handleAddAnotherGuest = () => {
    const lastGuest = guests[guests.length - 1];
    setGuests([
      ...guests,
      {
        id: Date.now().toString(),
        guestName: '',
        categoryId: lastGuest ? lastGuest.categoryId : '',
        groupId: lastGuest ? lastGuest.groupId : '',
        numberOfGuests: 1,
        confirmedGuests: 1,
        noteId: ''
      }
    ]);
  };

  const handleRemoveGuest = (indexToRemove: number) => {
    if (guests.length === 1) return;
    setGuests(guests.filter((_, index) => index !== indexToRemove));
  };

  const toggleDropdown = (index: number, type: 'category' | 'group' | 'guest' | 'confirmed' | 'note', e: React.MouseEvent) => {
    e.stopPropagation();
    if (openDropdown?.index === index && openDropdown?.type === type) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown({ index, type });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      guests: guests.map(g => ({
        guestName: g.guestName,
        categoryId: g.categoryId,
        groupId: g.groupId || undefined,
        numberOfGuests: g.numberOfGuests,
        confirmedGuests: g.confirmedGuests,
        tableId: "",
        noteId: g.noteId
      }))
    };

    console.log(JSON.stringify(payload, null, 2));

    const success = await bulkCreateGuests(payload);

    if (success) {
      localStorage.removeItem('draftGuests');
      setGuests([{ id: Date.now().toString(), guestName: '', categoryId: '', groupId: '', numberOfGuests: 1, confirmedGuests: 1, noteId: '' }]);
      toast.success(`Added ${guests.length} guests!`);
    } else {
      toast.error('Failed to add guests. Please try again.');
    }
  };

  const guestOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100 pb-20" onClick={() => setOpenDropdown(null)}>
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <button onClick={handleBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mr-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              <span className="hidden sm:inline text-sm font-medium">Back</span>
            </button>
            <h1 className="text-lg sm:text-xl font-serif font-bold text-gray-800">Add Guests</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        {categoriesError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{categoriesError}</div>}
        {notesError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{notesError}</div>}
        {groupsError && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">{groupsError}</div>}

        {(isLoadingCategories || isLoadingNotes || isLoadingGroups) && (
          <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div></div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {guests.map((guest, index) => {
            const selectedCategory = categories.find(c => c._id === guest.categoryId);
            const selectedGroup = groups.find(g => g._id === guest.groupId);
            const selectedNote = notes.find(n => n._id === guest.noteId);

            return (
              <div key={guest.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 lg:p-8 relative">
                <div className="absolute -top-3 left-4 bg-rose-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Guest {index + 1}
                </div>

                {guests.length > 1 && (
                  <button type="button" onClick={() => handleRemoveGuest(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Guest Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={guest.guestName}
                      onChange={(e) => updateGuest(index, 'guestName', e.target.value)}
                      placeholder="Enter guest name"
                      autoComplete="off"
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-rose-500 hover:border-rose-400 bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => !isLoadingCategories && toggleDropdown(index, 'category', e)}
                        disabled={isLoadingCategories}
                        className={`w-full px-4 py-3 text-left border rounded-xl bg-white 
    transition-all duration-200 flex items-center justify-between
    ${isLoadingCategories
                            ? "bg-gray-100 cursor-not-allowed border-gray-200"
                            : guest.categoryId
                              ? "border-rose-400 focus:ring-2 focus:ring-rose-200"
                              : "border-gray-300 hover:border-rose-400 focus:ring-2 focus:ring-rose-200"
                          }`}
                      >
                        <span className={guest.categoryId ? "text-gray-800" : "text-gray-400"}>
                          {selectedCategory?.name || "Select a category"}
                        </span>

                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown?.index === index && openDropdown.type === "category"
                            ? "rotate-180"
                            : ""
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      {openDropdown?.index === index && openDropdown.type === 'category' && !isLoadingCategories && (
                        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          {categories.length === 0 ? <div className="px-4 py-3 text-gray-500 text-sm">No categories</div> : categories.map(cat => (
                            <button key={cat._id} type="button" onClick={() => updateGuest(index, 'categoryId', cat._id)}
                              className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${cat._id === guest.categoryId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                              <span>{cat.name}</span>
                              {cat._id === guest.categoryId && <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Group dropdown */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Group <span className="text-gray-400 text-xs">(optional)</span></label>
                    <div className="relative">
                      <button type="button" onClick={(e) => !isLoadingGroups && toggleDropdown(index, 'group', e)} disabled={isLoadingGroups}
                        className={`w-full px-4 py-3 text-left border rounded-xl bg-white
  transition-all duration-200 flex items-center justify-between
  ${isLoadingGroups
                            ? "bg-gray-100 cursor-not-allowed border-gray-200"
                            : guest.groupId && guest.groupId.trim() !== ""
                              ? "border-rose-400"
                              : "border-gray-300 hover:border-rose-400"
                          }`}>
                        <span className={guest.groupId === '' ? 'text-gray-400' : 'text-gray-800'}>
                          {selectedGroup ? `${selectedGroup.name} · P${selectedGroup.priorityLevel}` : 'Select a group (optional)'}
                        </span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown?.index === index && openDropdown.type === 'group' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {openDropdown?.index === index && openDropdown.type === 'group' && !isLoadingGroups && (
                        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          <button type="button" onClick={() => updateGuest(index, 'groupId', '')}
                            className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${guest.groupId === '' ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                            <span>None</span>
                            {guest.groupId === '' && <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                          </button>
                          {groups.length === 0
                            ? <div className="px-4 py-3 text-gray-500 text-sm">No groups available</div>
                            : groups.map(grp => (
                              <button key={grp._id} type="button" onClick={() => updateGuest(index, 'groupId', grp._id)}
                                className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${grp._id === guest.groupId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                                <span>{grp.name} <span className="text-xs text-gray-400 ml-1">· P{grp.priorityLevel}</span></span>
                                {grp._id === guest.groupId && <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              </button>
                            ))
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>Number of Guests</span>
                      </label>
                      <div className="relative">
                        <button type="button" onClick={(e) => toggleDropdown(index, 'guest', e)}
                          className="w-full px-4 py-3 text-left border border-gray-300 hover:border-rose-400 rounded-xl bg-white transition-all duration-200 flex items-center justify-between">
                          <span className="text-gray-800">{guest.numberOfGuests} {guest.numberOfGuests === 1 ? 'Guest' : 'Guests'}</span>
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown?.index === index && openDropdown.type === 'guest' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdown?.index === index && openDropdown.type === 'guest' && (
                          <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            {guestOptions.map(num => (
                              <button key={`guest-${num}`} type="button" onClick={() => updateGuest(index, 'numberOfGuests', num)}
                                className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${num === guest.numberOfGuests ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                                <span>{num} {num === 1 ? 'Guest' : 'Guests'}</span>
                                {num === guest.numberOfGuests && <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>Confirmed Guests</span>
                      </label>
                      <div className="relative">
                        <button type="button" onClick={(e) => toggleDropdown(index, 'confirmed', e)}
                          className="w-full px-4 py-3 text-left border border-gray-300 hover:border-rose-400 rounded-xl bg-white transition-all duration-200 flex items-center justify-between">
                          <span className="text-gray-800 block truncate pr-2">
                            {guest.confirmedGuests === guest.numberOfGuests ? 'Attend all' : `${guest.confirmedGuests} Confirmed`}
                          </span>
                          <svg className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${openDropdown?.index === index && openDropdown.type === 'confirmed' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                        </button>
                        {openDropdown?.index === index && openDropdown.type === 'confirmed' && (
                          <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                            <button type="button" onClick={() => updateGuest(index, 'confirmedGuests', guest.numberOfGuests)}
                              className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${guest.confirmedGuests === guest.numberOfGuests ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                              <span className="truncate pr-2">Attend all</span>
                              {guest.confirmedGuests === guest.numberOfGuests && <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </button>

                            {/* Chỗ này filter chỉ hiển thị các option số lượng thấp hơn tổng khách */}
                            {guestOptions.filter(opt => opt < guest.numberOfGuests).map(opt => (
                              <button key={`confirmed-${opt}`} type="button" onClick={() => updateGuest(index, 'confirmedGuests', opt)}
                                className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${opt === guest.confirmedGuests ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                                <span className="truncate pr-2">{opt} Confirmed</span>
                                {opt === guest.confirmedGuests && <svg className="w-4 h-4 text-rose-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note</label>
                    <div className="relative">
                      <button type="button" onClick={(e) => !isLoadingNotes && toggleDropdown(index, 'note', e)} disabled={isLoadingNotes}
                        className={`w-full px-4 py-3 text-left border rounded-xl bg-white transition-all duration-200 flex items-center justify-between ${isLoadingNotes ? "bg-gray-100 cursor-not-allowed border-gray-200" : guest.noteId !== '' ? "border-rose-300" : "border-gray-300 hover:border-rose-400"}`}>
                        <span className={guest.noteId === '' ? 'text-gray-400' : 'text-gray-800'}>{selectedNote ? selectedNote.name : 'Select a note (optional)'}</span>
                        <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDropdown?.index === index && openDropdown.type === 'note' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {openDropdown?.index === index && openDropdown.type === 'note' && !isLoadingNotes && (
                        <div className="absolute z-[100] w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                          <button type="button" onClick={() => updateGuest(index, 'noteId', '')} className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${guest.noteId === '' ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                            <span>None</span>
                            {guest.noteId === '' && <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                          </button>
                          {notes.map(note => (
                            <button key={note._id} type="button" onClick={() => updateGuest(index, 'noteId', note._id)} className={`w-full px-4 py-3 text-left hover:bg-rose-50 transition-colors flex items-center justify-between ${note._id === guest.noteId ? 'bg-rose-50 text-rose-600' : 'text-gray-700'}`}>
                              <span>{note.name}</span>
                              {note._id === guest.noteId && <svg className="w-4 h-4 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleAddAnotherGuest}
              className="w-full py-3 px-4 bg-white border-2 border-dashed border-rose-300 text-rose-600 font-semibold rounded-xl hover:bg-rose-50 hover:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
              <span>Add Another Guest</span>
            </button>

            <button type="submit" disabled={isLoadingCategories || isLoadingNotes || isLoadingGroups || isLoadingGuests}
              className="w-full py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:from-rose-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transform transition-all duration-200 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
              <span>Submit All Guests</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}