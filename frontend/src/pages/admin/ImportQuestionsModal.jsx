import { useState } from 'react';
import { Download, Upload, X } from 'lucide-react';
import { downloadQuestionTemplate, importQuestions } from '../../services/questionService';

export default function ImportQuestionsModal({ onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function download() {
    setDownloading(true);
    setError('');
    try {
      const response = await downloadQuestionTemplate();
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'question-import-template.xlsx';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setError('Could not download the template. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  async function upload(event) {
    event.preventDefault();
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name) || file.size > 1024 * 1024 || file.size === 0) {
      setError('Choose a non-empty .xlsx or .xls file, up to 1 MB.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const response = await importQuestions(file);
      onImported(response.data.importedCount);
    } catch (err) {
      setError(err?.response?.data?.message || 'Import failed. Please check the file and try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <section role="dialog" aria-modal="true" aria-labelledby="import-title" className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 id="import-title" className="text-lg font-semibold text-gray-800">Upload questions from Excel</h2>
          <button onClick={onClose} disabled={busy} aria-label="Close" className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"><X size={18} /></button>
        </div>
        <p className="text-sm text-gray-600 mb-3">Download the template, replace the example rows with your questions, then upload your workbook.</p>
        <button type="button" onClick={download} disabled={downloading || busy} className="flex items-center gap-2 text-sm font-medium text-indigo-600 mb-4 disabled:opacity-50">
          <Download size={16} /> {downloading ? 'Downloading...' : 'Download Excel template'}
        </button>
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 space-y-2 mb-5">
          <p>Supports MCQ, MULTIPLE_CHOICE and SHORT_ANSWER. Use EASY, MEDIUM or HARD for difficulty, and a positive whole number for marks.</p>
          <p>MCQ: fill all four options and correctAnswer (A–D). Multiple choice: fill all options and correctAnswers (for example A,C). Short answer: fill modelAnswer.</p>
          <p>Only the first worksheet is imported. Maximum 500 questions, 1 MB. Keep the column headers and use values instead of formulas. All rows must pass validation before any questions are saved.</p>
        </div>
        <form onSubmit={upload}>
          <label htmlFor="question-excel" className="block text-sm font-medium text-gray-700 mb-2">Excel file</label>
          <input id="question-excel" type="file" accept=".xlsx,.xls" disabled={busy} onChange={(e) => { setFile(e.target.files?.[0] || null); setError(''); }} className="block w-full text-sm text-gray-600 mb-4" />
          {error && <p role="alert" className="text-sm text-red-700 bg-red-50 rounded-lg p-3 mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" disabled={busy} onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={!file || busy || downloading} className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"><Upload size={16} />{busy ? 'Importing...' : 'Import questions'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}
