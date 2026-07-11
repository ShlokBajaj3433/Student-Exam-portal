import { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getResults } from '../../services/adminService';

function GradeBadge({ grade }) {
  const map = {
    A: 'bg-green-100 text-green-700',
    B: 'bg-emerald-100 text-emerald-700',
    C: 'bg-yellow-100 text-yellow-700',
    D: 'bg-orange-100 text-orange-700',
    F: 'bg-red-100 text-red-700',
  };
  if (!grade) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${map[grade] || 'bg-gray-100 text-gray-600'}`}>
      {grade}
    </span>
  );
}

function StatusBadge({ passed }) {
  if (passed === null || passed === undefined)
    return <span className="text-gray-400 text-xs">—</span>;
  return passed ? (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
      PASS
    </span>
  ) : (
    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
      FAIL
    </span>
  );
}

function ResultsViewer() {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getResults(page, 10);
      const data = res.data;
      if (data?.content !== undefined) {
        setResults(data.content);
        setTotalPages(data.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        setResults(data);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load results.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">Exam Results</h1>
        <p className="text-sm text-gray-500 mt-0.5">All student exam attempt results</p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Student', 'Exam', 'Score', 'Percentage', 'Grade', 'Status'].map((h) => (
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
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-400">
                    No results found.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {r.studentName || r.student?.name || r.student?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                      {r.examTitle || r.exam?.title || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                      {r.score ?? '—'} / {r.totalMarks ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {r.percentage != null ? `${Number(r.percentage).toFixed(1)}%` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <GradeBadge grade={r.grade} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge passed={r.passed} />
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

export default ResultsViewer;
