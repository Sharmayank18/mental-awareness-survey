import { motion, AnimatePresence } from 'framer-motion';
import { OPTIONS } from '../data/questions';

const variants = {
  enter: { x: 60, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -60, opacity: 0 },
};

export default function QuestionCard({ question, index, onAnswer }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={question.id}
        variants={variants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="glass p-8 w-full max-w-xl mx-auto"
      >
        <span className="text-xs font-semibold uppercase tracking-widest text-indigo-300 mb-3 block">
          {question.topic}
        </span>
        <h2 className="text-xl font-semibold text-white mb-8 leading-relaxed">
          {question.text}
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {OPTIONS.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onAnswer(i)}
              className="text-left px-5 py-4 rounded-xl border border-white/20 bg-white/5 hover:bg-indigo-500/30 hover:border-indigo-400 text-white transition-all duration-200 font-medium"
            >
              <span className="text-indigo-300 mr-3 font-bold">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
