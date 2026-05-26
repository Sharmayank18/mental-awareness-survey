export default function ProgressBar({ current, total }) {
  const pct = ((current) / total) * 100;
  return (
    <div className="w-full">
      <div className="flex justify-between text-sm text-white/60 mb-2">
        <span>Question {current} of {total}</span>
        <span>{Math.round(pct)}% complete</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
