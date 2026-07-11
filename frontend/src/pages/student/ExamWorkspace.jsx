import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, ChevronLeft, ChevronRight, Send, X } from 'lucide-react';
import { saveAnswer, submitExam } from '../../services/studentService';
import useCountdown from '../../hooks/useCountdown';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Zero-pad a number to 2 digits */
const pad = (n) => String(n).padStart(2, '0');

// ---------------------------------------------------------------------------
// Timer display
// ---------------------------------------------------------------------------
function Timer({ minutes, seconds, isExpired }) {
  const totalSecs = minutes * 60 + seconds;

  let colorClass = 'text-gray-800 bg-gray-100';
  if (isExpired || totalSecs === 0) {
    colorClass = 'text-white bg-red-600';
  } else if (totalSecs <= 60) {
    colorClass = 'text-white bg-red-500 animate-pulse';
  } else if (totalSecs <= 300) {
    colorClass = 'text-amber-800 bg-amber-100';
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xl font-bold ${colorClass} transition-colors`}
      aria-live="polite"
      aria-label={`Time remaining: ${pad(minutes)} minutes ${pad(seconds)} seconds`}
    >
      {pad(minutes)}:{pad(seconds)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submit confirmation modal
// ---------------------------------------------------------------------------
function SubmitModal({ totalQuestions, answeredCount, onCancel, onConfirm, isSubmitting }) {
  const unanswered = totalQuestions - answeredCount;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={!isSubmitting ? onCancel : undefined} />
      <div className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 z-10">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Submit Exam?</h2>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Total questions</span>
            <span className="font-semibold text-gray-800">{totalQuestions}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Answered</span>
            <span className="font-semibold text-green-600">{answeredCount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Unanswered</span>
            <span className={`font-semibold ${unanswered > 0 ? 'text-red-500' : 'text-gray-800'}`}>
              {unanswered}
            </span>
          </div>
        </div>

        {unanswered > 0 && (
          <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span>
              You have {unanswered} unanswered question{unanswered !== 1 ? 's' : ''}. Unanswered
              questions will receive no marks.
            </span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Submitting…
              </>
            ) : (
              'Confirm Submit'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main ExamWorkspace component
// ---------------------------------------------------------------------------
function ExamWorkspace() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Attempt data from router state (set by AvailableExams on startExam)
  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadError, setLoadError] = useState('');

  // Interaction state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});      // { [questionId]: 'A'|'B'|'C'|'D' }
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoSubmitting, setIsAutoSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Track if auto-submit has been triggered to prevent double-fire
  const autoSubmitTriggeredRef = useRef(false);

  // ── Load attempt data from router state ─────────────────────────────────
  useEffect(() => {
    const stateAttempt = location.state?.attempt;
    if (stateAttempt) {
      setAttempt(stateAttempt);
      // Questions are already shuffled by the backend; use as-is
      setQuestions(stateAttempt.questions ?? []);
    } else {
      // Navigated directly (e.g., page refresh) — we can't re-fetch without
      // the POST /startExam body, so redirect back to exams.
      setLoadError('Exam session not found. Please start the exam again.');
    }
  }, [location.state]);

  // ── Timer expire handler ────────────────────────────────────────────────
  const handleExpire = useCallback(async () => {
    if (autoSubmitTriggeredRef.current) return;
    autoSubmitTriggeredRef.current = true;
    setIsAutoSubmitting(true);

    try {
      await submitExam(Number(attemptId));
    } catch (err) {
      console.error('Auto-submit failed:', err);
    } finally {
      navigate(`/student/result/${attemptId}`, { replace: true });
    }
  }, [attemptId, navigate]);

  const { minutes, seconds, isExpired } = useCountdown(
    attempt?.durationMinutes ?? 0,
    handleExpire
  );

  // ── Answer selection ─────────────────────────────────────────────────────
  function handleSelectOption(questionId, option) {
    if (isAutoSubmitting || isSubmitting || isExpired) return;

    // 1. Update local state immediately
    setAnswers((prev) => ({ ...prev, [questionId]: option }));

    // 2. Fire-and-forget PATCH /api/student/answer
    saveAnswer(Number(attemptId), questionId, option).catch((err) => {
      console.error('Failed to save answer:', err);
    });
  }

  // ── Manual submit ────────────────────────────────────────────────────────
  async function handleConfirmSubmit() {
    if (isSubmitting || isAutoSubmitting) return;
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await submitExam(Number(attemptId));
      navigate(`/student/result/${attemptId}`, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit exam. Please try again.';
      setSubmitError(msg);
      setIsSubmitting(false);
    }
  }

  // ── Guards ───────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <h2 className="text-lg font-semibold text-gray-700">{loadError}</h2>
        <button
          onClick={() => navigate('/student/exams')}
          className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin" />
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  const OPTIONS = ['A', 'B', 'C', 'D'];
  const optionText = (q, opt) => {
    const map = { A: q.optionA, B: q.optionB, C: q.optionC, D: q.optionD };
    return map[opt] ?? '';
  };

  const inputsDisabled = isAutoSubmitting || isSubmitting || isExpired;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-bold text-gray-800 truncate">
              {attempt.examTitle}
            </h1>
            <p className="text-xs text-gray-500">
              {answeredCount} / {totalQuestions} answered
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Timer minutes={minutes} seconds={seconds} isExpired={isExpired} />
            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={inputsDisabled}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              <Send size={15} />
              <span className="hidden sm:inline">Submit Exam</span>
            </button>
          </div>
        </div>
      </header>

      {isAutoSubmitting && (
        <div className="bg-red-600 text-white text-sm text-center py-2 font-medium">
          Time's up! Auto-submitting your exam…
        </div>
      )}

      {submitError && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-2 text-sm text-red-600 text-center">
          {submitError}
        </div>
      )}

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 max-w-7xl mx-auto w-full px-2 sm:px-4 lg:px-6 py-4 gap-4 overflow-hidden">

        {/* Left sidebar — question grid */}
        <aside className="hidden md:flex flex-col w-48 lg:w-56 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Questions
            </p>
            <div className="grid grid-cols-4 lg:grid-cols-5 gap-1.5">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;

                let btnClass =
                  'h-8 w-full rounded-lg text-xs font-semibold transition-colors ';
                if (isCurrent) {
                  btnClass += isAnswered
                    ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1'
                    : 'bg-gray-200 text-gray-800 ring-2 ring-gray-400 ring-offset-1';
                } else if (isAnswered) {
                  btnClass += 'bg-teal-500 text-white hover:bg-teal-600';
                } else {
                  btnClass += 'bg-gray-100 text-gray-600 hover:bg-gray-200';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={btnClass}
                    aria-label={`Question ${idx + 1}${isAnswered ? ' (answered)' : ''}`}
                    title={`Question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 space-y-1.5 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-teal-500 flex-shrink-0" />
                Answered
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-gray-200 flex-shrink-0" />
                Unanswered
              </div>
            </div>
          </div>
        </aside>

        {/* Center — question panel */}
        <section className="flex-1 flex flex-col gap-4 min-w-0">
          {/* Mobile question grid (scrollable row) */}
          <div className="md:hidden bg-white rounded-xl shadow-sm border border-gray-200 p-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = idx === currentIndex;
                let btnClass =
                  'flex-shrink-0 h-8 w-8 rounded-lg text-xs font-semibold transition-colors ';
                if (isCurrent) {
                  btnClass += isAnswered
                    ? 'bg-teal-600 text-white ring-2 ring-teal-400 ring-offset-1'
                    : 'bg-gray-200 text-gray-800 ring-2 ring-gray-400 ring-offset-1';
                } else if (isAnswered) {
                  btnClass += 'bg-teal-500 text-white';
                } else {
                  btnClass += 'bg-gray-100 text-gray-600';
                }
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={btnClass}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question card */}
          {currentQuestion && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 flex flex-col">
              {/* Question header */}
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-teal-600 uppercase tracking-wide">
                    Question {currentIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                    {currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Question body */}
              <div className="px-6 py-5 flex-1 flex flex-col gap-5">
                <p className="text-base sm:text-lg font-medium text-gray-800 leading-relaxed">
                  {currentQuestion.questionText}
                </p>

                {/* Options */}
                <div className="space-y-3">
                  {OPTIONS.map((opt) => {
                    const text = optionText(currentQuestion, opt);
                    const isSelected = currentAnswer === opt;
                    const cardClass = `flex items-center gap-4 w-full text-left px-4 py-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-teal-500 bg-teal-50 text-teal-800'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300 hover:bg-teal-50/40'
                    } ${inputsDisabled ? 'opacity-60 cursor-not-allowed' : ''}`;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(currentQuestion.id, opt)}
                        disabled={inputsDisabled}
                        className={cardClass}
                        aria-pressed={isSelected}
                      >
                        <span
                          className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                            isSelected
                              ? 'border-teal-500 bg-teal-500 text-white'
                              : 'border-gray-300 bg-white text-gray-500'
                          }`}
                        >
                          {opt}
                        </span>
                        <span className="text-sm sm:text-base font-medium leading-snug">
                          {text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation footer */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                  disabled={currentIndex === 0 || inputsDisabled}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <span className="text-xs text-gray-400">
                  {currentIndex + 1} / {totalQuestions}
                </span>

                <button
                  onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}
                  disabled={currentIndex === totalQuestions - 1 || inputsDisabled}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Submit modal */}
      {showSubmitModal && (
        <SubmitModal
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          onCancel={() => !isSubmitting && setShowSubmitModal(false)}
          onConfirm={handleConfirmSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

export default ExamWorkspace;
