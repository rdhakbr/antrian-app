import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './layouts/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BookingPage from './pages/BookingPage';
import { RealtimePage, RiwayatPage, ProfilPage } from './pages/UserPages';
import { AdminDashboard, AdminAntrean, AdminJadwal, AdminLayanan, AdminPetugas, AdminUsers } from './pages/AdminPages';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>Memuat...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} /> : <LoginPage />} />

      {/* User routes */}
      <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardPage /></Layout></PrivateRoute>} />
      <Route path="/booking"   element={<PrivateRoute><Layout><BookingPage /></Layout></PrivateRoute>} />
      <Route path="/realtime"  element={<PrivateRoute><Layout><RealtimePage /></Layout></PrivateRoute>} />
      <Route path="/riwayat"   element={<PrivateRoute><Layout><RiwayatPage /></Layout></PrivateRoute>} />
      <Route path="/profil"    element={<PrivateRoute><Layout><ProfilPage /></Layout></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin/dashboard" element={<PrivateRoute adminOnly><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      <Route path="/admin/antrean"   element={<PrivateRoute adminOnly><Layout><AdminAntrean /></Layout></PrivateRoute>} />
      <Route path="/admin/jadwal"    element={<PrivateRoute adminOnly><Layout><AdminJadwal /></Layout></PrivateRoute>} />
      <Route path="/admin/layanan"   element={<PrivateRoute adminOnly><Layout><AdminLayanan /></Layout></PrivateRoute>} />
      <Route path="/admin/petugas"   element={<PrivateRoute adminOnly><Layout><AdminPetugas /></Layout></PrivateRoute>} />
      <Route path="/admin/users"     element={<PrivateRoute adminOnly><Layout><AdminUsers /></Layout></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
