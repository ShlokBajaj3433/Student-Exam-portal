import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  createQuestion,
  updateQuestion,
  getQuestionById,
} from '../../services/questionService';

// ─── constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_OPTIONS = [
  { value: 'EASY', label: 'Easy', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'HARD', label: 'Hard', color: 'text-red-600 bg-red-50 border-red-200' },
];

const OPTION_KEYS = ['A', 'B', 'C', 'D'];

const OPTION_COLORS = {
  A: 'border-blue-300 bg-blue-50',
  B: 'border-violet-300 bg-violet-50',
  C: 'border-amber-300 bg-amber-50',
  D: 'border-rose-300 bg-rose-50',
};

const OPTION_CORRECT_COLORS = {
  A: 'border-blue-500 bg-blue-100 ring-2 ring-blue-400',
  B: 'border-violet-500 bg-violet-100 ring-2 ring-violet-400',
  C: 'border-amber-500 bg-amber-100 ring-2 ring-amber-400',
  D: 'border-rose-500 bg-rose-100 ring-2 ring-rose-400',
};

const OPTION_LABEL_COLORS = {
  A: 'bg-blue-500',
  B: 'bg-violet-500',
  C: 'bg-amber-500',
  D: 'bg-rose-500',
};

const EMPTY_FORM = {
  questionText: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctAnswer: null,
  marks: '',
  difficultyLevel: '',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};
  if (!form.questionText.trim()) errors.questionText = 'Question text is required.';
  if (!form.optionA.trim()) errors.optionA = 'Option A is required.';
  if (!form.optionB.trim()) errors.optionB = 'Option B is required.';
  if (!form.optionC.trim()) errors.optionC = 'Option C is required.';
  if (!form.optionD.trim()) errors.optionD = 'Option D is required.';
  if (!form.correctAnswer) errors.correctAnswer = 'Please select the correct answer.';
  const marks = Number(form.marks);
  if (!form.marks || isNaN(marks) || marks < 1)
    errors.marks = 'Marks must be at least 1.';
  return errors;
}

// ─── OptionRow ────────────────────────────────────────────────────────────────

