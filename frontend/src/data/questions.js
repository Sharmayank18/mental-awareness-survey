// 12 MCQ questions covering stress, anxiety, sleep, burnout, motivation, social interaction
// Each answer value: 0=Never, 1=Sometimes, 2=Often, 3=Always
export const OPTIONS = ['Never', 'Sometimes', 'Often', 'Always'];

export const QUESTIONS = [
  { id: 1, topic: 'Stress', text: 'Do you feel overwhelmed by your daily responsibilities?' },
  { id: 2, topic: 'Anxiety', text: 'Do you experience racing thoughts or excessive worry?' },
  { id: 3, topic: 'Sleep', text: 'Do you have trouble falling or staying asleep?' },
  { id: 4, topic: 'Burnout', text: 'Do you feel emotionally drained after a regular day?' },
  { id: 5, topic: 'Overthinking', text: 'Do you replay past events or conversations in your mind?' },
  { id: 6, topic: 'Motivation', text: 'Do you find it hard to feel motivated or interested in activities?' },
  { id: 7, topic: 'Social', text: 'Do you avoid social interactions or feel isolated?' },
  { id: 8, topic: 'Emotional Balance', text: 'Do you experience sudden mood swings or emotional outbursts?' },
  { id: 9, topic: 'Stress', text: 'Do you feel physical symptoms of stress (headaches, tension, fatigue)?' },
  { id: 10, topic: 'Anxiety', text: 'Do you feel a sense of dread or unease without a clear reason?' },
  { id: 11, topic: 'Burnout', text: 'Do you feel like your efforts go unnoticed or unappreciated?' },
  { id: 12, topic: 'Emotional Balance', text: 'Do you struggle to relax even when you have free time?' },
];

export const CATEGORY_COLORS = {
  'Healthy Mindset': '#10b981',
  'Mild Stress': '#f59e0b',
  'Moderate Emotional Distress': '#f97316',
  'High Mental Wellness Concern': '#ef4444',
};

export const CATEGORY_ICONS = {
  'Healthy Mindset': '🌿',
  'Mild Stress': '🌤️',
  'Moderate Emotional Distress': '🌧️',
  'High Mental Wellness Concern': '⛈️',
};
