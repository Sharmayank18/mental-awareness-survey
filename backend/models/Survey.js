const mongoose = require('mongoose');

const surveySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Non-binary', 'Prefer not to say'] },
  answers: [{ type: Number, min: 0, max: 3 }], // 0=Never,1=Sometimes,2=Often,3=Always
  score: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Healthy Mindset', 'Mild Stress', 'Moderate Emotional Distress', 'High Mental Wellness Concern']
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Survey', surveySchema);
