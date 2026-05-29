import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import OtpVerification from './OtpVerification';

const GMAIL_RE = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
const API = `${import.meta.env.VITE_API_URL}/auth`;

// step: 'details' | 'otp'
export default function UserDetailsModal({ onSubmit, loading }) {
  const [step, setStep] = useState('details');
  const [form, setForm] = useState({ name: '', email: '', age: '', gender: '' });
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!GMAIL_RE.test(form.email)) e.email = 'Enter a valid Gmail address (@gmail.com)';
    if (!form.age || form.age < 10 || form.age > 100) e.age = 'Enter a valid age (10–100)';
    if (!form.gender) e.gender = 'Please select gender';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSending(true);
    setSendError('');
    try {
      await axios.post(`${API}/send-otp`, { email: form.email });
      setStep('otp');
    } catch (err) {
      setSendError(err.response?.data?.error || 'Failed to send OTP. Try again.');
    } finally {
      setSending(false);
    }
  };

  const handleVerified = () => {
    onSubmit({ ...form, age: Number(form.age), emailVerified: true });
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
        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-6">
          {['Details', 'Verify Email'].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors
                ${(step === 'details' ? 0 : 1) >= i ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                {i + 1}
              </div>
              <span className={`text-xs ${(step === 'details' ? 0 : 1) >= i ? 'text-white/80' : 'text-white/30'}`}>
                {label}
              </span>
              {i < 1 && <div className="w-6 h-px bg-white/20 mx-1" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 'details' && (
            <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold text-white mb-1">Almost there! 🎉</h2>
              <p className="text-white/50 text-sm mb-6">Enter your details to receive your OTP.</p>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <input className="input-field" placeholder="Full Name" value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <input className="input-field" type="email" placeholder="Gmail Address"
                    value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  {errors.email
                    ? <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                    : form.email && !GMAIL_RE.test(form.email)
                      ? <p className="text-yellow-400 text-xs mt-1">Must be a @gmail.com address</p>
                      : form.email && <p className="text-green-400 text-xs mt-1">✓ Valid Gmail</p>
                  }
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

                {sendError && <p className="text-red-400 text-sm">{sendError}</p>}

                <button type="submit" disabled={sending}
                  className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                  {sending && (
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                  )}
                  {sending ? 'Sending OTP...' : 'Send OTP to Gmail →'}
                </button>
              </form>
            </motion.div>
          )}

          {step === 'otp' && (
            <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <h2 className="text-2xl font-bold text-white mb-1">Check your Gmail 📬</h2>
              <p className="text-white/50 text-sm mb-6">Enter the 4-digit code we sent you.</p>
              <OtpVerification
                email={form.email}
                onVerified={handleVerified}
                onBack={() => setStep('details')}
              />
              {loading && (
                <p className="text-center text-white/50 text-sm mt-4 animate-pulse">Saving your result...</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-white/20 text-xs text-center mt-6">
          This survey is not a medical diagnosis. For awareness only.
        </p>
      </motion.div>
    </motion.div>
  );
}
