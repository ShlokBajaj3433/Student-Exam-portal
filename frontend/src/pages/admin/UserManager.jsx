import { useState, useEffect, useCallback } from 'react';
import { Trash2, ChevronLeft, ChevronRight, ShieldCheck, UserCircle } from 'lucide-react';
import { getUsers, deleteUser } from '../../services/adminService';

function RoleBadge({ role }) {
  const map = {
    ADMIN: 'bg-indigo-100 text-indigo-700',
    STUDENT: 'bg-sky-100 text-sky-700',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${map[role] || 'bg-gray-100 text-gray-600'}`}>
      {role === 'ADMIN' ? <ShieldCheck size={11} /> : <UserCircle size={11} />}
      {role}
    </span>
  );
}

function UserManager() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getUsers(page, 10);
      const data = res.data;
      if (data?.content !== undefined) {
        setUsers(data.content);
        setTotalPages(data.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        setUsers(data);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function handleDelete(user) {
    if (!window.confirm(`Delete user "${user.name || user.email}"? This cannot be undone.`)) return;
    try {
      await deleteUser(user.id);
      fetchUsers();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed.');
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">View and manage registered users</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Name', 'Email', 'Role', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-gray-400">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {u.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(u)}
                        title="Delete user"
                        className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserManager;
