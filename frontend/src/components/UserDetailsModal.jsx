import { useState } from 'react';
import { motion } from 'framer-motion';

export default function UserDetailsModal({ onSubmit, loading }) {
  const [form, setForm] = useState({ name: '', email: '', age: '', gender: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Enter a valid email address';
    if (!form.age || form.age < 10 || form.age > 100) e.age = 'Enter a valid age (10–100)';
    if (!form.gender) e.gender = 'Please select gender';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({ ...form, age: Number(form.age) });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="glass p-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-white mb-1">Almost there! 🎉</h2>
        <p className="text-white/50 text-sm mb-6">Enter your details to see your result.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input className="input-field" placeholder="Full Name" value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <input className="input-field" type="email" placeholder="Email Address"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input className="input-field" type="number" placeholder="Age" value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))} />
              {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
            </div>
            <div>
              <select className="input-field" value={form.gender}
                onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                <option value="" disabled>Gender</option>
                {['Male', 'Female', 'Others'].map(g => (
                  <option key={g} value={g} className="bg-slate-800">{g}</option>
                ))}
              </select>
              {errors.gender && <p className="text-red-400 text-xs mt-1">{errors.gender}</p>}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
            {loading && (
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            )}
            {loading ? 'Submitting...' : 'View My Result →'}
          </button>
        </form>

        <p className="text-white/20 text-xs text-center mt-6">
          This survey is not a medical diagnosis. For awareness only.
        </p>
      </motion.div>
    </motion.div>
  );
}
