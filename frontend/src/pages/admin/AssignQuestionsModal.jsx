import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getQuestions } from '../../services/questionService';
import { assignQuestions } from '../../services/examService';

function AssignQuestionsModal({ examId, examTitle, onClose, onSaved }) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      setError('');
      try {
        const res = await getQuestions(page, 10);
        const data = res.data;
        if (data?.content !== undefined) {
          setQuestions(data.content);
          setTotalPages(data.totalPages ?? 1);
        } else if (Array.isArray(data)) {
          setQuestions(data);
          setTotalPages(1);
        }
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load questions.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuestions();
  }, [page]);

  function toggleQuestion(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleSubmit() {
    if (selected.size === 0) {
      setError('Please select at least one question.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await assignQuestions(examId, Array.from(selected));
      onSaved();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to assign questions.');
    } finally {
      setSubmitting(false);
    }
  }

  const difficultyColor = {
    EASY: 'text-green-600',
    MEDIUM: 'text-amber-600',
    HARD: 'text-red-600',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Assign Questions</h2>
            <p className="text-xs text-gray-500 mt-0.5">Exam: {examTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* Selected count */}
        <div className="px-6 py-2 bg-indigo-50 border-b text-sm text-indigo-700 font-medium flex-shrink-0">
          {selected.size} question{selected.size !== 1 ? 's' : ''} selected
        </div>

        {/* Error */}
        {error && (
          <p className="mx-6 mt-3 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex-shrink-0">
            {error}
          </p>
        )}

        {/* Questions list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading questions…</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No questions available.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q) => (
                <label
                  key={q.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selected.has(q.id)
                      ? 'border-indigo-400 bg-indigo-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.has(q.id)}
                    onChange={() => toggleQuestion(q.id)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">{q.questionText}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      {q.difficultyLevel && (
                        <span className={`text-xs font-medium ${difficultyColor[q.difficultyLevel] || 'text-gray-500'}`}>
                          {q.difficultyLevel}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-2 border-t flex-shrink-0">
            <p className="text-xs text-gray-500">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1.5 rounded border border-gray-300 disabled:opacity-40 hover:bg-gray-50"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selected.size === 0}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? 'Assigning…' : `Assign ${selected.size > 0 ? `(${selected.size})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignQuestionsModal;
