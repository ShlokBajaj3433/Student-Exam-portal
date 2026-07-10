import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/Unauthorized';
import LoadingSpinner from './components/common/LoadingSpinner';

// ---------------------------------------------------------------------------
// GuestRoute — redirects already-authenticated users away from /login and
// /register to their appropriate dashboard.
// ---------------------------------------------------------------------------
function GuestRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) return <LoadingSpinner />;

  if (isAuthenticated && user) {
    const destination = user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
    return <Navigate to={destination} replace />;
  }

  return children;
}

// ---------------------------------------------------------------------------
// AppRoutes — defined inside BrowserRouter so hooks (useLocation, etc.) work
// ---------------------------------------------------------------------------
function AppRoutes() {
  return (
    <Routes>
      {/* Public / guest-only routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        }
      />
      <Route
        path="/register"
        element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        }
      />

      {/* Utility routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected admin routes */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route
          path="/admin/dashboard"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <h1 className="text-2xl font-semibold text-gray-700">Admin Dashboard</h1>
            </div>
          }
        />
        <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Protected student routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route
          path="/student/dashboard"
          element={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
              <h1 className="text-2xl font-semibold text-gray-700">Student Dashboard</h1>
            </div>
          }
        />
        <Route path="/student/*" element={<Navigate to="/student/dashboard" replace />} />
      </Route>

      {/* Root — redirect to login (AuthContext / GuestRoute will push to dashboard if already logged in) */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

// ---------------------------------------------------------------------------
// App — top-level component
// BrowserRouter wraps everything so AuthProvider (which uses useNavigate) and
// all route hooks are within the router context.
// ---------------------------------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
