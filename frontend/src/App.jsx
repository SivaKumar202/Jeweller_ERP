import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import Customers from './pages/Customers.jsx';
import Billing from './pages/Billing.jsx';
import Purchases from './pages/Purchases.jsx';
import Reports from './pages/Reports.jsx';
import Settings from './pages/Settings.jsx';
import { useAuthStore } from './store/authStore.js';

// Route protection wrapper
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user, init } = useAuthStore();

  useEffect(() => {
    init(); // Setup Auth tokens
  }, []);

  return (
    <div className="flex min-h-screen bg-royal-950 font-sans antialiased text-slate-100">
      {/* Sidebar rendered only if logged in */}
      {user && <Sidebar />}

      {/* Main viewport */}
      <div className={`flex-1 transition-all duration-300 ${user ? 'pl-64' : 'pl-0'}`}>
        <Routes>
          {/* Public Auth Portal */}
          <Route path="/auth/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />

          {/* Secure ERP Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
          <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>} />

          {/* Fallback Redirection */}
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/auth/login"} replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
