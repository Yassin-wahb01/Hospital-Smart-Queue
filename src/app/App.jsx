import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import AuthPage from '../features/auth/AuthPage';
import DashboardLayout from '../features/dashboard/DashboardLayout';
import StaffPage from '../features/staff/StaffPage';
import DepartmentsPage from '../features/departments/DepartmentsPage';
import AnalyticsPage from '../features/analytics/AnalyticsPage';
import './App.css';


export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="staff" replace />} />
            <Route path="staff"       element={<StaffPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="analytics"   element={<AnalyticsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}