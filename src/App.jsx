import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import EmailConfirmPage from './pages/EmailConfirmPage';

import AllBikesPage from './pages/AllBikesPage';
import DonatePage from './pages/DonatePage';
import MyDonationsPage from './pages/MyDonationsPage';
import MyRequestsPage from './pages/MyRequestsPage';
import ProfilePage from './pages/ProfilePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingState from './components/ui/LoadingState';

// Styles
import './styles/index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="page-container">
        <LoadingState message="กำลังโหลด..." />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <AdminProvider>
            <Router>
              <div className="app-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <main style={{ flex: 1, paddingTop: 'var(--nav-height)' }}>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/email-confirm" element={<EmailConfirmPage />} />
                    <Route path="/bikes" element={<AllBikesPage />} />

                    {/* Protected User Routes */}
                    <Route path="/donate" element={
                      <ProtectedRoute>
                        <DonatePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-donations" element={
                      <ProtectedRoute>
                        <MyDonationsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/my-requests" element={
                      <ProtectedRoute>
                        <MyRequestsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin/login" element={<AdminLoginPage />} />
                    <Route path="/admin" element={<AdminPage />} />

                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </main>
                <Footer />
              </div>
            </Router>
          </AdminProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
