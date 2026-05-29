const mongoose = require('mongoose');
//trim for removing extra spaces
const surveySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Others'] },
  answers: [{ type: Number, min: 0, max: 3 }], // 0=Never,1=Sometimes,2=Often,3=Always
  score: { type: Number, required: true },
  category: {
    type: String,
    required: true,
    enum: ['Healthy Mindset', 'Mild Stress', 'Moderate Emotional Distress', 'High Mental Wellness Concern']
  },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Survey', surveySchema);
