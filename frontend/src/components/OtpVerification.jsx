import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const API = `${import.meta.env.VITE_API_URL}/auth`;
const OTP_TTL = 120; // seconds
const RESEND_COOLDOWN = 60; // seconds

export default function OtpVerification({ email, onVerified, onBack }) {
  const [digits, setDigits] = useState(Array(4).fill(''));
  const [timeLeft, setTimeLeft] = useState(OTP_TTL);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [status, setStatus] = useState('idle'); // idle | verifying | error | success
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef([]);

  // OTP expiry countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    if (val && i < 3) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (pasted.length === 4) {
      setDigits(pasted.split(''));
      inputRefs.current[3]?.focus();
    }
  };

  const verify = async () => {
    const otp = digits.join('');
    if (otp.length < 4) return;
    if (timeLeft <= 0) { setErrorMsg('OTP expired. Please request a new one.'); return; }
    setStatus('verifying');
    setErrorMsg('');
    try {
      await axios.post(`${API}/verify-otp`, { email, otp });
      setStatus('success');
      setTimeout(onVerified, 600);
    } catch (e) {
      setStatus('error');
      setErrorMsg(e.response?.data?.error || 'Verification failed');
      setDigits(Array(4).fill(''));
      inputRefs.current[0]?.focus();
    }
  };

  const resend = async () => {
    if (cooldown > 0) return;
    setDigits(Array(4).fill(''));
    setErrorMsg('');
    setStatus('idle');
    try {
      await axios.post(`${API}/send-otp`, { email });
      setTimeLeft(OTP_TTL);
      setCooldown(RESEND_COOLDOWN);
      inputRefs.current[0]?.focus();
    } catch (e) {
      setErrorMsg(e.response?.data?.error || 'Failed to resend OTP');
    }
  };

  const otp = digits.join('');
  const expired = timeLeft <= 0;

  return (
    <div className="space-y-6 text-center">
      <div>
        <p className="text-white/60 text-sm">OTP sent to</p>
        <p className="text-indigo-300 font-medium">{email}</p>
      </div>

      {/* Digit boxes */}
      <div className="flex justify-center gap-3" onPaste={handlePaste}>
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text" inputMode="numeric" maxLength={1}
            value={d}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            whileFocus={{ scale: 1.08 }}
            className={`w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-white/10 text-white outline-none transition-all
              ${d ? 'border-indigo-400' : 'border-white/20'}
              ${status === 'error' ? 'border-red-400' : ''}
              ${status === 'success' ? 'border-green-400' : ''}
              focus:border-indigo-400`}
          />
        ))}
      </div>

      {/* Timer */}
      <div className="flex items-center justify-center gap-2">
        {!expired ? (
          <>
            <div className={`w-2 h-2 rounded-full ${timeLeft <= 30 ? 'bg-red-400 animate-pulse' : 'bg-green-400'}`} />
            <span className={`text-sm font-mono ${timeLeft <= 30 ? 'text-red-400' : 'text-white/60'}`}>
              {fmt(timeLeft)}
            </span>
          </>
        ) : (
          <span className="text-red-400 text-sm">OTP expired</span>
        )}
      </div>

      {errorMsg && (
        <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
          className="text-red-400 text-sm">{errorMsg}</motion.p>
      )}

      {/* Verify button */}
      <button
        onClick={verify}
        disabled={otp.length < 4 || status === 'verifying' || status === 'success' || expired}
        className="btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {status === 'verifying' && (
          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        )}
        {status === 'success' ? '✓ Verified!' : status === 'verifying' ? 'Verifying...' : 'Verify OTP'}
      </button>

      {/* Resend */}
      <button onClick={resend} disabled={cooldown > 0}
        className="text-sm text-white/40 hover:text-indigo-300 disabled:cursor-not-allowed transition-colors">
        {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
      </button>

      <button onClick={onBack} className="block text-xs text-white/30 hover:text-white/60 mx-auto transition-colors">
        ← Change email
      </button>
    </div>
  );
}
