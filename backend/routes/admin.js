const express = require('express');
const router = express.Router();
const Survey = require('../models/Survey');

// Simple secret-based auth middleware
const auth = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_SECRET) return res.status(401).json({ error: 'Unauthorized' });
  next();
};

// GET /api/admin/results?category=&page=&limit=
//ceil is for rounding decimal ,,, pages are total pages available and page is on which user is present
router.get('/results', auth, async (req, res) => {
  try {
    const { category, page = 1, limit = 20 } = req.query;
    const filter = category ? { category } : {};
    const [results, total] = await Promise.all([
      Survey.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)),
      Survey.countDocuments(filter)
    ]);
    res.json({ results, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/analytics
/*You are asking MongoDB to do 3 tasks together:

count total surveys
calculate category counts
calculate average score

Instead of doing one-by-one slowly: */
router.get('/analytics', auth, async (req, res) => {
  try {
    const [total, byCat, avgScore] = await Promise.all([
      Survey.countDocuments(),
      Survey.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Survey.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }])//id is null because we want overall average score not grouped by category
    ]);
    //sending result in json to frontend
    res.json({
      total,
      byCategory: byCat.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}), //bycat is array of { _id: category, count: number }, we convert to object like { "Healthy Mindset": 10, ... }
      averageScore: avgScore[0]?.avg?.toFixed(1) ?? 0 //get avg from result, round to 1 decimal, default to 0 if no surveys
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/export — CSV export
router.get('/export', auth, async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    const header = 'Name,Email,Age,Gender,Country,Score,Category,Date,Time\n';
    const rows = surveys.map(s => {
      const date = new Date(s.createdAt);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const timeStr = date.toTimeString().split(' ')[0]; // HH:MM:SS in 24-hour format
      return `"${s.name}","${s.email}",${s.age},"${s.gender}","${s.country}",${s.score},"${s.category}","${dateStr}","${timeStr}"`;
    }).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    //this header tells browser to download file instead of showing in browser, and gives it a name
    res.setHeader('Content-Disposition', 'attachment; filename="survey-export.csv"');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
