import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Layout } from './components/Layout';
import { PublicLayout } from './components/PublicLayout';
import { Landing } from './pages/Landing';
import { Pricing } from './pages/Pricing';
import { Terms } from './pages/Terms';
import { Privacy } from './pages/Privacy';
import { ReturnPolicy } from './pages/ReturnPolicy';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { History } from './pages/History';
import { Analytics } from './pages/Analytics';
import { Progress } from './pages/Progress';
import { Settings } from './pages/Settings';
import { AdminDashboard } from './pages/Admin';
import { Profile } from './pages/Profile';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div></div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <DataProvider>{children}</DataProvider>;
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Landing />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund-policy" element={<ReturnPolicy />} />
            </Route>

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/app" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="history" element={<History />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="progress" element={<Progress />} />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}
