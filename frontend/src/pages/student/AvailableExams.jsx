import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Award, Calendar, BookOpen, AlertCircle, X } from 'lucide-react';
import { getAvailableExams, startExam } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';

/** Format an ISO datetime string to a readable locale string */
function formatDateTime(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

// ---------------------------------------------------------------------------
// Confirmation modal shown before starting an exam
// ---------------------------------------------------------------------------
function StartExamModal({ exam, onCancel, onConfirm, isStarting, startError }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-1">Start Exam</h2>
        <p className="text-sm text-gray-500 mb-5">{exam.title}</p>

        {/* Exam summary */}
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <Clock size={15} />
            <span>
              Duration: <strong>{exam.durationMinutes} minutes</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <Award size={15} />
            <span>
              Total Marks: <strong>{exam.totalMarks}</strong>
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-teal-800">
            <Calendar size={15} />
            <span>
              Available until: <strong>{formatDateTime(exam.endTime)}</strong>
            </span>
          </div>
        </div>

        {/* Rules */}
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Exam Rules</h3>
          <ul className="text-sm text-gray-600 space-y-1.5 list-none">
            {[
              'Attempt all questions — partial answers are accepted.',
              'The timer starts immediately after you click "Start Exam".',
              'The exam will be auto-submitted when the timer reaches 0:00.',
              'Answers are saved automatically as you select them.',
              'Do not refresh or close the browser tab during the exam.',
              'You may navigate between questions freely using the sidebar.',
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-2">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center justify-center font-bold">
                  ✓
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>

        {startError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4">
            <AlertCircle size={15} />
            <span>{startError}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isStarting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isStarting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isStarting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Starting…
              </>
            ) : (
              'Start Exam'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single exam card
// ---------------------------------------------------------------------------
function ExamCard({ exam, onStartClick }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col gap-4 hover:shadow-md transition-shadow">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 leading-tight">{exam.title}</h3>
        {exam.description && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{exam.description}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-1.5 text-gray-600">
          <Clock size={14} className="text-teal-500 flex-shrink-0" />
          <span>{exam.durationMinutes} min</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600">
          <Award size={14} className="text-teal-500 flex-shrink-0" />
          <span>{exam.totalMarks} marks</span>
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 col-span-2">
          <Calendar size={14} className="text-teal-500 flex-shrink-0" />
          <span className="truncate">
            {formatDateTime(exam.startTime)} – {formatDateTime(exam.endTime)}
          </span>
        </div>
      </div>

      <button
        onClick={() => onStartClick(exam)}
        className="mt-auto w-full px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        Start Exam
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
function AvailableExams() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Modal state
  const [selectedExam, setSelectedExam] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [startError, setStartError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchExams() {
      setIsLoading(true);
      setFetchError('');
      try {
        const res = await getAvailableExams();
        if (!cancelled) setExams(res.data ?? []);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err.response?.data?.message ||
            'Unable to load available exams. Please try again later.';
          setFetchError(msg);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchExams();
    return () => {
      cancelled = true;
    };
  }, []);

  function handleStartClick(exam) {
    setSelectedExam(exam);
    setStartError('');
  }

  function handleModalCancel() {
    if (!isStarting) {
      setSelectedExam(null);
      setStartError('');
    }
  }

  async function handleConfirmStart() {
    if (!selectedExam) return;
    setIsStarting(true);
    setStartError('');
    try {
      const res = await startExam(selectedExam.id);
      const attemptData = res.data;
      navigate(`/student/exam/${attemptData.attemptId}`, { state: { attempt: attemptData } });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'This exam is not available right now. Please try again.';
      setStartError(msg);
    } finally {
      setIsStarting(false);
    }
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Available Exams</h1>
        <p className="text-sm text-gray-500 mt-1">
          Select an exam below to begin. Make sure you are ready before starting.
        </p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6">
          <AlertCircle size={16} />
          <span>{fetchError}</span>
        </div>
      )}

      {!fetchError && exams.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen size={48} className="text-gray-300 mb-4" />
          <h2 className="text-lg font-semibold text-gray-500">No Exams Available</h2>
          <p className="text-sm text-gray-400 mt-1">
            There are no published exams in the active window right now.
          </p>
        </div>
      )}

      {exams.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {exams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} onStartClick={handleStartClick} />
          ))}
        </div>
      )}

      {selectedExam && (
        <StartExamModal
          exam={selectedExam}
          onCancel={handleModalCancel}
          onConfirm={handleConfirmStart}
          isStarting={isStarting}
          startError={startError}
        />
      )}
    </div>
  );
}

export default AvailableExams;
