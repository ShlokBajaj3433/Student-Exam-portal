import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Send, ChevronLeft, ChevronRight,
  X, Clock, HelpCircle, BookOpen, Calendar,
  CheckCircle2, AlertCircle, Search, Filter,
} from 'lucide-react';
import {
  getExams, createExam, updateExam, deleteExam, publishExam, assignQuestions,
} from '../../services/examService';
import { getQuestions } from '../../services/questionService';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium', timeStyle: 'short',
  });
}

function toLocalInput(iso) {
  if (!iso) return '';
  // "2025-08-01T09:00:00" → "2025-08-01T09:00"
  return iso.slice(0, 16);
}

const DIFFICULTY_COLORS = {
  EASY: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
  HARD: 'text-red-600 bg-red-50 border-red-200',
};

const TYPE_COLORS = {
  MCQ: 'text-indigo-600 bg-indigo-50',
  MULTIPLE_CHOICE: 'text-violet-600 bg-violet-50',
  SHORT_ANSWER: 'text-teal-600 bg-teal-50',
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form) {
  const e = {};
  if (!form.title.trim()) e.title = 'Title is required.';
  const dur = Number(form.durationMinutes);
  if (!form.durationMinutes || isNaN(dur) || dur < 1 || dur > 300)
    e.durationMinutes = 'Duration must be 1–300 minutes.';
  if (form.startTime && form.endTime && form.startTime >= form.endTime)
    e.endTime = 'End time must be after start time.';
  return e;
}

// ─── QuestionPicker (inline in the exam form) ─────────────────────────────────

