import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import ResourceHub from './pages/ResourceHub';
import PdfViewerPage from './pages/PdfViewerPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import Mentors from './pages/Mentors';
import AppLayout from './components/layout/AppLayout';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from '@/lib/auth';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          
          {/* Public Student Routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resources" element={<ResourceHub />} />
            <Route path="/reader" element={<PdfViewerPage />} />
            <Route path="/video" element={<VideoPlayerPage />} />
            <Route path="/mentors" element={<Mentors />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/content" element={<Navigate to="/admin/dashboard#pdf-resources" replace />} />
            <Route path="/admin/users" element={<Navigate to="/admin/dashboard#admin-help" replace />} />
            <Route path="/admin/settings" element={<Navigate to="/admin/dashboard#admin-help" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
