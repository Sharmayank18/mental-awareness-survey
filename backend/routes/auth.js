const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Otp = require('../models/Otp');
const { sendOtpEmail } = require('../utils/mailer');

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

// Rate limit: track last send time in memory (per email)
const lastSent = new Map();
const COOLDOWN_MS = 60_000; // 1 min between resends

// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !GMAIL_REGEX.test(email)) {
      return res.status(400).json({ error: 'A valid Gmail address is required' });
    }

    // Cooldown check
    const last = lastSent.get(email);
    if (last && Date.now() - last < COOLDOWN_MS) {
      const wait = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
      return res.status(429).json({ error: `Please wait ${wait}s before requesting a new OTP` });
    }

    // Delete any existing OTP for this email
    await Otp.deleteMany({ email: email.toLowerCase() });

    // Generate 4-digit OTP
    const otp = crypto.randomInt(1000, 9999).toString();
    await Otp.create({ email: email.toLowerCase(), otp });

    await sendOtpEmail(email, otp);
    lastSent.set(email, Date.now());

    res.json({ message: 'OTP sent successfully' });
  } catch (err) {
    console.error('send-otp error:', err.message);
    res.status(500).json({ error: 'Failed to send OTP. Check your email and try again.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    const record = await Otp.findOne({ email: email.toLowerCase(), verified: false });
    if (!record) return res.status(400).json({ error: 'OTP expired or not found. Request a new one.' });
    if (record.otp !== otp.toString()) return res.status(400).json({ error: 'Incorrect OTP' });

    // Mark verified and clean up
    await Otp.deleteOne({ _id: record._id });

    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
