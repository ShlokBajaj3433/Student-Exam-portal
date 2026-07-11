import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, AlertCircle, BookOpen, ClipboardList } from 'lucide-react';
import { getResult } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/** Format an ISO datetime string */
function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'long',
    timeStyle: 'short',
  });
}

function Result() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => {
    if (!attemptId) {
      setFetchError('Invalid result URL.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    async function fetchResult() {
      setIsLoading(true);
      setFetchError('');
      try {
        const res = await getResult(attemptId);
        if (!cancelled) setResult(res.data);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ||
            'Unable to load result. Please try again later.';
          setFetchError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchResult();
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (isLoading) return <LoadingSpinner />;

  if (fetchError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-lg font-semibold text-gray-700">{fetchError}</h2>
        <button
          onClick={() => navigate('/student/exams')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (!result) return null;

  const passed = result.passed;
  const theme = passed
    ? {
        outer: 'from-green-50 to-emerald-100',
        card: 'border-green-200',
        badge: 'bg-green-100 text-green-700 border-green-300',
        grade: 'text-green-600',
        percent: 'text-green-700',
        icon: <CheckCircle size={40} className="text-green-500" />,
        label: 'PASSED',
        labelBg: 'bg-green-500',
      }
    : {
        outer: 'from-red-50 to-orange-100',
        card: 'border-red-200',
        badge: 'bg-red-100 text-red-700 border-red-300',
        grade: 'text-red-500',
        percent: 'text-red-600',
        icon: <XCircle size={40} className="text-red-400" />,
        label: 'FAILED',
        labelBg: 'bg-red-500',
      };

  const percentage = result.percentage != null ? result.percentage.toFixed(2) : '—';
  const score = result.score != null ? result.score : '—';

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.outer} flex items-center justify-center p-4`}>
      <div className={`bg-white rounded-2xl shadow-lg border ${theme.card} max-w-md w-full overflow-hidden`}>

        {/* Pass/Fail banner */}
        <div className={`${theme.labelBg} px-6 py-5 flex flex-col items-center text-white`}>
          {theme.icon}
          <span className="mt-2 text-3xl font-extrabold tracking-widest">{theme.label}</span>
          <p className="text-sm opacity-90 mt-1 font-medium">{result.examTitle}</p>
        </div>

        {/* Score details */}
        <div className="px-6 py-6 space-y-5">
          {/* Grade */}
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Grade
            </span>
            <span className={`text-7xl font-extrabold ${theme.grade}`}>
              {result.grade ?? '—'}
            </span>
          </div>

          {/* Score & Percentage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Score
              </p>
              <p className="text-2xl font-bold text-gray-800">
                {score}
                <span className="text-base font-medium text-gray-400">
                  {' '}/ {result.totalMarks}
                </span>
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                Percentage
              </p>
              <p className={`text-2xl font-bold ${theme.percent}`}>{percentage}%</p>
            </div>
          </div>

          {/* Submission time */}
          {result.submittedAt && (
            <div className="text-center text-sm text-gray-400">
              Submitted on {formatDateTime(result.submittedAt)}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => navigate('/student/exams')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <BookOpen size={15} />
              Back to Exams
            </button>
            <button
              onClick={() => navigate('/student/attempts')}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors"
            >
              <ClipboardList size={15} />
              View History
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Result;
