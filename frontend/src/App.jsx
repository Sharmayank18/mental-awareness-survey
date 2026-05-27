import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUESTIONS } from './data/questions';
import ProgressBar from './components/ProgressBar';
import QuestionCard from './components/QuestionCard';
import UserDetailsModal from './components/UserDetailsModal';
import ResultPage from './components/ResultPage';
import AdminDashboard from './components/AdminDashboard';
import { submitSurvey } from './utils/api';

// Screens: landing | quiz | details | result | admin
export default function App() {
  const [screen, setScreen] = useState('landing');
  const [answers, setAnswers] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /*... is called the spread operator in JavaScript.
It is used to:
copy values
expand arrays
expand objects */

  const handleAnswer = (value) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    if (currentQ + 1 < QUESTIONS.length) {
      setCurrentQ(q => q + 1);
    } else {
      setScreen('details');
    }
  };

  const handleDetailsSubmit = async (userInfo) => {
    setLoading(true);
    setError('');
    try {
      const { data } = await submitSurvey({ ...userInfo, answers });
      setResult(data);
      setScreen('result');
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const retake = () => {
    setAnswers([]);
    setCurrentQ(0);
    setResult(null);
    setScreen('landing');
  };

  if (screen === 'admin') return <AdminDashboard onBack={retake} />;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧠</span>
          <span className="font-semibold text-white">MindCheck</span>
        </div>
        <button onClick={() => setScreen('admin')} className="text-white/40 hover:text-white/70 text-xs transition-colors">
          Admin
        </button>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center p-4 py-8">
        <AnimatePresence mode="wait">

          {/* Landing */}
          {screen === 'landing' && (
            <motion.div key="landing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }} className="text-center max-w-lg mx-auto">
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }} className="text-7xl mb-6">🧠</motion.div>
              <h1 className="text-4xl font-bold text-white mb-3">Mental Awareness Survey</h1>
              <p className="text-white/60 mb-2 leading-relaxed">
                A quick 12-question check-in to understand your mental wellness. No registration needed.
              </p>
              <p className="text-white/30 text-xs mb-8">
                ⚠️ This survey is not a medical diagnosis. For awareness and self-reflection only.
              </p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setScreen('quiz')} className="btn-primary text-lg px-10 py-4">
                Start Survey →
              </motion.button>
            </motion.div>
          )}

          {/* Quiz */}
          {screen === 'quiz' && (
            <motion.div key="quiz" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} className="w-full max-w-xl mx-auto space-y-6">
              <ProgressBar current={currentQ + 1} total={QUESTIONS.length} />
              <QuestionCard question={QUESTIONS[currentQ]} index={currentQ} onAnswer={handleAnswer} />
            </motion.div>
          )}

          {/* Result */}
          {screen === 'result' && result && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0 }} className="w-full max-w-xl mx-auto">
              <ResultPage result={result} onRetake={retake} />
            </motion.div>
          )}

          {/* Completed but no details yet — show "View Result" button */}
          {screen === 'completed' && (
            <motion.div key="completed" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }} className="text-center glass p-10 max-w-sm mx-auto">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-2xl font-bold text-white mb-2">Survey Complete!</h2>
              <p className="text-white/60 mb-6">You've answered all questions. Ready to see your result?</p>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setScreen('details')} className="btn-primary w-full">
                View Result →
              </motion.button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* User Details Modal */}
        {screen === 'details' && (
          <>
            {error && (
              <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500/90 text-white px-6 py-3 rounded-xl text-sm z-50">
                {error}
              </div>
            )}
            <UserDetailsModal onSubmit={handleDetailsSubmit} loading={loading} />
          </>
        )}
      </main>
    </div>
  );
}
