import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  HelpCircle,
  Users,
  BarChart2,
  LineChart,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/exams', label: 'Exams', icon: FileText },
  { to: '/admin/questions', label: 'Question Bank', icon: HelpCircle },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/results', label: 'Results', icon: BarChart2 },
  { to: '/admin/analytics', label: 'Analytics', icon: LineChart },
];

function AdminLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLinkClass =
    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium bg-indigo-700 text-white';
  const inactiveLinkClass =
    'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors';

  const getLinkClass = ({ isActive }) =>
    isActive ? activeLinkClass : inactiveLinkClass;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-6 py-5 border-b border-indigo-700">
        <h1 className="text-lg font-bold text-white tracking-tight">ExamPortal</h1>
        <p className="text-xs text-indigo-300 mt-0.5">Admin Console</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={getLinkClass}
            onClick={() => setSidebarOpen(false)}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User info + Logout */}
      <div className="px-4 py-4 border-t border-indigo-700">
        <p className="text-xs text-indigo-300 truncate mb-3">{user?.email}</p>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-4 py-2 rounded-lg text-sm font-medium text-indigo-100 hover:bg-indigo-700 hover:text-white transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-indigo-800">
        <SidebarContent />
      </aside>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative flex flex-col w-64 bg-indigo-800 z-50">
            <button
              className="absolute top-4 right-4 text-indigo-200 hover:text-white"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top header */}
        <header className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>
            <span className="text-sm font-medium text-gray-500 hidden sm:block">
              Welcome back,
            </span>
            <span className="text-sm font-semibold text-gray-800">
              {user?.name || user?.email || 'Admin'}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
