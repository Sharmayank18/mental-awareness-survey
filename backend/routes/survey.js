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
    const { name, email, age, gender, country, answers } = req.body;
    if (!name || !email || !age || !gender || !country || !answers?.length) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const score = answers.reduce((sum, a) => sum + a, 0);
    const maxScore = answers.length * 3;
    const category = getCategory(score, maxScore);

    const survey = await Survey.create({ name, email, age, gender, country, answers, score, category });
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

    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="wellness-report-${survey._id}.pdf"`);
    doc.pipe(res);

    // Soft gradient background
    doc.rect(0, 0, doc.page.width, doc.page.height).fill('#f8f9ff');
    
    // Decorative header background
    doc.rect(0, 0, doc.page.width, 140).fill('#eef2ff');
    
    // Title
    doc.fontSize(24).fillColor('#4f46e5').font('Helvetica-Bold')
       .text('Mental Wellness Report', 50, 40, { align: 'center' });
    
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#6b7280').font('Helvetica')
       .text('This survey is not a medical diagnosis. It is intended only for awareness and self-reflection.', 
             { align: 'center', width: doc.page.width - 100 });

    // User info card
    const cardY = 160;
    doc.roundedRect(50, cardY, doc.page.width - 100, 80, 8).fill('#ffffff');
    doc.roundedRect(50, cardY, doc.page.width - 100, 80, 8).stroke('#e5e7eb');
    
    doc.fontSize(11).fillColor('#111827').font('Helvetica-Bold')
       .text('Personal Information', 65, cardY + 15);
    
    // Remove emoji from country for PDF (emojis don't render properly in PDFKit)
    const countryText = survey.country.replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '').trim();
    
    doc.fontSize(10).fillColor('#4b5563').font('Helvetica')
       .text(`Name: ${survey.name}`, 65, cardY + 35)
       .text(`Age: ${survey.age}`, 65, cardY + 52)
       .text(`Gender: ${survey.gender}`, 220, cardY + 52)
       .text(`Country: ${countryText}`, 350, cardY + 52)
       .text(`Date: ${new Date(survey.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}`, 65, cardY + 69);

    // Score card
    const scoreY = cardY + 100;
    const maxScore = survey.answers.length * 3;
    const pct = Math.round((survey.score / maxScore) * 100);
    
    doc.roundedRect(50, scoreY, doc.page.width - 100, 90, 8).fill('#ffffff');
    doc.roundedRect(50, scoreY, doc.page.width - 100, 90, 8).stroke('#e5e7eb');
    
    doc.fontSize(11).fillColor('#111827').font('Helvetica-Bold')
       .text('Your Score', 65, scoreY + 15);
    
    doc.fontSize(28).fillColor('#4f46e5').font('Helvetica-Bold')
       .text(`${pct}%`, 65, scoreY + 35);
    
    doc.fontSize(10).fillColor('#6b7280').font('Helvetica')
       .text(`${survey.score} out of ${maxScore}`, 65, scoreY + 70);
    
    // Category badge
    doc.roundedRect(doc.page.width - 220, scoreY + 35, 150, 30, 15)
       .fillAndStroke('#eef2ff', '#4f46e5');
    doc.fontSize(10).fillColor('#4f46e5').font('Helvetica-Bold')
       .text(survey.category, doc.page.width - 215, scoreY + 43, { width: 140, align: 'center' });

    // Feedback section
    const feedbackY = scoreY + 110;
    doc.roundedRect(50, feedbackY, doc.page.width - 100, 75, 8).fill('#ffffff');
    doc.roundedRect(50, feedbackY, doc.page.width - 100, 75, 8).stroke('#e5e7eb');
    
    doc.fontSize(11).fillColor('#4f46e5').font('Helvetica-Bold')
       .text('Feedback', 65, feedbackY + 15);
    
    doc.fontSize(9).fillColor('#374151').font('Helvetica')
       .text(FEEDBACK[survey.category], 65, feedbackY + 35, { 
         width: doc.page.width - 130, 
         align: 'left',
         lineGap: 2
       });

    // Suggestions section
    const suggestionsY = feedbackY + 95;
    const suggestions = SUGGESTIONS[survey.category];
    const suggestionHeight = 45 + (suggestions.length * 18);
    
    doc.roundedRect(50, suggestionsY, doc.page.width - 100, suggestionHeight, 8).fill('#ffffff');
    doc.roundedRect(50, suggestionsY, doc.page.width - 100, suggestionHeight, 8).stroke('#e5e7eb');
    
    doc.fontSize(11).fillColor('#4f46e5').font('Helvetica-Bold')
       .text('Wellness Suggestions', 65, suggestionsY + 15);
    
    let yPos = suggestionsY + 38;
    suggestions.forEach((s, i) => {
      doc.fontSize(9).fillColor('#374151').font('Helvetica')
         .text(`${i + 1}.`, 70, yPos)
         .text(s, 85, yPos, { width: doc.page.width - 150 });
      yPos += 18;
    });

    // Footer
    const footerY = doc.page.height - 60;
    doc.fontSize(7).fillColor('#9ca3af').font('Helvetica')
       .text('Generated by MindCheck - Mental Awareness Survey Platform', 50, footerY, { 
         align: 'center',
         width: doc.page.width - 100
       });
    
    doc.fontSize(7).fillColor('#d1d5db')
       .text('If you need professional help, please consult a licensed mental health professional.', 50, footerY + 12, {
         align: 'center',
         width: doc.page.width - 100
       });

    doc.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
