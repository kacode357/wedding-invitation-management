import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../hooks/auth/useAuth';
import { useGetUnarrivedGuests } from '../hooks/guest/useGetUnarrivedGuests';
import { useGetArrivedGuests } from '../hooks/guest/useGetArrivedGuests';
import { useMarkArrived } from '../hooks/guest/useMarkArrived';

type TabType = 'invited' | 'arrived';

export default function AttendancePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('invited');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { guests: invitedGuests, count: invitedCount, isLoading: invitedLoading, error: invitedError, fetchGuests: fetchUnarrivedGuests } = useGetUnarrivedGuests();
  const { guests: arrivedGuests, count: arrivedCount, isLoading: arrivedLoading, error: arrivedError, fetchGuests: fetchArrivedGuests } = useGetArrivedGuests();
  const { isLoading: markingArrived, markArrived } = useMarkArrived();

  useEffect(() => {
    if (activeTab === 'invited') {
      fetchUnarrivedGuests();
    } else {
      fetchArrivedGuests();
    }
  }, [activeTab, fetchUnarrivedGuests, fetchArrivedGuests]);

  const handleLogout = () => {
    logout();
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMarkArrived = async (guestId: string) => {
    const result = await markArrived(guestId);
    if (result.success) {
      toast.success('Guest marked as arrived');
      fetchUnarrivedGuests();
      fetchArrivedGuests();
    } else {
      toast.error('Failed to mark guest as arrived');
    }
  };

  const currentGuests = activeTab === 'invited' ? invitedGuests : arrivedGuests;
  const isLoading = activeTab === 'invited' ? invitedLoading : arrivedLoading;
  const error = activeTab === 'invited' ? invitedError : arrivedError;

  const filteredGuests = currentGuests.filter((guest) =>
    guest.guestName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-amber-50 to-rose-100">
      {/* Mobile-friendly Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Back Button & Logo */}
            <div className="flex items-center">
              <button
                onClick={() => navigate('/home')}
                className="mr-2 p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-rose-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C13.1 2 14 2.9 14 4C14 4.74 13.6 5.39 13 5.73V7H14C17.87 7 21 10.13 21 14V20C21 21.1 20.1 22 19 22H5C3.9 22 3 21.1 3 20V14C3 10.13 6.13 7 10 7H11V5.73C10.4 5.39 10 4.74 10 4C10 2.9 10.9 2 12 2ZM12 4C11.45 4 11 4.45 11 5C11 5.55 11.45 6 12 6C12.55 6 13 5.55 13 5C13 4.45 12.55 4 12 4ZM5 14V19H19V14C19 11.24 16.76 9 14 9H10C7.24 9 5 11.24 5 14Z"/>
                  </svg>
                </div>
                <span className="text-sm sm:text-xl font-serif font-bold text-gray-800 hidden xs:block">
                  Attendance
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Attendance</h1>
              <p className="text-sm text-gray-500">Track guest attendance</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white/50 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all duration-200"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/50 overflow-hidden">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('invited')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'invited'
                  ? 'bg-rose-50 text-rose-600 border-b-2 border-rose-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>Invited</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'invited' ? 'bg-rose-200 text-rose-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {invitedCount}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('arrived')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-colors flex items-center justify-center gap-2 ${
                activeTab === 'arrived'
                  ? 'bg-green-50 text-green-600 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Arrived</span>
              <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                activeTab === 'arrived' ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-600'
              }`}>
                {arrivedCount}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : filteredGuests.length === 0 ? (
              <div className="text-center py-12">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  activeTab === 'invited' ? 'bg-rose-100' : 'bg-green-100'
                }`}>
                  {activeTab === 'invited' ? (
                    <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <p className="text-gray-600 mb-2">
                  {activeTab === 'invited' ? 'No invited guests' : 'No arrived guests yet'}
                </p>
                <p className="text-sm text-gray-500">
                  {activeTab === 'invited' ? 'Guests with sent invitations will appear here' : 'Mark guests as arrived to see them here'}
                </p>
              </div>
            ) : (
              <>
                {/* Mobile Card View */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:hidden">
                  {filteredGuests.map((guest) => (
                    <div
                      key={guest._id}
                      className={`rounded-xl p-4 border ${
                        activeTab === 'invited'
                          ? 'bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200'
                          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            activeTab === 'invited' ? 'bg-rose-500' : 'bg-green-500'
                          }`}>
                            {activeTab === 'invited' ? (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <span className="font-semibold text-gray-800">{guest.guestName}</span>
                        </div>
                        <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-bold rounded-full ${
                          activeTab === 'invited' ? 'bg-rose-500 text-white' : 'bg-green-500 text-white'
                        }`}>
                          {guest.numberOfGuests}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{guest.phone}</p>
                      {guest.category && (
                        <p className="text-xs text-gray-500 mb-2">Category: {guest.category}</p>
                      )}
                      {activeTab === 'invited' && (
                        <button
                          onClick={() => guest._id && handleMarkArrived(guest._id)}
                          disabled={markingArrived}
                          className="w-full px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Check In
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Guest Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 hidden md:table-cell">Phone</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Category</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600 hidden lg:table-cell">Table</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Guests</th>
                        {activeTab === 'invited' && (
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGuests.map((guest) => (
                        <tr key={guest._id} className={`border-b border-gray-100 hover:${
                          activeTab === 'invited' ? 'bg-rose-50/50' : 'bg-green-50/50'
                        }`}>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                activeTab === 'invited' ? 'bg-rose-100' : 'bg-green-100'
                              }`}>
                                {activeTab === 'invited' ? (
                                  <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className="font-medium text-gray-800">{guest.guestName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden md:table-cell">{guest.phone}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">{guest.category || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-600 hidden lg:table-cell">
                            {guest.table?.tableName || guest.table?.tableNumber || '-'}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                              activeTab === 'invited' ? 'bg-rose-100 text-rose-700' : 'bg-green-100 text-green-700'
                            }`}>
                              {guest.numberOfGuests}
                            </span>
                          </td>
                          {activeTab === 'invited' && (
                            <td className="py-3 px-4 text-center">
                              <button
                                onClick={() => guest._id && handleMarkArrived(guest._id)}
                                disabled={markingArrived}
                                className="px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 mx-auto"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Check In
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
