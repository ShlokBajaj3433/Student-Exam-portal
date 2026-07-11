import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  getQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from '../../services/questionService';

// ─── constants ───────────────────────────────────────────────────────────────

const CORRECT_ANSWER_OPTIONS = ['A', 'B', 'C', 'D'];
const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'];

const EMPTY_FORM = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: 'A',
  marks: '',
  difficultyLevel: '',
};

// ─── validation ──────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.questionText.trim()) errors.questionText = 'Question text is required.';
  if (!form.optionA.trim()) errors.optionA = 'Option A is required.';
  if (!form.optionB.trim()) errors.optionB = 'Option B is required.';
  if (!form.optionC.trim()) errors.optionC = 'Option C is required.';
  if (!form.optionD.trim()) errors.optionD = 'Option D is required.';
  if (!form.correctAnswer) errors.correctAnswer = 'Correct answer is required.';
  const marks = Number(form.marks);
  if (!form.marks || isNaN(marks) || marks < 1) errors.marks = 'Marks must be at least 1.';
  return errors;
}

// ─── QuestionFormModal ────────────────────────────────────────────────────────

function QuestionFormModal({ question, onClose, onSaved }) {
  const isEdit = Boolean(question?.id);
  const [form, setForm] = useState(
    question
      ? {
          questionText: question.questionText ?? '',
          optionA: question.optionA ?? '',
          optionB: question.optionB ?? '',
          optionC: question.optionC ?? '',
          optionD: question.optionD ?? '',
          correctAnswer: question.correctAnswer ?? 'A',
          marks: question.marks ?? '',
          difficultyLevel: question.difficultyLevel ?? '',
        }
      : EMPTY_FORM
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        questionText: form.questionText.trim(),
        optionA: form.optionA.trim(),
        optionB: form.optionB.trim(),
        optionC: form.optionC.trim(),
        optionD: form.optionD.trim(),
        correctAnswer: form.correctAnswer,
        marks: Number(form.marks),
        difficultyLevel: form.difficultyLevel || null,
      };
      if (isEdit) {
        await updateQuestion(question.id, payload);
      } else {
        await createQuestion(payload);
      }
      onSaved();
    } catch (err) {
      setApiError(
        err?.response?.data?.message || 'An error occurred. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const Field = ({ label, name, required, ...props }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        name={name}
        value={form[name]}
        onChange={handleChange}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        {...props}
      />
      {errors[name] && <p className="text-xs text-red-500 mt-1">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Question' : 'Create Question'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {apiError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{apiError}</p>
          )}

          {/* Question text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question Text <span className="text-red-500">*</span>
            </label>
            <textarea
              name="questionText"
              value={form.questionText}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Enter the question…"
            />
            {errors.questionText && (
              <p className="text-xs text-red-500 mt-1">{errors.questionText}</p>
            )}
          </div>

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Option A" name="optionA" required placeholder="Option A" />
            <Field label="Option B" name="optionB" required placeholder="Option B" />
            <Field label="Option C" name="optionC" required placeholder="Option C" />
            <Field label="Option D" name="optionD" required placeholder="Option D" />
          </div>

          {/* Correct answer + Marks + Difficulty */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correct Answer <span className="text-red-500">*</span>
              </label>
              <select
                name="correctAnswer"
                value={form.correctAnswer}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CORRECT_ANSWER_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              {errors.correctAnswer && (
                <p className="text-xs text-red-500 mt-1">{errors.correctAnswer}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="marks"
                value={form.marks}
                onChange={handleChange}
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.marks && <p className="text-xs text-red-500 mt-1">{errors.marks}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
              <select
                name="difficultyLevel"
                value={form.difficultyLevel}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select…</option>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── DifficultyBadge ─────────────────────────────────────────────────────────

function DifficultyBadge({ level }) {
  const map = {
    EASY: 'bg-green-100 text-green-700',
    MEDIUM: 'bg-amber-100 text-amber-700',
    HARD: 'bg-red-100 text-red-700',
  };
  if (!level) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[level] || 'bg-gray-100 text-gray-600'}`}>
      {level}
    </span>
  );
}

// ─── QuestionBank ─────────────────────────────────────────────────────────────

function QuestionBank() {
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalQuestion, setModalQuestion] = useState(undefined); // undefined=closed, null=create, obj=edit

  const fetchQuestions = useCallback(async () => {
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
  }, [page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  async function handleDelete(q) {
    if (!window.confirm(`Delete question? This cannot be undone.`)) return;
    try {
      await deleteQuestion(q.id);
      fetchQuestions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your question library</p>
        </div>
        <button
          onClick={() => setModalQuestion(null)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Question
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Question', 'Option A', 'Option B', 'Option C', 'Option D', 'Answer', 'Marks', 'Difficulty', 'Actions'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-sm text-gray-400">
                    No questions found. Create one to get started.
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800 max-w-xs">
                      <span className="line-clamp-2">{q.questionText}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px]">
                      <span className="line-clamp-1">{q.optionA}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px]">
                      <span className="line-clamp-1">{q.optionB}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px]">
                      <span className="line-clamp-1">{q.optionC}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[120px]">
                      <span className="line-clamp-1">{q.optionD}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                        {q.correctAnswer}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{q.marks}</td>
                    <td className="px-4 py-3">
                      <DifficultyBadge level={q.difficultyLevel} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalQuestion(q)}
                          title="Edit"
                          className="p-1.5 rounded-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(q)}
                          title="Delete"
                          className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
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
            <p className="text-sm text-gray-500">
              Page {page + 1} of {totalPages}
            </p>
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

      {/* Modal */}
      {modalQuestion !== undefined && (
        <QuestionFormModal
          question={modalQuestion}
          onClose={() => setModalQuestion(undefined)}
          onSaved={() => {
            setModalQuestion(undefined);
            fetchQuestions();
          }}
        />
      )}
    </div>
  );
}

export default QuestionBank;
