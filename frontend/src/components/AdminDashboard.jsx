import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminApi } from '../utils/api';
import { CATEGORY_COLORS } from '../data/questions';

const CATEGORIES = ['', 'Healthy Mindset', 'Mild Stress', 'Moderate Emotional Distress', 'High Mental Wellness Concern'];

export default function AdminDashboard({ onBack }) {
  const [secret, setSecret] = useState('');
  const [authed, setAuthed] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [results, setResults] = useState([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  const login = async (e) => {
    e.preventDefault();
    try {
      await adminApi.getAnalytics(secret);
      setAuthed(true);
      setError('');
    } catch { setError('Invalid admin secret'); }
  };

  useEffect(() => {
    if (!authed) return;
    Promise.all([
      adminApi.getAnalytics(secret),
      adminApi.getResults({ category: filter, page, limit: 10 }, secret)
    ]).then(([a, r]) => {
      setAnalytics(a.data);
      setResults(r.data.results);
      setTotalPages(r.data.pages);
    }).catch(() => setError('Failed to load data'));
  }, [authed, filter, page]);

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-white mb-6">Admin Login</h2>
        <form onSubmit={login} className="space-y-4">
          <input className="input-field" type="password" placeholder="Admin Secret" value={secret}
            onChange={e => setSecret(e.target.value)} />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" className="btn-primary w-full">Login</button>
          <button type="button" onClick={onBack} className="btn-outline w-full">← Back</button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              fetch('http://localhost:5001/api/admin/export', { headers: { 'x-admin-secret': secret } })
                .then(r => r.blob())
                .then(blob => {
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = 'survey-export.csv'; a.click();
                  URL.revokeObjectURL(url);
                });
            }}
            className="btn-outline text-sm py-2 px-4">Export CSV</button>
          <button onClick={onBack} className="btn-outline text-sm py-2 px-4">← Back</button>
        </div>
      </div>

      {/* Analytics */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="glass p-5 text-center">
            <div className="text-3xl font-bold text-white">{analytics.total}</div>
            <div className="text-white/50 text-sm mt-1">Total Responses</div>
          </div>
          <div className="glass p-5 text-center">
            <div className="text-3xl font-bold text-white">{analytics.averageScore}</div>
            <div className="text-white/50 text-sm mt-1">Avg Score</div>
          </div>
          {Object.entries(analytics.byCategory).map(([cat, count]) => (
            <div key={cat} className="glass p-5 text-center">
              <div className="text-2xl font-bold" style={{ color: CATEGORY_COLORS[cat] }}>{count}</div>
              <div className="text-white/50 text-xs mt-1">{cat}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setFilter(c); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === c ? 'bg-indigo-500 text-white' : 'btn-outline'}`}>
            {c || 'All'}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-white/50 text-left">
                {['Name', 'Email', 'Age', 'Gender', 'Score', 'Category', 'Date'].map(h => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map(r => (
                <tr key={r._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                  <td className="px-4 py-3 text-white/60">{r.email}</td>
                  <td className="px-4 py-3 text-white/60">{r.age}</td>
                  <td className="px-4 py-3 text-white/60">{r.gender}</td>
                  <td className="px-4 py-3 text-white">{r.score}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: CATEGORY_COLORS[r.category] + '33', color: CATEGORY_COLORS[r.category] }}>
                      {r.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/40">{new Date(r.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {!results.length && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-white/30">No results found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm ${page === p ? 'bg-indigo-500 text-white' : 'btn-outline py-0 px-0'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
