import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

// ---------------------------------------------------------------------------
// Context definition
// ---------------------------------------------------------------------------

const AuthContext = createContext(null);

// ---------------------------------------------------------------------------
// Helper — decode a raw JWT string and return { name, email, role } + expiry.
// Returns null if the token is missing, malformed, or expired.
// ---------------------------------------------------------------------------

function decodeToken(token) {
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    // jwtDecode expiry is in seconds; Date.now() is in milliseconds
    const isExpired = decoded.exp && decoded.exp * 1000 < Date.now();
    if (isExpired) return null;
    return {
      name: decoded.name ?? decoded.sub ?? '',
      email: decoded.email ?? decoded.sub ?? '',
      role: decoded.role ?? decoded.roles ?? '',
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);          // { name, email, role } | null
  const [token, setToken] = useState(null);         // raw JWT string | null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // true while rehydrating on mount

  // -------------------------------------------------------------------------
  // On mount — rehydrate from localStorage
  // -------------------------------------------------------------------------
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const userData = decodeToken(storedToken);

    if (storedToken && userData) {
      setToken(storedToken);
      setUser(userData);
      setIsAuthenticated(true);
    } else {
      // Token missing, expired, or invalid — clear any stale value
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }

    setIsLoading(false);
  }, []);

  // -------------------------------------------------------------------------
  // login(credentials) — POST /api/auth/login
  // Stores JWT, decodes user info, updates state, and returns the response data.
  // -------------------------------------------------------------------------
  const login = useCallback(async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    const data = response.data;

    // The backend AuthResponse contains `token` (and optionally `role`, etc.)
    const rawToken = data.token;
    const userData = decodeToken(rawToken);

    // If the JWT doesn't carry name/email, fall back to whatever the API returned
    const resolvedUser = {
      name: userData?.name || data.name || '',
      email: userData?.email || data.email || credentials.email || '',
      role: userData?.role || data.role || '',
    };

    localStorage.setItem('token', rawToken);
    setToken(rawToken);
    setUser(resolvedUser);
    setIsAuthenticated(true);

    return data;
  }, []);

  // -------------------------------------------------------------------------
  // register(data) — POST /api/auth/register
  // Does NOT auto-login. Returns the response data; caller redirects to /login.
  // -------------------------------------------------------------------------
  const register = useCallback(async (registrationData) => {
    const response = await api.post('/api/auth/register', registrationData);
    return response.data;
  }, []);

  // -------------------------------------------------------------------------
  // logout() — clears localStorage, resets state, navigates to /login
  // -------------------------------------------------------------------------
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login');
  }, [navigate]);

  // -------------------------------------------------------------------------
  // Context value
  // -------------------------------------------------------------------------
  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------------------------------------------------------------------------
// Custom hook — useAuth()
// ---------------------------------------------------------------------------

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
