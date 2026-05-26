import { motion } from 'framer-motion';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../data/questions';
import { getPdfUrl } from '../utils/api';

function CircleScore({ score, maxScore, color }) {
  const pct = score / maxScore;
  const r = 54, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  const dash = circumference * pct;

  return (
    <svg width="128" height="128" className="rotate-[-90deg]">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference - dash }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      />
    </svg>
  );
}

export default function ResultPage({ result, onRetake }) {
  const { id, name, score, maxScore, category, feedback, suggestions } = result;
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const pct = Math.round((score / maxScore) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="glass p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}
          className="text-5xl mb-3">{icon}</motion.div>
        <h1 className="text-2xl font-bold text-white">Hi, {name}! 👋</h1>
        <p className="text-white/60 text-sm mt-1">Here's your mental wellness report</p>

        {/* Circle */}
        <div className="relative inline-flex items-center justify-center my-6">
          <CircleScore score={score} maxScore={maxScore} color={color} />
          <div className="absolute text-center">
            <div className="text-2xl font-bold text-white">{pct}%</div>
            <div className="text-xs text-white/50">{score}/{maxScore}</div>
          </div>
        </div>

        <div className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
          style={{ backgroundColor: color + '33', color }}>
          {category}
        </div>
      </div>

      {/* Feedback */}
      <div className="glass p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-300 mb-2">Feedback</h3>
        <p className="text-white/80 leading-relaxed">{feedback}</p>
      </div>

      {/* Suggestions */}
      <div className="glass p-6">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-indigo-300 mb-3">Wellness Suggestions</h3>
        <ul className="space-y-2">
          {suggestions.map((s, i) => (
            <motion.li key={i} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 * i }}
              className="flex items-start gap-2 text-white/80">
              <span className="text-indigo-400 mt-0.5">✦</span> {s}
            </motion.li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-white/30 text-xs px-4">
        ⚠️ This survey is not a medical diagnosis. It is intended only for awareness and self-reflection.
      </p>

      {/* Actions */}
      <div className="flex gap-3">
        <a href={getPdfUrl(id)} target="_blank" rel="noreferrer" className="btn-primary flex-1 text-center">
          ⬇ Download PDF
        </a>
        <button onClick={onRetake} className="btn-outline flex-1">Retake Survey</button>
      </div>
    </motion.div>
  );
}
