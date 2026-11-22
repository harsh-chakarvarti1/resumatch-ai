import React, { useState, useEffect } from 'react';
import {
  FileText,
  Briefcase,
  CheckCircle2,
  XCircle,
  Sparkles,
  Search,
  Trash2,
  Building2,
  Clock,
} from 'lucide-react';

interface ScanRecord {
  id: number;
  resume_title: string;
  target_role: string;
  company_name: string;
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  status: string;
  created_at: string;
}

const API_URL = '/api';

const STATUS_OPTIONS = ['Scanned', 'Applied', 'Interview', 'Offer', 'Rejected'];

export default function App() {
  const [resumeTitle, setResumeTitle] = useState('FullStack_Resume_v1');
  const [targetRole, setTargetRole] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [activeScan, setActiveScan] = useState<ScanRecord | null>(null);
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${API_URL}/scans?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data);
    } catch {
      console.error('Failed to load scan history');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [statusFilter, searchQuery]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please paste both your resume text and the target job description.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeTitle,
          targetRole: targetRole || 'Software Engineer',
          companyName: companyName || 'Target Org',
          resumeText,
          jobDescription,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Analysis failed');

      setActiveScan(data);
      fetchHistory();
    } catch (err: any) {
      setError(err.message || 'Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`${API_URL}/scans/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setHistory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        );
        if (activeScan?.id === id) {
          setActiveScan({ ...activeScan, status: newStatus });
        }
      }
    } catch {
      console.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetch(`${API_URL}/scans/${id}`, { method: 'DELETE' });
      setHistory((prev) => prev.filter((item) => item.id !== id));
      if (activeScan?.id === id) setActiveScan(null);
    } catch {
      console.error('Failed to delete scan');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const loadSampleData = () => {
    setTargetRole('Full Stack Engineer');
    setCompanyName('Rezifi');
    setResumeText(
      `Experienced Full Stack Developer proficient in TypeScript, React, Tailwind CSS, Node.js, Hono, and PostgreSQL. Built scalable REST APIs, automated CI/CD pipelines, and responsive user dashboards with strong unit testing.`
    );
    setJobDescription(
      `We are hiring a Full Stack Engineer to build our ATS resume scorer and job tracker. Required skills: TypeScript, React, Tailwind CSS, Node.js, Hono, PostgreSQL, Docker, AWS, and system design.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-slate-900">ResuMatch AI</h1>
              <p className="text-xs text-slate-500">ATS Keyword Scorer & Application Tracker</p>
            </div>
          </div>
          <button
            type="button"
            onClick={loadSampleData}
            className="text-xs font-medium px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition"
          >
            Fill Sample Data
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleAnalyze}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4"
          >
            <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              New ATS Resume Scan
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Resume Label</label>
                <input
                  type="text"
                  value={resumeTitle}
                  onChange={(e) => setResumeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. SWE_Resume_2026"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Target Role</label>
                <input
                  type="text"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Full Stack Engineer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Company</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Rezifi"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Paste Resume Content *
                </label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste plain text from your resume..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Paste Job Description *
                </label>
                <textarea
                  rows={8}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job requirements & description..."
                  className="w-full p-3 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium text-sm rounded-lg transition cursor-pointer"
            >
              {loading ? 'Analyzing Keywords & Saving to Postgres...' : 'Run ATS Match Analysis'}
            </button>
          </form>

          {activeScan && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
                    Latest Scan Result
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    {activeScan.target_role} @ {activeScan.company_name}
                  </h3>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl border text-center ${getScoreColor(
                    activeScan.ats_score
                  )}`}
                >
                  <div className="text-2xl font-extrabold">{activeScan.ats_score}%</div>
                  <div className="text-[11px] font-medium uppercase">ATS Match</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Keywords ({activeScan.matched_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeScan.matched_keywords.length > 0 ? (
                      activeScan.matched_keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No direct keyword hits</span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-rose-700 flex items-center gap-1.5 mb-2">
                    <XCircle className="w-4 h-4" />
                    Missing Keywords ({activeScan.missing_keywords.length})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeScan.missing_keywords.length > 0 ? (
                      activeScan.missing_keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 rounded-md"
                        >
                          {kw}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">Zero missing keywords!</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <aside className="lg:col-span-5">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-800 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Application Tracker ({history.length})
              </h2>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by role, company, or resume..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['All', ...STATUS_OPTIONS].map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                      statusFilter === st
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-8">
                  No scans recorded yet. Run your first ATS match!
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveScan(item)}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-white transition cursor-pointer space-y-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-sm text-slate-900">{item.target_role}</h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3 h-3" /> {item.company_name} • {item.resume_title}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs font-bold rounded border ${getScoreColor(
                          item.ats_score
                        )}`}
                      >
                        {item.ats_score}%
                      </span>
                    </div>

                    <div
                      className="flex items-center justify-between pt-2 border-t border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value)}
                          className="text-xs bg-white border border-slate-300 rounded px-2 py-0.5 text-slate-700 focus:outline-none"
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition cursor-pointer"
                          title="Delete record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
