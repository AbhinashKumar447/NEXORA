const nodemailer = require('nodemailer');

let cachedTransporter = null;

function maskEmail(email) {
  if (!email || typeof email !== 'string') return '';
  const [user, domain] = email.split('@');
  if (!domain) return email;
  return `${String(user || '').slice(0, 2)}***@${domain}`;
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error(
      'EMAIL_USER/EMAIL_PASS must be set to send OTP emails (ensure dotenv is loaded in server startup)'
    );
  }
  if (
    String(user).includes('your_email') ||
    String(pass).includes('your_app_password') ||
    String(pass).toLowerCase().includes('app_password')
  ) {
    throw new Error(
      'EMAIL_USER/EMAIL_PASS are placeholders. Set a real Gmail address and an App Password to send OTP emails.'
    );
  }

  const mailDebug = String(process.env.MAIL_DEBUG || '').toLowerCase() === 'true';

  // Gmail: use App Password (recommended). We default to STARTTLS (587).
  // If you prefer implicit TLS, set SMTP_PORT=465 and SMTP_SECURE=true in .env.
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpSecure = String(process.env.SMTP_SECURE || 'false') === 'true';

  cachedTransporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    auth: { user, pass },
    port: smtpPort,
    secure: smtpSecure,
    family: Number(process.env.SMTP_FAMILY || 4),
    requireTLS: String(process.env.SMTP_REQUIRE_TLS || 'true') === 'true',
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 10_000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 10_000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 20_000),
    logger: mailDebug,
    debug: mailDebug,
    tls: {
      rejectUnauthorized: true,
    },
  });

  if (mailDebug) {
    console.log('[mail] transporter created', {
      service: 'gmail',
      user: maskEmail(user),
      port: smtpPort,
      secure: smtpSecure,
    });
  }

  return cachedTransporter;
}

async function sendOTP(email, otp) {
  const transporter = getTransporter();
  const mailDebug = String(process.env.MAIL_DEBUG || '').toLowerCase() === 'true';

  try {
    const sendPromise = transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It is valid for 5 minutes.`,
    });

    const hardTimeoutMs = Number(process.env.SMTP_SEND_TIMEOUT_MS || 15_000);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email send timed out')), hardTimeoutMs);
    });

    const info = await Promise.race([sendPromise, timeoutPromise]);
    if (mailDebug) {
      console.log('[mail] OTP sent', {
        to: maskEmail(email),
        messageId: info && info.messageId ? info.messageId : undefined,
        response: info && info.response ? info.response : undefined,
      });
    }
    return { success: true, messageId: info && info.messageId ? info.messageId : undefined };
  } catch (err) {
    const details = {
      message: err && err.message ? err.message : 'Failed to send email',
      code: err && err.code ? err.code : undefined,
      response: err && err.response ? err.response : undefined,
      responseCode: err && err.responseCode ? err.responseCode : undefined,
      command: err && err.command ? err.command : undefined,
    };

    console.error('[mail] OTP send failed', { to: maskEmail(email), ...details });
    return { success: false, error: details };
  }
}

module.exports = { sendOTP };