import { useNavigate } from 'react-router-dom';
import { FileText, HelpCircle, Users, BarChart2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const quickLinks = [
  {
    title: 'Manage Exams',
    description: 'Create, edit, publish, and delete exams.',
    icon: FileText,
    color: 'bg-indigo-50 text-indigo-600',
    border: 'border-indigo-100',
    to: '/admin/exams',
  },
  {
    title: 'Question Bank',
    description: 'Add and manage questions for your exams.',
    icon: HelpCircle,
    color: 'bg-emerald-50 text-emerald-600',
    border: 'border-emerald-100',
    to: '/admin/questions',
  },
  {
    title: 'User Management',
    description: 'View and manage registered students.',
    icon: Users,
    color: 'bg-amber-50 text-amber-600',
    border: 'border-amber-100',
    to: '/admin/users',
  },
  {
    title: 'Results',
    description: 'Review all exam attempts and scores.',
    icon: BarChart2,
    color: 'bg-rose-50 text-rose-600',
    border: 'border-rose-100',
    to: '/admin/results',
  },
];

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Welcome card */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-2xl p-6 sm:p-8 text-white mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-1">
          Hello, {user?.name || 'Admin'} 👋
        </h2>
        <p className="text-indigo-200 text-sm sm:text-base">
          Manage your examination portal from this dashboard.
        </p>
      </div>

      {/* Quick stats / navigation cards */}
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(({ title, description, icon: Icon, color, border, to }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className={`text-left bg-white rounded-xl border ${border} p-5 shadow-sm hover:shadow-md transition-shadow group`}
          >
            <div className={`inline-flex p-2.5 rounded-lg ${color} mb-3`}>
              <Icon size={22} />
            </div>
            <h4 className="font-semibold text-gray-800 text-sm group-hover:text-indigo-600 transition-colors">
              {title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;
