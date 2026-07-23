import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BookOpen, ClipboardList, LogOut, Menu, X, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/student/exams',    label: 'Available Exams', icon: BookOpen },
  { to: '/student/attempts', label: 'My Attempts',     icon: ClipboardList },
  { to: '/student/profile',  label: 'My Profile',      icon: UserCircle },
];

function StudentLayout() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeLinkClass =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-teal-700 text-white';
  const inactiveLinkClass =
    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-700 hover:text-white transition-colors';

  const getLinkClass = ({ isActive }) => (isActive ? activeLinkClass : inactiveLinkClass);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ── Top Navigation Bar ── */}
      <header className="bg-teal-800 shadow-sm flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Brand */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <BookOpen size={22} className="text-teal-300" />
              <span className="text-lg font-bold text-white tracking-tight">ExamPortal</span>
              <span className="hidden sm:inline text-xs text-teal-300 font-medium ml-1">
                Student
              </span>
            </div>

            {/* Desktop nav links */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={getLinkClass}>
                  <Icon size={16} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>

            {/* Right side — user info + logout */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white leading-tight">
                  {user?.name || user?.email || 'Student'}
                </p>
                {user?.name && (
                  <p className="text-xs text-teal-300 truncate max-w-[160px]">{user.email}</p>
                )}
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-700 hover:text-white transition-colors"
                aria-label="Logout"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-teal-200 hover:text-white p-1"
              onClick={() => setMobileMenuOpen((o) => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* ── Mobile dropdown menu ── */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-teal-900 border-t border-teal-700 px-4 py-3 space-y-1">
            {navItems.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={getLinkClass}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
            <div className="pt-3 border-t border-teal-700 mt-2">
              <p className="text-xs text-teal-400 mb-2 truncate">
                {user?.name || user?.email}
              </p>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm font-medium text-teal-100 hover:bg-teal-700 hover:text-white transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Page content ── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

export default StudentLayout;
