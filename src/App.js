import { BrowserRouter, Routes, Route } from 'react-router-dom';
import RoomsListPage from './pages/RoomsListPage/RoomsListPage';
import ComplaintsPage from './pages/ComplaintsPage/ComplaintsPage';
import AuthPage from './pages/AuthPage/AuthPage';
import AdminPage from './pages/AdminPage/AdminPage';
import AdminApplicationPage from './pages/AdminApplicationPage/AdminApplicationPage';
import AdminRoomRequestsPage from './pages/AdminRoomRequestsPage/AdminRoomRequestsPage';
import AdminSchemePage from './pages/AdminSchemePage/AdminSchemePage';
import AdminLayoutProposalsPage from './pages/AdminLayoutProposalsPage/AdminLayoutProposalsPage';
import AdminProposalReviewPage from './pages/AdminProposalReviewPage/AdminProposalReviewPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {}
        <Route path="/" element={<RoomsListPage />} />
        <Route path="/rooms/:id" element={<ComplaintsPage />} />
        <Route path="/auth" element={<AuthPage />} />
        {}
        <Route
          path="/admin/rooms"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/applications"
          element={
            <ProtectedRoute>
              <AdminApplicationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/room-requests"
          element={
            <ProtectedRoute>
              <AdminRoomRequestsPage />
            </ProtectedRoute>
          }
        />
        {}
        <Route
          path="/admin/rooms/:id/scheme"
          element={
            <ProtectedRoute>
              <AdminSchemePage />
            </ProtectedRoute>
          }
        />
        {}
        <Route
          path="/admin/layout-proposals"
          element={
            <ProtectedRoute>
              <AdminLayoutProposalsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/layout-proposals/:id"
          element={
            <ProtectedRoute>
              <AdminProposalReviewPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;