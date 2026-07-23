import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Unauthorized from './pages/Unauthorized';
import LoadingSpinner from './components/common/LoadingSpinner';
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import ExamManager from './pages/admin/ExamManager';
import QuestionBank from './pages/admin/QuestionBank';
import QuestionEditor from './pages/admin/QuestionEditor';
import UserManager from './pages/admin/UserManager';
import ResultsViewer from './pages/admin/ResultsViewer';
import Analytics from './pages/admin/Analytics';
import ProfilePage from './pages/ProfilePage';
import StudentLayout from './components/layout/StudentLayout';
import AvailableExams from './pages/student/AvailableExams';
import AttemptHistory from './pages/student/AttemptHistory';
import ExamWorkspace from './pages/student/ExamWorkspace';
import Result from './pages/student/Result';

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
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/exams" element={<ExamManager />} />
          <Route path="/admin/questions" element={<QuestionBank />} />
          <Route path="/admin/questions/new" element={<QuestionEditor />} />
          <Route path="/admin/questions/:id/edit" element={<QuestionEditor />} />
          <Route path="/admin/users" element={<UserManager />} />
          <Route path="/admin/results" element={<ResultsViewer />} />
          <Route path="/admin/analytics" element={<Analytics />} />
          <Route path="/admin/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
      </Route>

      {/* Protected student routes */}
      <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
        <Route element={<StudentLayout />}>
          <Route path="/student/dashboard" element={<Navigate to="/student/exams" replace />} />
          <Route path="/student/exams" element={<AvailableExams />} />
          <Route path="/student/attempts" element={<AttemptHistory />} />
          <Route path="/student/profile" element={<ProfilePage />} />
          <Route path="/student/result/:attemptId" element={<Result />} />
        </Route>
        <Route path="/student/exam/:attemptId" element={<ExamWorkspace />} />
        <Route path="/student" element={<Navigate to="/student/exams" replace />} />
        <Route path="/student/*" element={<Navigate to="/student/exams" replace />} />
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
