import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, CheckCircle, BarChart2 } from 'lucide-react';
import { getAnalytics } from '../../services/adminService';

// ── Colour palette ────────────────────────────────────────────────────────────
const PASS_COLOR = '#22c55e'; // green-500
const FAIL_COLOR = '#ef4444'; // red-500
const AVG_COLOR = '#6366f1';  // indigo-500

// ── Helper: truncate long exam titles for chart axis ─────────────────────────
function truncate(str, max = 18) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex items-start gap-4">
      <div className={`inline-flex p-3 rounded-lg ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-gray-800 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Custom Tooltip for Bar Chart ──────────────────────────────────────────────
function CustomBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-md px-3 py-2 text-xs">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.fill }}>
          {entry.name}: <span className="font-bold">{Number(entry.value).toFixed(1)}</span>
        </p>
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        const res = await getAnalytics();
        if (!cancelled) setData(res.data);
      } catch (err) {
        if (!cancelled)
          setError(
            err?.response?.data?.message ||
              'Failed to load analytics. Please try again later.'
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Loading analytics…</p>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <p className="text-red-600 font-medium mb-1">Unable to load analytics</p>
          <p className="text-sm text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  // ── Empty / no data ────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="text-center text-gray-400 mt-16 text-sm">No analytics data available.</div>
    );
  }

  // ── Derived chart data ─────────────────────────────────────────────────────
  const examStats = Array.isArray(data.examStats) ? data.examStats : [];

  // Pass vs Fail pie data (aggregated across all exams)
  const totalPass = examStats.reduce((s, e) => s + (e.passCount ?? 0), 0);
  const totalFail = examStats.reduce((s, e) => s + (e.failCount ?? 0), 0);
  const pieData = [
    { name: 'Pass', value: totalPass },
    { name: 'Fail', value: totalFail },
  ];

  // Average scores per exam bar chart data
  const avgScoreData = examStats.map((e) => ({
    name: truncate(e.examTitle, 18),
    fullName: e.examTitle,
    'Avg Score': Number((e.averageScore ?? 0).toFixed(1)),
  }));

  // Pass/Fail counts per exam bar chart data
  const passFailData = examStats.map((e) => ({
    name: truncate(e.examTitle, 18),
    fullName: e.examTitle,
    Pass: e.passCount ?? 0,
    Fail: e.failCount ?? 0,
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-gray-800">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Aggregated exam performance statistics across all students
        </p>
      </div>

      {/* ── Summary stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="Total Attempts"
          value={data.totalAttempts ?? 0}
          color="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Pass Rate"
          value={`${Number(data.passRate ?? 0).toFixed(1)}%`}
          color="bg-green-50 text-green-600"
          sub={`${totalPass} passed / ${totalFail} failed`}
        />
        <StatCard
          icon={TrendingUp}
          label="Average Score"
          value={`${Number(data.averageScore ?? 0).toFixed(1)}`}
          color="bg-amber-50 text-amber-600"
          sub="across all exams"
        />
      </div>

      {/* ── Charts grid ───────────────────────────────────────────────────── */}
      {examStats.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-10 text-center text-sm text-gray-400">
          No per-exam data available yet. Results will appear here once students complete exams.
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Chart 1: Pass vs Fail Pie ───────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <BarChart2 size={16} className="text-indigo-500" />
              Overall Pass vs Fail
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                  labelLine={false}
                >
                  <Cell key="pass" fill={PASS_COLOR} />
                  <Cell key="fail" fill={FAIL_COLOR} />
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Average Score per Exam ─────────────────────────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-indigo-500" />
              Average Score per Exam
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={avgScoreData}
                margin={{ top: 5, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="Avg Score" fill={AVG_COLOR} radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 3: Pass vs Fail counts per Exam (full width) ─────────── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 xl:col-span-2">
            <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              Pass vs Fail Count per Exam
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={passFailData}
                margin={{ top: 5, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  formatter={(value) => (
                    <span className="text-xs text-gray-600">{value}</span>
                  )}
                />
                <Bar dataKey="Pass" fill={PASS_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Fail" fill={FAIL_COLOR} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
