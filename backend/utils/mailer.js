const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD // Gmail App Password (not account password)
  }
});

const sendOtpEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"MindCheck Survey" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Your MindCheck Verification Code',
    html: `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#f8fafc;border-radius:16px;">
        <h2 style="color:#4f46e5;margin-bottom:8px;">🧠 MindCheck</h2>
        <p style="color:#374151;font-size:15px;">Your one-time verification code is:</p>
        <div style="font-size:40px;font-weight:700;letter-spacing:12px;color:#1e1b4b;background:#e0e7ff;padding:20px;border-radius:12px;text-align:center;margin:20px 0;">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:13px;">This code expires in <strong>2 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#9ca3af;font-size:12px;margin-top:24px;">This survey is not a medical diagnosis. For awareness only.</p>
      </div>
    `
  });
};

module.exports = { sendOtpEmail };
