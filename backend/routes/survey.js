const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');
const PDFDocument = require('pdfkit');

// Score → category mapping
function getCategory(score, total) {
  const pct = (score / total) * 100;
  if (pct <= 25) return 'Healthy Mindset';
  if (pct <= 50) return 'Mild Stress';
  if (pct <= 75) return 'Moderate Emotional Distress';
  return 'High Mental Wellness Concern';
}

const FEEDBACK = {
  'Healthy Mindset': 'You have a strong and balanced mental state. Keep nurturing your well-being with healthy habits.',
  'Mild Stress': 'You experience occasional stress. Simple mindfulness practices and regular breaks can help.',
  'Moderate Emotional Distress': 'You may be dealing with noticeable emotional challenges. Consider speaking with a trusted person or counselor.',
  'High Mental Wellness Concern': 'Your responses suggest significant mental wellness concerns. Please consider reaching out to a mental health professional.'
};

const SUGGESTIONS = {
  'Healthy Mindset': ['Maintain your sleep schedule', 'Continue social connections', 'Practice gratitude daily'],
  'Mild Stress': ['Try 10-min daily meditation', 'Limit screen time before bed', 'Take short walks outdoors'],
  'Moderate Emotional Distress': ['Journal your thoughts daily', 'Talk to a trusted friend', 'Reduce caffeine intake', 'Try deep breathing exercises'],
  'High Mental Wellness Concern': ['Consult a mental health professional', 'Establish a daily routine', 'Limit news/social media', 'Prioritize sleep and nutrition']
};

// POST /api/survey — submit survey
router.post('/', async (req, res) => {
  try {
    const { name, email, age, gender, answers } = req.body;
    if (!name || !email || !age || !gender || !answers?.length) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const score = answers.reduce((sum, a) => sum + a, 0);
    const maxScore = answers.length * 3;
    const category = getCategory(score, maxScore);

    const survey = await Survey.create({ name, email, age, gender, answers, score, category });
    res.status(201).json({
      id: survey._id,
      name,
      score,
      maxScore,
      category,
      feedback: FEEDBACK[category],
      suggestions: SUGGESTIONS[category]
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/survey/:id — fetch single result
router.get('/:id', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Not found' });
    res.json({
      ...survey.toObject(),
      feedback: FEEDBACK[survey.category],
      suggestions: SUGGESTIONS[survey.category],
      maxScore: survey.answers.length * 3
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/survey/:id/pdf — download PDF
router.get('/:id/pdf', async (req, res) => {
  try {
    const survey = await Survey.findById(req.params.id);
    if (!survey) return res.status(404).json({ error: 'Not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="wellness-report-${survey._id}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor('#4f46e5').text('Mental Wellness Report', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#6b7280').text('This survey is not a medical diagnosis. It is intended only for awareness and self-reflection.', { align: 'center' });
    doc.moveDown(1);

    // User info
    doc.fontSize(14).fillColor('#111827').text(`Name: ${survey.name}`);
    doc.text(`Email: ${survey.email}`);
    doc.text(`Age: ${survey.age}  |  Gender: ${survey.gender}`);
    doc.text(`Date: ${new Date(survey.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}`);
    doc.moveDown(1);

    // Score
    const maxScore = survey.answers.length * 3;
    doc.fontSize(16).fillColor('#4f46e5').text(`Score: ${survey.score} / ${maxScore}`);
    doc.fontSize(14).fillColor('#111827').text(`Category: ${survey.category}`);
    doc.moveDown(1);

    // Feedback
    doc.fontSize(12).fillColor('#374151').text('Feedback:', { underline: true });
    doc.fontSize(11).fillColor('#4b5563').text(FEEDBACK[survey.category]);
    doc.moveDown(1);

    // Suggestions
    doc.fontSize(12).fillColor('#374151').text('Wellness Suggestions:', { underline: true });
    SUGGESTIONS[survey.category].forEach(s => doc.fontSize(11).fillColor('#4b5563').text(`• ${s}`));

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