function OptionRow({ letter, value, isCorrect, onChange, onSelect, error, disabled }) {
  return (
    <div className="space-y-1">
      <div
        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer group
          ${isCorrect ? OPTION_CORRECT_COLORS[letter] : `${OPTION_COLORS[letter]} hover:border-opacity-60`}`}
        onClick={() => !disabled && onSelect(letter)}
        role="radio"
        aria-checked={isCorrect}
        tabIndex={0}
        onKeyDown={(e) => (e.key === ' ' || e.key === 'Enter') && !disabled && onSelect(letter)}
      >
        {/* Letter badge */}
        <span
          className={`flex-shrink-0 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center select-none
            ${OPTION_LABEL_COLORS[letter]}`}
        >
          {letter}
        </span>

        {/* Input */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(letter, e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder={`Type option ${letter}…`}
          disabled={disabled}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none focus:ring-0 border-none"
        />

        {/* Correct indicator */}
        <span className="flex-shrink-0" title={isCorrect ? 'Correct answer' : 'Mark as correct'}>
          {isCorrect ? (
            <CheckCircle2 size={20} className="text-emerald-600" />
          ) : (
            <Circle size={20} className="text-gray-300 group-hover:text-gray-400" />
          )}
        </span>
      </div>
      {error && (
        <p className="flex items-center gap-1 text-xs text-red-500 pl-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

// ─── PreviewPanel ─────────────────────────────────────────────────────────────

function PreviewPanel({ form }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  // Reset preview state when question text changes
  useEffect(() => {
    setSelected(null);
    setRevealed(false);
  }, [form.questionText]);

  const diffInfo = DIFFICULTY_OPTIONS.find((d) => d.value === form.difficultyLevel);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Student Preview
        </h3>
        {diffInfo && (
          <span
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${diffInfo.color}`}
          >
            {diffInfo.label}
          </span>
        )}
      </div>

      {/* Question */}
      <p className="text-base font-medium text-gray-800 min-h-[48px] mb-5">
        {form.questionText || (
          <span className="text-gray-400 italic">Your question will appear here…</span>
        )}
      </p>

      {/* Options */}
      <div className="space-y-2.5 mb-5">
        {OPTION_KEYS.map((key) => {
          const val = form[`option${key}`];
          const isSelected = selected === key;
          const isCorrect = form.correctAnswer === key;
          const showResult = revealed && val;
          return (
            <button
              key={key}
              type="button"
              disabled={!val}
              onClick={() => val && setSelected(key)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left text-sm transition-all
                ${!val ? 'border-gray-100 bg-gray-50 opacity-40 cursor-not-allowed' : ''}
                ${val && !isSelected && !showResult ? 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer' : ''}
                ${val && isSelected && !revealed ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-300' : ''}
                ${showResult && isCorrect ? 'border-emerald-500 bg-emerald-50' : ''}
                ${showResult && isSelected && !isCorrect ? 'border-red-400 bg-red-50' : ''}
              `}
            >
              <span
                className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white
                  ${OPTION_LABEL_COLORS[key]}`}
              >
                {key}
              </span>
              <span className={`flex-1 ${!val ? 'text-gray-300' : 'text-gray-700'}`}>
                {val || `Option ${key}`}
              </span>
              {showResult && isCorrect && (
                <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Reveal toggle */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {form.marks ? `${form.marks} mark${Number(form.marks) !== 1 ? 's' : ''}` : '— marks'}
        </p>
        <button
          type="button"
          onClick={() => setRevealed((r) => !r)}
          disabled={!form.correctAnswer}
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {revealed ? <EyeOff size={13} /> : <Eye size={13} />}
          {revealed ? 'Hide answer' : 'Reveal answer'}
        </button>
      </div>
    </div>
  );
}

// ─── QuestionEditor ────────────────────────────────────────────────────────────

function QuestionEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestion, setLoadingQuestion] = useState(isEdit);

  // Load existing question for edit
  useEffect(() => {
    if (!isEdit) return;
    setLoadingQuestion(true);
    getQuestionById(id)
      .then((res) => {
        const q = res.data;
        setForm({
          questionText: q.questionText ?? '',
          optionA: q.optionA ?? '',
          optionB: q.optionB ?? '',
          optionC: q.optionC ?? '',
          optionD: q.optionD ?? '',
          correctAnswer: q.correctAnswer ?? null,
          marks: q.marks ?? '',
          difficultyLevel: q.difficultyLevel ?? '',
        });
      })
      .catch(() => setApiError('Failed to load question.'))
      .finally(() => setLoadingQuestion(false));
  }, [id, isEdit]);

  function handleOptionChange(letter, value) {
    setForm((prev) => ({ ...prev, [`option${letter}`]: value }));
    setErrors((prev) => ({ ...prev, [`option${letter}`]: undefined }));
  }

  function handleCorrectSelect(letter) {
    setForm((prev) => ({ ...prev, correctAnswer: letter }));
    setErrors((prev) => ({ ...prev, correctAnswer: undefined }));
  }

  function handleFieldChange(e) {
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
        await updateQuestion(id, payload);
      } else {
        await createQuestion(payload);
      }
      navigate('/admin/questions');
    } catch (err) {
      setApiError(err?.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loadingQuestion) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 size={28} className="animate-spin mr-2" />
        Loading question…
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => navigate('/admin/questions')}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          aria-label="Back to question bank"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            {isEdit ? 'Edit Question' : 'Create Question'}
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {isEdit
              ? 'Update the question details below.'
              : 'Fill in the details. Click any option row to mark it as correct.'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Left: editor ── */}
          <div className="lg:col-span-3 space-y-5">

            {/* API error banner */}
            {apiError && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                {apiError}
              </div>
            )}

            {/* Question card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-6 pt-6 pb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Question <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="questionText"
                  value={form.questionText}
                  onChange={handleFieldChange}
                  rows={3}
                  placeholder="e.g. What is the time complexity of binary search?"
                  className={`w-full text-gray-800 text-base placeholder-gray-300 resize-none outline-none border-b-2 py-1 bg-transparent transition-colors
                    ${errors.questionText ? 'border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                />
                {errors.questionText && (
                  <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                    <AlertCircle size={11} /> {errors.questionText}
                  </p>
                )}
              </div>

              {/* Marks + Difficulty row */}
              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex flex-wrap gap-4 rounded-b-2xl">
                <div className="flex-1 min-w-[120px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Marks <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="marks"
                    value={form.marks}
                    onChange={handleFieldChange}
                    min={1}
                    placeholder="e.g. 5"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${errors.marks ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.marks && (
                    <p className="flex items-center gap-1 text-xs text-red-500 mt-1">
                      <AlertCircle size={11} /> {errors.marks}
                    </p>
                  )}
                </div>

                <div className="flex-1 min-w-[160px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Difficulty
                  </label>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map(({ value, label, color }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            difficultyLevel: prev.difficultyLevel === value ? '' : value,
                          }))
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${form.difficultyLevel === value
                            ? color
                            : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Options card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-gray-700">Answer Options</h2>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Click a row to mark it as the correct answer
                  </p>
                </div>
                {errors.correctAnswer && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={11} /> {errors.correctAnswer}
                  </p>
                )}
              </div>

              <div className="space-y-3">
                {OPTION_KEYS.map((letter) => (
                  <OptionRow
                    key={letter}
                    letter={letter}
                    value={form[`option${letter}`]}
                    isCorrect={form.correctAnswer === letter}
                    onChange={handleOptionChange}
                    onSelect={handleCorrectSelect}
                    error={errors[`option${letter}`]}
                    disabled={submitting}
                  />
                ))}
              </div>

              {/* Correct answer hint */}
              {form.correctAnswer && (
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <CheckCircle2 size={13} />
                  Option <strong>{form.correctAnswer}</strong> is marked as correct.
                </div>
              )}
            </div>

            {/* Submit bar */}
            <div className="flex items-center justify-end gap-3 pb-8">
              <button
                type="button"
                onClick={() => navigate('/admin/questions')}
                className="px-5 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Saving…' : isEdit ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>

          {/* ── Right: live preview ── */}
          <div className="lg:col-span-2">
            <PreviewPanel form={form} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default QuestionEditor;
