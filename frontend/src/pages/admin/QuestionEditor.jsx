import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, CheckCircle2, Circle, AlertCircle, Loader2,
  Eye, EyeOff, CheckSquare, AlignLeft, ListChecks,
} from 'lucide-react';
import { createQuestion, updateQuestion, getQuestionById } from '../../services/questionService';

// ─── constants ────────────────────────────────────────────────────────────────

const QUESTION_TYPES = [
  { value: 'MCQ',             label: 'Multiple Choice (Single)',  icon: Circle,      desc: 'One correct answer' },
  { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Multi)',   icon: CheckSquare, desc: 'Select all that apply' },
  { value: 'SHORT_ANSWER',    label: 'Short Answer',              icon: AlignLeft,   desc: 'Student writes free text' },
];

const DIFFICULTY_OPTIONS = [
  { value: 'EASY',   label: 'Easy',   color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { value: 'MEDIUM', label: 'Medium', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'HARD',   label: 'Hard',   color: 'text-red-600 bg-red-50 border-red-200' },
];

const OPTION_KEYS = ['A', 'B', 'C', 'D'];
const OPTION_COLORS     = { A: 'border-blue-300 bg-blue-50',    B: 'border-violet-300 bg-violet-50',   C: 'border-amber-300 bg-amber-50',   D: 'border-rose-300 bg-rose-50' };
const OPTION_CORRECT    = { A: 'border-blue-500 bg-blue-100 ring-2 ring-blue-400',  B: 'border-violet-500 bg-violet-100 ring-2 ring-violet-400', C: 'border-amber-500 bg-amber-100 ring-2 ring-amber-400', D: 'border-rose-500 bg-rose-100 ring-2 ring-rose-400' };
const OPTION_BADGE      = { A: 'bg-blue-500', B: 'bg-violet-500', C: 'bg-amber-500', D: 'bg-rose-500' };

const EMPTY_FORM = {
  questionType: 'MCQ',
  questionText: '',
  optionA: '', optionB: '', optionC: '', optionD: '',
  correctAnswer: null,       // MCQ — single letter
  correctAnswers: [],        // MULTIPLE_CHOICE — array of letters
  modelAnswer: '',           // SHORT_ANSWER
  marks: '',
  difficultyLevel: '',
};

// ─── Validation ───────────────────────────────────────────────────────────────

function validate(form) {
  const e = {};
  if (!form.questionText.trim()) e.questionText = 'Question text is required.';
  const marks = Number(form.marks);
  if (!form.marks || isNaN(marks) || marks < 1) e.marks = 'Marks must be at least 1.';

  if (form.questionType === 'MCQ' || form.questionType === 'MULTIPLE_CHOICE') {
    if (!form.optionA.trim()) e.optionA = 'Required.';
    if (!form.optionB.trim()) e.optionB = 'Required.';
    if (!form.optionC.trim()) e.optionC = 'Required.';
    if (!form.optionD.trim()) e.optionD = 'Required.';
  }
  if (form.questionType === 'MCQ' && !form.correctAnswer)
    e.correctAnswer = 'Click an option to mark it as correct.';
  if (form.questionType === 'MULTIPLE_CHOICE' && form.correctAnswers.length === 0)
    e.correctAnswer = 'Select at least one correct option.';
  if (form.questionType === 'SHORT_ANSWER' && !form.modelAnswer.trim())
    e.modelAnswer = 'Model answer is required.';
  return e;
}

// ─── TypeSelector ─────────────────────────────────────────────────────────────

function TypeSelector({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {QUESTION_TYPES.map(({ value: v, label, icon: Icon, desc }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all
              ${active
                ? 'border-indigo-500 bg-indigo-50 shadow-sm'
                : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/40'}`}
          >
            <Icon size={18} className={active ? 'text-indigo-600 mt-0.5' : 'text-gray-400 mt-0.5'} />
            <div>
              <p className={`text-sm font-semibold ${active ? 'text-indigo-700' : 'text-gray-700'}`}>{label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── OptionRow ────────────────────────────────────────────────────────────────

function OptionRow({ letter, value, isCorrect, isMulti, onChange, onSelect, error }) {
  const baseStyle = isCorrect ? OPTION_CORRECT[letter] : OPTION_COLORS[letter];
  return (
    <div className="space-y-1">
      <div
        role={isMulti ? 'checkbox' : 'radio'}
        aria-checked={isCorrect}
        tabIndex={0}
        onClick={() => onSelect(letter)}
        onKeyDown={e => (e.key === ' ' || e.key === 'Enter') && onSelect(letter)}
        className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all group ${baseStyle}`}
      >
        <span className={`w-7 h-7 flex-shrink-0 rounded-full text-white text-xs font-bold flex items-center justify-center ${OPTION_BADGE[letter]}`}>
          {letter}
        </span>
        <input
          type="text"
          value={value}
          onChange={e => onChange(letter, e.target.value)}
          onClick={e => e.stopPropagation()}
          placeholder={`Type option ${letter}…`}
          className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none border-none"
        />
        <span className="flex-shrink-0">
          {isMulti
            ? isCorrect
              ? <CheckSquare size={18} className="text-emerald-600" />
              : <div className="w-[18px] h-[18px] border-2 border-gray-300 rounded group-hover:border-gray-400" />
            : isCorrect
              ? <CheckCircle2 size={18} className="text-emerald-600" />
              : <Circle size={18} className="text-gray-300 group-hover:text-gray-400" />
          }
        </span>
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1 pl-1"><AlertCircle size={11}/>{error}</p>}
    </div>
  );
}

// ─── PreviewPanel ─────────────────────────────────────────────────────────────

function PreviewPanel({ form }) {
  const [selected, setSelected] = useState(null);       // MCQ
  const [multiSel, setMultiSel] = useState([]);         // MULTIPLE_CHOICE
  const [revealed, setRevealed] = useState(false);
  const [text, setText] = useState('');                 // SHORT_ANSWER

  useEffect(() => { setSelected(null); setMultiSel([]); setRevealed(false); setText(''); }, [form.questionType]);
  const diffInfo = DIFFICULTY_OPTIONS.find(d => d.value === form.difficultyLevel);

  const toggleMulti = key => setMultiSel(p => p.includes(key) ? p.filter(k => k !== key) : [...p, key]);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Student Preview</h3>
        {diffInfo && <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${diffInfo.color}`}>{diffInfo.label}</span>}
      </div>

      <p className="text-base font-medium text-gray-800 min-h-[40px] mb-4">
        {form.questionText || <span className="text-gray-300 italic">Question will appear here…</span>}
      </p>

      {/* MCQ options */}
      {(form.questionType === 'MCQ' || form.questionType === 'MULTIPLE_CHOICE') && (
        <div className="space-y-2 mb-4">
          {OPTION_KEYS.map(key => {
            const val = form[`option${key}`];
            const isMCQSel = selected === key;
            const isMultiSel = multiSel.includes(key);
            const isCorrectMCQ = form.correctAnswer === key;
            const isCorrectMulti = form.correctAnswers.includes(key);
            const showResult = revealed && val;
            return (
              <button key={key} type="button" disabled={!val}
                onClick={() => {
                  if (!val) return;
                  if (form.questionType === 'MCQ') setSelected(key);
                  else toggleMulti(key);
                }}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 text-left text-sm transition-all
                  ${!val ? 'opacity-30 border-gray-100 bg-gray-50 cursor-not-allowed' : ''}
                  ${val && !showResult && (form.questionType === 'MCQ' ? isMCQSel : isMultiSel)
                    ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-300' : ''}
                  ${val && !showResult && !(form.questionType === 'MCQ' ? isMCQSel : isMultiSel)
                    ? 'border-gray-200 bg-white hover:border-indigo-200 cursor-pointer' : ''}
                  ${showResult && (form.questionType === 'MCQ' ? isCorrectMCQ : isCorrectMulti)
                    ? 'border-emerald-500 bg-emerald-50' : ''}
                  ${showResult && (form.questionType === 'MCQ' ? isMCQSel && !isCorrectMCQ : isMultiSel && !isCorrectMulti)
                    ? 'border-red-400 bg-red-50' : ''}`}
              >
                <span className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold text-white ${OPTION_BADGE[key]}`}>{key}</span>
                <span className="flex-1 text-gray-700">{val || `Option ${key}`}</span>
                {showResult && (form.questionType === 'MCQ' ? isCorrectMCQ : isCorrectMulti) && <CheckCircle2 size={14} className="text-emerald-600 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* SHORT_ANSWER textarea */}
      {form.questionType === 'SHORT_ANSWER' && (
        <textarea value={text} onChange={e => setText(e.target.value)} rows={3}
          placeholder="Student types their answer here…"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 mb-4"
        />
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <span className="text-xs text-gray-400">{form.marks ? `${form.marks} mark${Number(form.marks) !== 1 ? 's' : ''}` : '— marks'}</span>
        {form.questionType !== 'SHORT_ANSWER' && (
          <button type="button" onClick={() => setRevealed(r => !r)}
            disabled={form.questionType === 'MCQ' ? !form.correctAnswer : form.correctAnswers.length === 0}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {revealed ? <EyeOff size={13}/> : <Eye size={13}/>}
            {revealed ? 'Hide answer' : 'Reveal answer'}
          </button>
        )}
        {form.questionType === 'SHORT_ANSWER' && form.modelAnswer && (
          <button type="button" onClick={() => setRevealed(r => !r)}
            className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
          >
            {revealed ? <EyeOff size={13}/> : <Eye size={13}/>}
            Model answer
          </button>
        )}
      </div>
      {revealed && form.questionType === 'SHORT_ANSWER' && form.modelAnswer && (
        <p className="mt-2 text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-2">{form.modelAnswer}</p>
      )}
    </div>
  );
}

// ─── QuestionEditor (main) ────────────────────────────────────────────────────

function QuestionEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  // Load existing question for edit
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getQuestionById(id)
      .then(res => {
        const q = res.data;
        setForm({
          questionType:   q.questionType   ?? 'MCQ',
          questionText:   q.questionText   ?? '',
          optionA:        q.optionA        ?? '',
          optionB:        q.optionB        ?? '',
          optionC:        q.optionC        ?? '',
          optionD:        q.optionD        ?? '',
          correctAnswer:  q.correctAnswer  ?? null,
          correctAnswers: q.correctAnswers ? q.correctAnswers.split(',') : [],
          modelAnswer:    q.modelAnswer    ?? '',
          marks:          q.marks          ?? '',
          difficultyLevel: q.difficulty   ?? '',
        });
      })
      .catch(() => setApiError('Failed to load question.'))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  // When type changes, reset answer fields but keep question text / options
  function handleTypeChange(type) {
    setForm(prev => ({ ...prev, questionType: type, correctAnswer: null, correctAnswers: [], modelAnswer: '' }));
    setErrors(prev => ({ ...prev, correctAnswer: undefined, modelAnswer: undefined }));
  }

  function handleField(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function handleOptionChange(letter, value) {
    setForm(prev => ({ ...prev, [`option${letter}`]: value }));
    setErrors(prev => ({ ...prev, [`option${letter}`]: undefined }));
  }

  function handleMCQSelect(letter) {
    setForm(prev => ({ ...prev, correctAnswer: letter }));
    setErrors(prev => ({ ...prev, correctAnswer: undefined }));
  }

  function handleMultiToggle(letter) {
    setForm(prev => {
      const has = prev.correctAnswers.includes(letter);
      return { ...prev, correctAnswers: has ? prev.correctAnswers.filter(l => l !== letter) : [...prev.correctAnswers, letter] };
    });
    setErrors(prev => ({ ...prev, correctAnswer: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    setApiError('');
    try {
      const payload = {
        questionType:   form.questionType,
        questionText:   form.questionText.trim(),
        marks:          Number(form.marks),
        difficulty:     form.difficultyLevel || null,
        // MCQ / MULTIPLE_CHOICE fields
        optionA:        form.questionType !== 'SHORT_ANSWER' ? form.optionA.trim() : null,
        optionB:        form.questionType !== 'SHORT_ANSWER' ? form.optionB.trim() : null,
        optionC:        form.questionType !== 'SHORT_ANSWER' ? form.optionC.trim() : null,
        optionD:        form.questionType !== 'SHORT_ANSWER' ? form.optionD.trim() : null,
        correctAnswer:  form.questionType === 'MCQ'             ? form.correctAnswer : null,
        correctAnswers: form.questionType === 'MULTIPLE_CHOICE' ? form.correctAnswers.sort().join(',') : null,
        modelAnswer:    form.questionType === 'SHORT_ANSWER'    ? form.modelAnswer.trim() : null,
      };
      isEdit ? await updateQuestion(id, payload) : await createQuestion(payload);
      navigate('/admin/questions');
    } catch (err) {
      setApiError(err?.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      <Loader2 size={28} className="animate-spin mr-2" /> Loading question…
    </div>
  );

  const isChoiceType = form.questionType === 'MCQ' || form.questionType === 'MULTIPLE_CHOICE';

  return (
    <div className="max-w-6xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center gap-3 mb-6">
        <button type="button" onClick={() => navigate('/admin/questions')}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" aria-label="Back">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Question' : 'Create Question'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Choose a type, fill in the details, then save.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* ── Editor ── */}
          <div className="lg:col-span-3 space-y-5">

            {apiError && (
              <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />{apiError}
              </div>
            )}

            {/* Question type selector */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Question Type</p>
              <TypeSelector value={form.questionType} onChange={handleTypeChange} />
            </div>

            {/* Question text + marks + difficulty */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-6 pt-6 pb-3">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Question <span className="text-red-400">*</span>
                </label>
                <textarea name="questionText" value={form.questionText} onChange={handleField} rows={3}
                  placeholder="e.g. What is the time complexity of binary search?"
                  className={`w-full text-gray-800 text-base placeholder-gray-300 resize-none outline-none bg-transparent border-b-2 py-1 transition-colors
                    ${errors.questionText ? 'border-red-400' : 'border-gray-200 focus:border-indigo-500'}`}
                />
                {errors.questionText && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.questionText}</p>}
              </div>

              <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100 flex flex-wrap gap-4 rounded-b-2xl">
                <div className="flex-1 min-w-[110px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Marks <span className="text-red-400">*</span>
                  </label>
                  <input type="number" name="marks" value={form.marks} onChange={handleField} min={1} placeholder="e.g. 5"
                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500
                      ${errors.marks ? 'border-red-400' : 'border-gray-300'}`}
                  />
                  {errors.marks && <p className="text-xs text-red-500 mt-1">{errors.marks}</p>}
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Difficulty</label>
                  <div className="flex gap-2">
                    {DIFFICULTY_OPTIONS.map(({ value, label, color }) => (
                      <button key={value} type="button"
                        onClick={() => setForm(prev => ({ ...prev, difficultyLevel: prev.difficultyLevel === value ? '' : value }))}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                          ${form.difficultyLevel === value ? color : 'border-gray-200 text-gray-500 bg-white hover:bg-gray-50'}`}
                      >{label}</button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Options (MCQ / MULTIPLE_CHOICE) */}
            {isChoiceType && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-700">Answer Options</h2>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {form.questionType === 'MCQ' ? 'Click a row to mark the single correct answer.' : 'Click rows to select all correct answers.'}
                    </p>
                  </div>
                  {errors.correctAnswer && (
                    <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11}/>{errors.correctAnswer}</p>
                  )}
                </div>
                <div className="space-y-3">
                  {OPTION_KEYS.map(letter => (
                    <OptionRow key={letter}
                      letter={letter}
                      value={form[`option${letter}`]}
                      isCorrect={form.questionType === 'MCQ'
                        ? form.correctAnswer === letter
                        : form.correctAnswers.includes(letter)}
                      isMulti={form.questionType === 'MULTIPLE_CHOICE'}
                      onChange={handleOptionChange}
                      onSelect={form.questionType === 'MCQ' ? handleMCQSelect : handleMultiToggle}
                      error={errors[`option${letter}`]}
                    />
                  ))}
                </div>
                {form.questionType === 'MCQ' && form.correctAnswer && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <CheckCircle2 size={13}/>Option <strong>{form.correctAnswer}</strong> is marked as correct.
                  </div>
                )}
                {form.questionType === 'MULTIPLE_CHOICE' && form.correctAnswers.length > 0 && (
                  <div className="mt-4 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                    <ListChecks size={13}/>Correct options: <strong>{form.correctAnswers.sort().join(', ')}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Model answer (SHORT_ANSWER) */}
            {form.questionType === 'SHORT_ANSWER' && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Model Answer <span className="text-red-400">*</span>
                  <span className="ml-2 normal-case font-normal text-gray-400">(shown to admin only — used for manual grading reference)</span>
                </label>
                <textarea name="modelAnswer" value={form.modelAnswer} onChange={handleField} rows={4}
                  placeholder="Enter the expected correct answer or marking criteria…"
                  className={`w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500
                    ${errors.modelAnswer ? 'border-red-400' : 'border-gray-300'}`}
                />
                {errors.modelAnswer && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={11}/>{errors.modelAnswer}</p>}
              </div>
            )}

            {/* Submit bar */}
            <div className="flex items-center justify-end gap-3 pb-8">
              <button type="button" onClick={() => navigate('/admin/questions')}
                className="px-5 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors">
                {submitting && <Loader2 size={15} className="animate-spin" />}
                {submitting ? 'Saving…' : isEdit ? 'Update Question' : 'Save Question'}
              </button>
            </div>
          </div>

          {/* ── Preview ── */}
          <div className="lg:col-span-2">
            <PreviewPanel form={form} />
          </div>
        </div>
      </form>
    </div>
  );
}

export default QuestionEditor;