function QuestionPicker({ selected, onChange }) {
  const [questions, setQuestions]   = useState([]);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [search, setSearch]         = useState('');
  const [diffFilter, setDiffFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    getQuestions(page, 8)
      .then(res => {
        const d = res.data;
        if (d?.content !== undefined) {
          setQuestions(d.content);
          setTotalPages(d.totalPages ?? 1);
        } else if (Array.isArray(d)) {
          setQuestions(d);
          setTotalPages(1);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const filtered = questions.filter(q => {
    const matchSearch = !search ||
      q.questionText.toLowerCase().includes(search.toLowerCase());
    const matchDiff = !diffFilter || q.difficulty === diffFilter;
    return matchSearch && matchDiff;
  });

  function toggle(q) {
    const id = q.questionId;
    if (selected.has(id)) {
      const next = new Map(selected);
      next.delete(id);
      onChange(next);
    } else {
      const next = new Map(selected);
      next.set(id, q);
      onChange(next);
    }
  }

  const totalMarks = Array.from(selected.values()).reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div className="space-y-3">
      {/* Summary bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-indigo-50 border border-indigo-200 rounded-xl">
        <span className="text-sm font-medium text-indigo-700">
          {selected.size} question{selected.size !== 1 ? 's' : ''} selected
        </span>
        <span className="text-sm font-bold text-indigo-800">
          Total: {totalMarks} mark{totalMarks !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Search + filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        {['EASY','MEDIUM','HARD'].map(d => (
          <button key={d} type="button"
            onClick={() => setDiffFilter(p => p === d ? '' : d)}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all
              ${diffFilter === d ? DIFFICULTY_COLORS[d] : 'border-gray-200 text-gray-500 bg-white'}`}
          >{d.charAt(0) + d.slice(1).toLowerCase()}</button>
        ))}
      </div>

      {/* List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="py-8 text-center text-sm text-gray-400">Loading questions…</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">No questions found.</div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
            {filtered.map(q => {
              const isSelected = selected.has(q.questionId);
              return (
                <label key={q.questionId}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors
                    ${isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
                >
                  <input type="checkbox" checked={isSelected} onChange={() => toggle(q)}
                    className="mt-0.5 accent-indigo-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 line-clamp-2">{q.questionText}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {q.questionType && (
                        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${TYPE_COLORS[q.questionType] || 'bg-gray-100 text-gray-500'}`}>
                          {q.questionType === 'MULTIPLE_CHOICE' ? 'Multi' : q.questionType === 'SHORT_ANSWER' ? 'Short' : 'MCQ'}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                      {q.difficulty && (
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full border text-[10px] ${DIFFICULTY_COLORS[q.difficulty] || ''}`}>
                          {q.difficulty.charAt(0) + q.difficulty.slice(1).toLowerCase()}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <CheckCircle2 size={16} className="text-indigo-500 flex-shrink-0 mt-0.5" />}
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>Page {page + 1} of {totalPages}</span>
          <div className="flex gap-1">
            <button type="button" onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              <ChevronLeft size={13}/>
            </button>
            <button type="button" onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
              className="p-1.5 border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50">
              <ChevronRight size={13}/>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ExamFormModal ────────────────────────────────────────────────────────────

function ExamFormModal({ exam, onClose, onSaved }) {
  const isEdit = Boolean(exam?.examId);

  const [form, setForm] = useState({
    title:           exam?.title           ?? '',
    description:     exam?.description     ?? '',
    durationMinutes: exam?.durationMinutes ?? '',
    startTime:       toLocalInput(exam?.startTime),
    endTime:         toLocalInput(exam?.endTime),
  });

  // selectedQuestions: Map<questionId, question>
  const [selectedQuestions, setSelectedQuestions] = useState(() => {
    if (exam?.assignedQuestions) {
      return new Map(exam.assignedQuestions.map(q => [q.questionId, q]));
    }
    return new Map();
  });

  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep]         = useState('details'); // 'details' | 'questions'

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); setStep('details'); return; }
    if (selectedQuestions.size === 0) {
      setApiError('Please select at least one question before saving.');
      setStep('questions');
      return;
    }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        durationMinutes: Number(form.durationMinutes),
        startTime: form.startTime || null,
        endTime: form.endTime || null,
      };
      let savedExam;
      if (isEdit) {
        savedExam = await updateExam(exam.examId, payload);
      } else {
        savedExam = await createExam(payload);
      }
      const examId = savedExam.data?.examId ?? savedExam.data?.id;
      // Assign selected questions
      await assignQuestions(examId, Array.from(selectedQuestions.keys()));
      onSaved();
    } catch (err) {
      setApiError(err?.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const computedMarks = Array.from(selectedQuestions.values()).reduce((s, q) => s + (q.marks || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{isEdit ? 'Edit Exam' : 'Create Exam'}</h2>
            <div className="flex items-center gap-4 mt-1">
              <button type="button" onClick={() => setStep('details')}
                className={`text-xs font-medium pb-0.5 transition-colors ${step === 'details' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}>
                1. Details
              </button>
              <button type="button" onClick={() => { const e = validate(form); if (!Object.keys(e).length) setStep('questions'); else setErrors(e); }}
                className={`text-xs font-medium pb-0.5 transition-colors ${step === 'questions' ? 'text-indigo-600 border-b-2 border-indigo-500' : 'text-gray-400 hover:text-gray-600'}`}>
                2. Questions {selectedQuestions.size > 0 && <span className="ml-1 text-indigo-500">({selectedQuestions.size})</span>}
              </button>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5">
          {apiError && (
            <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-4">
              <AlertCircle size={15} className="mt-0.5 flex-shrink-0"/>{apiError}
            </div>
          )}

          {step === 'details' && (
            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input type="text" name="title" value={form.title} onChange={handleChange}
                  placeholder="e.g. Midterm Exam — Java Fundamentals"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                    ${errors.title ? 'border-red-400' : 'border-gray-300'}`} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={2}
                  placeholder="Optional instructions or description for students"
                  className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (minutes) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                  <input type="number" name="durationMinutes" value={form.durationMinutes} onChange={handleChange}
                    min={1} max={300} placeholder="e.g. 60"
                    className={`w-full pl-9 border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${errors.durationMinutes ? 'border-red-400' : 'border-gray-300'}`} />
                </div>
                {errors.durationMinutes && <p className="text-xs text-red-500 mt-1">{errors.durationMinutes}</p>}
              </div>

              {/* Time window */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input type="datetime-local" name="startTime" value={form.startTime} onChange={handleChange}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input type="datetime-local" name="endTime" value={form.endTime} onChange={handleChange}
                    className={`w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${errors.endTime ? 'border-red-400' : 'border-gray-300'}`} />
                  {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                </div>
              </div>

              {/* Total marks preview (computed) */}
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600">
                <BookOpen size={15} className="text-gray-400"/>
                <span>Total marks are computed from selected questions.</span>
                {computedMarks > 0 && (
                  <span className="ml-auto font-semibold text-indigo-700">{computedMarks} marks ({selectedQuestions.size} questions)</span>
                )}
              </div>
            </div>
          )}

          {step === 'questions' && (
            <QuestionPicker selected={selectedQuestions} onChange={setSelectedQuestions} />
          )}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t flex-shrink-0 bg-gray-50 rounded-b-2xl">
          <div className="text-sm text-gray-500">
            {step === 'questions' && computedMarks > 0 && (
              <span className="font-medium text-indigo-700">{selectedQuestions.size} questions · {computedMarks} marks total</span>
            )}
          </div>
          <div className="flex gap-3">
            {step === 'questions' && (
              <button type="button" onClick={() => setStep('details')}
                className="px-4 py-2 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100">
                ← Back
              </button>
            )}
            {step === 'details' && (
              <button type="button"
                onClick={() => { const e = validate(form); if (!Object.keys(e).length) setStep('questions'); else setErrors(e); }}
                className="px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700">
                Next: Select Questions →
              </button>
            )}
            {step === 'questions' && (
              <button type="button" onClick={handleSubmit} disabled={submitting || selectedQuestions.size === 0}
                className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? 'Saving…' : isEdit ? 'Update Exam' : 'Create Exam'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const map = {
    DRAFT:     'bg-gray-100 text-gray-600 border-gray-200',
    PUBLISHED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    CLOSED:    'bg-red-100 text-red-600 border-red-200',
  };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
}

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ exam, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-full"><Trash2 size={18} className="text-red-600"/></div>
          <h3 className="text-base font-semibold text-gray-800">Delete Exam?</h3>
        </div>
        <p className="text-sm text-gray-600 mb-1">"{exam.title}"</p>
        <p className="text-xs text-gray-400 mb-6">All exam attempts and results will be preserved, but the exam itself will be removed.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ExamManager ─────────────────────────────────────────────────────────────

function ExamManager() {
  const [exams, setExams]           = useState([]);
  const [page, setPage]             = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const [modalExam, setModalExam]       = useState(undefined); // undefined=closed, null=create, obj=edit
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting]         = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getExams(page, 10);
      const d = res.data;
      if (d?.content !== undefined) {
        setExams(d.content);
        setTotalPages(d.totalPages ?? 1);
        setTotalElements(d.totalElements ?? d.content.length);
      } else if (Array.isArray(d)) {
        setExams(d);
        setTotalPages(1);
        setTotalElements(d.length);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load exams.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchExams(); }, [fetchExams]);

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteExam(pendingDelete.examId ?? pendingDelete.id);
      setPendingDelete(null);
      fetchExams();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  async function handlePublish(exam) {
    if (!window.confirm(`Publish "${exam.title}"? Students will be able to see and take it.`)) return;
    try {
      await publishExam(exam.examId ?? exam.id);
      fetchExams();
    } catch (err) {
      alert(err?.response?.data?.message || 'Publish failed.');
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Exam Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalElements > 0 ? `${totalElements} exam${totalElements !== 1 ? 's' : ''}` : 'Create your first exam'}
          </p>
        </div>
        <button onClick={() => setModalExam(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 shadow-sm transition-colors">
          <Plus size={16}/> New Exam
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-6">{error}</div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Title', 'Duration', 'Total Marks', 'Questions', 'Status', 'Window', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-100 rounded animate-pulse"/></td>
                    ))}
                  </tr>
                ))
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <BookOpen size={32} className="text-gray-300"/>
                      <p className="text-sm text-gray-400">No exams yet. Create your first exam.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                exams.map(exam => (
                  <tr key={exam.examId ?? exam.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-[200px] truncate">
                      {exam.title}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                      <span className="flex items-center gap-1"><Clock size={13} className="text-gray-400"/>{exam.durationMinutes} min</span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-indigo-700">
                      {exam.totalMarks ?? 0}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="flex items-center gap-1"><HelpCircle size={13} className="text-gray-400"/>{exam.questionCount ?? 0}</span>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={exam.status}/></td>
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                      {exam.startTime ? (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-gray-400"/>
                          {formatDateTime(exam.startTime)}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {exam.status === 'DRAFT' && (
                          <button onClick={() => setModalExam(exam)} title="Edit"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                            <Pencil size={14}/>
                          </button>
                        )}
                        <button onClick={() => setPendingDelete(exam)} title="Delete"
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                        {exam.status === 'DRAFT' && (
                          <button onClick={() => handlePublish(exam)} title="Publish"
                            className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors">
                            <Send size={14}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-400">Page {page + 1} of {totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(0, p-1))} disabled={page === 0}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">
                <ChevronLeft size={13}/> Prev
              </button>
              <button onClick={() => setPage(p => Math.min(totalPages-1, p+1))} disabled={page >= totalPages-1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50">
                Next <ChevronRight size={13}/>
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
          onSaved={() => { setModalExam(undefined); fetchExams(); }}
        />
      )}

      {/* Delete confirm */}
      {pendingDelete && (
        <DeleteConfirmModal
          exam={pendingDelete}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

export default ExamManager;
