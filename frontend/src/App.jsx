import { Navigate, Route, Routes } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import SessionsPage from './pages/SessionsPage';
import PlanSessionPage from './pages/PlanSessionPage';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/register"
        element={<RegisterPage />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sessions"
        element={
          <ProtectedRoute>
            <SessionsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/plan-session"
        element={
          <ProtectedRoute>
            <PlanSessionPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;