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
router.get('/analytics', auth, async (req, res) => {
  try {
    const [total, byCat, avgScore] = await Promise.all([
      Survey.countDocuments(),
      Survey.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
      Survey.aggregate([{ $group: { _id: null, avg: { $avg: '$score' } } }])
    ]);
    res.json({
      total,
      byCategory: byCat.reduce((acc, c) => ({ ...acc, [c._id]: c.count }), {}),
      averageScore: avgScore[0]?.avg?.toFixed(1) ?? 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/export — CSV export
router.get('/export', auth, async (req, res) => {
  try {
    const surveys = await Survey.find().sort({ createdAt: -1 });
    const header = 'Name,Email,Age,Gender,Score,Category,Date\n';
    const rows = surveys.map(s =>
      `"${s.name}","${s.email}",${s.age},"${s.gender}",${s.score},"${s.category}","${new Date(s.createdAt).toISOString()}"`
    ).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="survey-export.csv"');
    res.send(header + rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
