import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Search,
  HelpCircle,
  CheckCircle2,
  Filter,
  X,
} from 'lucide-react';
import { getQuestions, deleteQuestion } from '../../services/questionService';

// ─── constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'];

const DIFFICULTY_STYLES = {
  EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
  HARD: 'bg-red-50 text-red-700 border-red-200',
};

const OPTION_COLORS = {
  A: 'bg-blue-500',
  B: 'bg-violet-500',
  C: 'bg-amber-500',
  D: 'bg-rose-500',
};

// ─── DeleteConfirmModal ───────────────────────────────────────────────────────

function DeleteConfirmModal({ question, onConfirm, onCancel, deleting }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-red-100 rounded-full">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Delete Question?</h3>
        </div>
        <p className="text-sm text-gray-500 mb-1 line-clamp-2">
          "{question.questionText}"
        </p>
        <p className="text-xs text-gray-400 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({ question, onEdit, onDelete }) {
  const options = [
    { key: 'A', text: question.optionA },
    { key: 'B', text: question.optionB },
    { key: 'C', text: question.optionC },
    { key: 'D', text: question.optionD },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col">
      {/* Card header */}
      <div className="px-5 pt-5 pb-3 flex-1">
        {/* Badges row */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {question.difficultyLevel && (
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                DIFFICULTY_STYLES[question.difficultyLevel] || 'bg-gray-100 text-gray-500 border-gray-200'
              }`}
            >
              {question.difficultyLevel.charAt(0) + question.difficultyLevel.slice(1).toLowerCase()}
            </span>
          )}
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
            {question.marks} {question.marks === 1 ? 'mark' : 'marks'}
          </span>
        </div>

        {/* Question text */}
        <p className="text-sm font-medium text-gray-800 leading-relaxed line-clamp-3 mb-4">
          {question.questionText}
        </p>

        {/* Options */}
        <div className="space-y-1.5">
          {options.map(({ key, text }) => {
            const isCorrect = question.correctAnswer === key;
            return (
              <div
                key={key}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors
                  ${isCorrect
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-gray-50 border border-transparent'
                  }`}
              >
                <span
                  className={`w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${OPTION_COLORS[key]}`}
                >
                  {key}
                </span>
                <span className={`flex-1 line-clamp-1 ${isCorrect ? 'text-emerald-700 font-medium' : 'text-gray-600'}`}>
                  {text}
                </span>
                {isCorrect && (
                  <CheckCircle2 size={13} className="flex-shrink-0 text-emerald-600" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Card footer */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[11px] text-gray-400">ID #{question.id}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(question)}
            title="Edit"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => onDelete(question)}
            title="Delete"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState({ filtered, onClear, onCreate }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="p-4 bg-gray-100 rounded-full mb-4">
        <HelpCircle size={32} className="text-gray-400" />
      </div>
      {filtered ? (
        <>
          <p className="text-gray-600 font-medium">No questions match your filters</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Try adjusting your search or difficulty filter.</p>
          <button
            onClick={onClear}
            className="text-sm text-indigo-600 hover:underline"
          >
            Clear filters
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-600 font-medium">No questions yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Create your first question to build your library.</p>
          <button
            onClick={onCreate}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
          >
            <Plus size={15} /> Create Question
          </button>
        </>
      )}
    </div>
  );
}

// ─── QuestionBank ─────────────────────────────────────────────────────────────

function QuestionBank() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Filters (client-side on current page)
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');

  // Delete state
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getQuestions(page, 12);
      const data = res.data;
      if (data?.content !== undefined) {
        setQuestions(data.content);
        setTotalPages(data.totalPages ?? 1);
        setTotalElements(data.totalElements ?? data.content.length);
      } else if (Array.isArray(data)) {
        setQuestions(data);
        setTotalPages(1);
        setTotalElements(data.length);
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

  // Client-side filtering on the current page's data
  const filtered = questions.filter((q) => {
    const matchesSearch =
      !search ||
      q.questionText.toLowerCase().includes(search.toLowerCase()) ||
      q.optionA?.toLowerCase().includes(search.toLowerCase()) ||
      q.optionB?.toLowerCase().includes(search.toLowerCase());
    const matchesDiff = !difficultyFilter || q.difficultyLevel === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  const isFiltered = Boolean(search || difficultyFilter);

  function clearFilters() {
    setSearch('');
    setDifficultyFilter('');
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await deleteQuestion(pendingDelete.id);
      setPendingDelete(null);
      fetchQuestions();
    } catch (err) {
      alert(err?.response?.data?.message || 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Question Bank</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {totalElements > 0 ? `${totalElements} question${totalElements !== 1 ? 's' : ''} in library` : 'Build your question library'}
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/questions/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Question
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Difficulty filter */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-400 flex-shrink-0" />
          <div className="flex gap-1.5">
            {DIFFICULTY_OPTIONS.map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter((prev) => (prev === d ? '' : d))}
                className={`px-3 py-2 text-xs font-semibold rounded-xl border transition-all
                  ${difficultyFilter === d
                    ? DIFFICULTY_STYLES[d]
                    : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'
                  }`}
              >
                {d.charAt(0) + d.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* ── Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="flex gap-2 mb-3">
                <div className="h-5 w-14 bg-gray-100 rounded-full" />
                <div className="h-5 w-10 bg-gray-100 rounded-full" />
              </div>
              <div className="h-4 bg-gray-100 rounded w-full mb-1.5" />
              <div className="h-4 bg-gray-100 rounded w-4/5 mb-5" />
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-8 bg-gray-50 rounded-lg mb-1.5" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.length === 0 ? (
            <EmptyState
              filtered={isFiltered}
              onClear={clearFilters}
              onCreate={() => navigate('/admin/questions/new')}
            />
          ) : (
            filtered.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                onEdit={(q) => navigate(`/admin/questions/${q.id}/edit`)}
                onDelete={setPendingDelete}
              />
            ))
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-400">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {pendingDelete && (
        <DeleteConfirmModal
          question={pendingDelete}
          onConfirm={confirmDelete}
          onCancel={() => setPendingDelete(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}

export default QuestionBank;
