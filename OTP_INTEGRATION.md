# OTP Verification Integration - Dev Branch

## Overview
Integrated OTP email verification using nodemailer in the dev branch for enhanced security.

## Backend Setup

### Files Created
1. **`backend/models/Otp.js`** - OTP model with 2-minute auto-expiry
2. **`backend/utils/mailer.js`** - Nodemailer configuration for Gmail SMTP
3. **`backend/routes/auth.js`** - Auth endpoints for OTP send/verify

### Files Modified
1. **`backend/server.js`** - Added `/api/auth` route
2. **`backend/routes/survey.js`** - Added `emailVerified` check before submission
3. **`backend/models/Survey.js`** - Added `emailVerified` field
4. **`backend/package.json`** - Added `nodemailer` dependency

### Environment Variables Required
Add to `backend/.env`:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
```

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Search "App passwords"
4. Generate password for "Mail"
5. Copy the 16-digit password

## Frontend Setup

### Files Created
1. **`frontend/src/components/OtpVerification.jsx`** - OTP input component with timer

### Files Modified
1. **`frontend/src/components/UserDetailsModal.jsx`** - Added 2-step flow (details → OTP)

## Features

### OTP System
- ✅ 4-digit OTP generation
- ✅ 2-minute expiry with countdown timer
- ✅ 1-minute cooldown between resend requests
- ✅ Gmail-only validation
- ✅ Rate limiting per email
- ✅ Auto-focus and paste support
- ✅ Visual feedback (success/error states)

### User Flow
1. User completes survey
2. User enters details (name, Gmail, age, gender)
3. OTP sent to Gmail
4. User enters 4-digit OTP with 2-minute timer
5. OTP verified
6. Survey submitted with `emailVerified: true`
7. Result displayed

## API Endpoints

### POST /api/auth/send-otp
Send OTP to email
```json
Request: { "email": "user@gmail.com" }
Response: { "message": "OTP sent successfully" }
```

### POST /api/auth/verify-otp
Verify OTP code
```json
Request: { "email": "user@gmail.com", "otp": "1234" }
Response: { "verified": true }
```

## Installation

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Testing

1. Start backend and frontend servers
2. Complete survey questions
3. Enter Gmail address in details form
4. Check Gmail inbox for OTP
5. Enter OTP within 2 minutes
6. Verify submission success

## Security Features

- Gmail-only restriction
- Rate limiting (1 min cooldown)
- OTP auto-expiry (2 min)
- Server-side verification required
- No survey submission without verified email

## Troubleshooting

**OTP not received:**
- Check Gmail spam folder
- Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` in `.env`
- Ensure 2-Step Verification is enabled
- Check backend console for email sending logs

**"Failed to send OTP" error:**
- Verify Gmail App Password is correct (16 digits, no spaces)
- Check internet connection
- Review backend logs for detailed error

## Branch Strategy

- **main branch**: No OTP (simple email input for production)
- **dev branch**: OTP verification enabled (for testing/staging)

## Notes

- OTP records auto-delete after 2 minutes (MongoDB TTL index)
- Rate limiting uses in-memory Map (resets on server restart)
- For production, consider Redis for rate limiting
- Email template is HTML-formatted with branding
