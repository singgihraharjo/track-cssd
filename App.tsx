
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import DistributionSterile from './pages/DistributionSterile';
import CollectionDirty from './pages/CollectionDirty';
import ScanValidation from './pages/ScanValidation';
import TransactionHistory from './pages/TransactionHistory';
import Units from './pages/Units';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';
import { AppProvider, useApp } from './context/AppContext';
import { UserRole } from './types';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowedRoles is defined, check if user has permission
  if (allowedRoles && !allowedRoles.includes(currentUser.role)) {
      return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const AppRoutes: React.FC = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/units" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <Units />
                </ProtectedRoute>
            } />
            
            <Route path="/inventory" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}>
                    <Inventory />
                </ProtectedRoute>
            } />
            
            <Route path="/distribute" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}>
                    <DistributionSterile />
                </ProtectedRoute>
            } />
            
            <Route path="/collect" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}>
                    <CollectionDirty />
                </ProtectedRoute>
            } />

            <Route path="/history" element={
                <ProtectedRoute allowedRoles={['ADMIN', 'TECHNICIAN']}>
                    <TransactionHistory />
                </ProtectedRoute>
            } />
            
            <Route path="/scan" element={
                <ProtectedRoute>
                    <ScanValidation />
                </ProtectedRoute>
            } />

            <Route path="/profile" element={
                <ProtectedRoute>
                    <Profile />
                </ProtectedRoute>
            } />

            <Route path="/users" element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                    <UserManagement />
                </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
         <AppRoutes />
      </Router>
    </AppProvider>
  );
};

export default App;
