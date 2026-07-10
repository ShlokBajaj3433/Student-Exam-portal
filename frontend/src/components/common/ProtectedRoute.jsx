import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute
 *
 * Wraps protected sections of the route tree.
 *
 * Usage (in App.jsx):
 *   <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 * Behaviour:
 *  1. While AuthContext is rehydrating → render <LoadingSpinner />
 *  2. Not authenticated              → redirect to /login
 *  3. Authenticated but wrong role   → redirect to /unauthorized (403)
 *  4. Authenticated & role matches   → render <Outlet /> (child routes)
 *
 * @param {string[]} [allowedRoles]  Optional list of roles permitted to access
 *                                   the protected routes.  When omitted, any
 *                                   authenticated user is allowed through.
 */
function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Step 1 — still rehydrating from localStorage
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Step 2 — not logged in at all
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Step 3 — authenticated but role not permitted
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Step 4 — all checks passed; render nested routes
  return <Outlet />;
}

export default ProtectedRoute;
