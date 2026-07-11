import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, Send, ClipboardList, ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  getExams,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
} from '../../services/examService';
import AssignQuestionsModal from './AssignQuestionsModal';

// ─── helpers ────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

const EMPTY_FORM = {
  title: '',
  description: '',
  durationMinutes: '',
  totalMarks: '',
  startTime: '',
  endTime: '',
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Title is required.';
  const dur = Number(form.durationMinutes);
  if (!form.durationMinutes || isNaN(dur) || dur < 1 || dur > 300)
    errors.durationMinutes = 'Duration must be between 1 and 300 minutes.';
  const marks = Number(form.totalMarks);
  if (!form.totalMarks || isNaN(marks) || marks < 1)
    errors.totalMarks = 'Total marks must be at least 1.';
  if (form.startTime && form.endTime && form.startTime >= form.endTime)
    errors.endTime = 'End time must be after start time.';
  return errors;
}

// ─── ExamFormModal ───────────────────────────────────────────────────────────

function ExamFormModal({ exam, onClose, onSaved }) {
  const isEdit = Boolean(exam?.id);
  const [form, setForm] = useState(
    exam
      ? {
          title: exam.title ?? '',
          description: exam.description ?? '',
          durationMinutes: exam.durationMinutes ?? '',
          totalMarks: exam.totalMarks ?? '',
          startTime: exam.startTime ? exam.startTime.slice(0, 16) : '',
          endTime: exam.endTime ? exam.endTime.slice(0, 16) : '',
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
        title: form.title.trim(),
        description: form.description.trim(),
        durationMinutes: Number(form.durationMinutes),
        totalMarks: Number(form.totalMarks),
        startTime: form.startTime || null,
        endTime: form.endTime || null,
      };
      if (isEdit) {
        await updateExam(exam.id, payload);
      } else {
        await createExam(payload);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">
            {isEdit ? 'Edit Exam' : 'Create Exam'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {apiError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{apiError}</p>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. Midterm Exam"
            />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Optional description"
            />
          </div>

          {/* Duration + Total Marks */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (mins) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="durationMinutes"
                value={form.durationMinutes}
                onChange={handleChange}
                min={1}
                max={300}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.durationMinutes && (
                <p className="text-xs text-red-500 mt-1">{errors.durationMinutes}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Marks <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalMarks"
                value={form.totalMarks}
                onChange={handleChange}
                min={1}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.totalMarks && (
                <p className="text-xs text-red-500 mt-1">{errors.totalMarks}</p>
              )}
            </div>
          </div>

          {/* Start + End time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {errors.endTime && (
                <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>
              )}
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

// ─── Status badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    DRAFT: 'bg-gray-100 text-gray-600',
    PUBLISHED: 'bg-green-100 text-green-700',
    CLOSED: 'bg-red-100 text-red-600',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${map[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

// ─── ExamManager ─────────────────────────────────────────────────────────────

function ExamManager() {
  const [exams, setExams] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [modalExam, setModalExam] = useState(undefined); // undefined = closed, null = create, obj = edit
  const [assignTarget, setAssignTarget] = useState(null); // { id, title }

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExams(page, 10);
      const data = res.data;
      // Spring Page response shape: { content: [], totalPages, ... }
      if (data?.content !== undefined) {
        setExams(data.content);
        setTotalPages(data.totalPages ?? 1);
      } else if (Array.isArray(data)) {
        setExams(data);
        setTotalPages(1);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  async function handleDelete(exam) {
    if (!window.confirm(`Delete exam "${exam.title}"? This cannot be undone.`)) return;
    try {
      await deleteExam(exam.id);
      fetchExams();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed.');
    }
  }

  async function handlePublish(exam) {
    if (!window.confirm(`Publish exam "${exam.title}"? Students will be able to see it.`)) return;
    try {
      await publishExam(exam.id);
      fetchExams();
    } catch (err) {
      alert(err?.response?.data?.message || 'Publish failed.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Exam Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage all exams</p>
        </div>
        <button
          onClick={() => setModalExam(null)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          New Exam
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg mb-4">{error}</p>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Duration', 'Total Marks', 'Status', 'Start Time', 'End Time', 'Actions'].map(
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
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-gray-400">
                    No exams found. Create one to get started.
                  </td>
                </tr>
              ) : (
                exams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-xs truncate">
                      {exam.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {exam.durationMinutes} min
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{exam.totalMarks}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={exam.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(exam.startTime)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      {formatDateTime(exam.endTime)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setModalExam(exam)}
                          title="Edit"
                          className="p-1.5 rounded-md text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(exam)}
                          title="Delete"
                          className="p-1.5 rounded-md text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                        {exam.status === 'DRAFT' && (
                          <>
                            <button
                              onClick={() => handlePublish(exam)}
                              title="Publish"
                              className="p-1.5 rounded-md text-gray-500 hover:bg-green-50 hover:text-green-600 transition-colors"
                            >
                              <Send size={15} />
                            </button>
                            <button
                              onClick={() => setAssignTarget({ id: exam.id, title: exam.title })}
                              title="Assign Questions"
                              className="p-1.5 rounded-md text-gray-500 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                            >
                              <ClipboardList size={15} />
                            </button>
                          </>
                        )}
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

      {/* Create / Edit modal */}
      {modalExam !== undefined && (
        <ExamFormModal
          exam={modalExam}
          onClose={() => setModalExam(undefined)}
          onSaved={() => {
            setModalExam(undefined);
            fetchExams();
          }}
        />
      )}

      {/* Assign Questions modal */}
      {assignTarget && (
        <AssignQuestionsModal
          examId={assignTarget.id}
          examTitle={assignTarget.title}
          onClose={() => setAssignTarget(null)}
          onSaved={() => {
            setAssignTarget(null);
            fetchExams();
          }}
        />
      )}
    </div>
  );
}

export default ExamManager;
