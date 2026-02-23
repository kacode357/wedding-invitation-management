import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import HomePage from './pages/HomePage.tsx'
import AddGuestPage from './pages/AddGuestPage.tsx'
import AddTablePage from './pages/AddTablePage.tsx'
import GuestsPage from './pages/GuestsPage.tsx'
import TablesPage from './pages/TablesPage.tsx'
import InvitedGuestsPage from './pages/InvitedGuestsPage.tsx'
import UninvitedGuestsPage from './pages/UninvitedGuestsPage.tsx'
import AttendancePage from './pages/AttendancePage.tsx'
import NotesPage from './pages/NotesPage.tsx'
import AddNotePage from './pages/AddNotePage.tsx'
import CategoriesPage from './pages/CategoriesPage.tsx'
import AddCategoryPage from './pages/AddCategoryPage.tsx'
import UserInfoPage from './pages/UserInfoPage.tsx'
import GroupsPage from './pages/GroupsPage.tsx'
import LocationPage from './pages/LocationPage.tsx'
import CreateInvitationPage from './pages/CreateInvitationPage.tsx'
import InvitationPage from './pages/InvitationPage.tsx'
import { ProtectedRoute } from './components/ProtectedRoute.tsx'

// ScrollToTop component - scrolls window to top on route changes
function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
}

createRoot(document.getElementById('root')!).render(
  (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<App />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-guest"
          element={
            <ProtectedRoute>
              <AddGuestPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-table"
          element={
            <ProtectedRoute>
              <AddTablePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/guests"
          element={
            <ProtectedRoute>
              <GuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tables"
          element={
            <ProtectedRoute>
              <TablesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/invited-guests"
          element={
            <ProtectedRoute>
              <InvitedGuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/uninvited-guests"
          element={
            <ProtectedRoute>
              <UninvitedGuestsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/attendance"
          element={
            <ProtectedRoute>
              <AttendancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-info"
          element={
            <ProtectedRoute>
              <UserInfoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-note"
          element={
            <ProtectedRoute>
              <AddNotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-note/:id"
          element={
            <ProtectedRoute>
              <AddNotePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <ProtectedRoute>
              <CategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-category"
          element={
            <ProtectedRoute>
              <AddCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-category/:id"
          element={
            <ProtectedRoute>
              <AddCategoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/groups"
          element={
            <ProtectedRoute>
              <GroupsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-invitation"
          element={
            <ProtectedRoute>
              <CreateInvitationPage />
            </ProtectedRoute>
          }
        />
        {/* Public routes - no auth required */}
        <Route path="/location" element={<LocationPage />} />
        <Route path="/invitation" element={<InvitationPage />} />
        <Route path="/invite/:hash" element={<InvitationPage />} />
      </Routes>
    </BrowserRouter>
  )
)
