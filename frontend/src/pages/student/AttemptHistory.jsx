import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, AlertCircle, ExternalLink } from 'lucide-react';
import { getAttemptHistory } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/** Format an ISO datetime string */
function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Badge styles per attempt status */
function StatusBadge({ status }) {
  const styles = {
    SUBMITTED: 'bg-green-100 text-green-700',
    TIMED_OUT: 'bg-orange-100 text-orange-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
  };
  const labels = {
    SUBMITTED: 'Submitted',
    TIMED_OUT: 'Timed Out',
    IN_PROGRESS: 'In Progress',
  };
  const cls = styles[status] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {labels[status] ?? status}
    </span>
  );
}

function AttemptHistory() {
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchAttempts() {
      setIsLoading(true);
      setFetchError('');
      try {
        const res = await getAttemptHistory();
        if (!cancelled) setAttempts(res.data ?? []);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ||
            'Unable to load attempt history. Please try again later.';
          setFetchError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchAttempts();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) return <LoadingSpinner />;

  const canViewResult = (status) => status === 'SUBMITTED' || status === 'TIMED_OUT';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Attempts</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review your past exam attempts and results.
        </p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} />
          <span>{fetchError}</span>
        </div>
      )}

      {!fetchError && attempts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList size={48} className="text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">No Attempts Yet</h2>
          <p className="text-sm text-gray-400 mt-1">
            You haven't taken any exams yet. Head over to Available Exams to get started.
          </p>
          <button
            onClick={() => navigate('/student/exams')}
            className="mt-5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Browse Exams
          </button>
        </div>
      )}

      {attempts.length > 0 && (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Exam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attempts.map((attempt) => (
                  <tr key={attempt.attemptId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800">{attempt.examTitle}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {formatDateTime(attempt.submittedAt || attempt.startTime)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={attempt.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {canViewResult(attempt.status) && attempt.score != null
                        ? `${attempt.score} / ${attempt.totalMarks}`
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-700">
                      {canViewResult(attempt.status) ? (attempt.grade ?? '—') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {canViewResult(attempt.status) ? (
                        <button
                          onClick={() => navigate(`/student/result/${attempt.attemptId}`)}
                          className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium transition-colors"
                        >
                          View Result
                          <ExternalLink size={13} />
                        </button>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-4">
            {attempts.map((attempt) => (
              <div
                key={attempt.attemptId}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <p className="text-sm font-semibold text-gray-800">{attempt.examTitle}</p>
                  <StatusBadge status={attempt.status} />
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {formatDateTime(attempt.submittedAt || attempt.startTime)}
                </div>
                {canViewResult(attempt.status) && (
                  <div className="flex items-center justify-between mt-2">
                    <div className="text-sm text-gray-700">
                      {attempt.score != null
                        ? `${attempt.score} / ${attempt.totalMarks}`
                        : '—'}{' '}
                      {attempt.grade && (
                        <span className="font-semibold ml-1">({attempt.grade})</span>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/student/result/${attempt.attemptId}`)}
                      className="inline-flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-800 font-medium"
                    >
                      View Result
                      <ExternalLink size={13} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default AttemptHistory;
