const nodemailer = require('nodemailer');

// Reads SMTP credentials from server/.env. Works with Gmail (using an
// App Password), Outlook, or any SMTP provider (SendGrid, Mailgun, etc).
// See server/.env.example for the exact variables needed.
let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return transporter;
}

async function sendOtpEmail(toEmail, name, otp) {
  const t = getTransporter();
  if (!t) {
    // No SMTP configured - fail loudly server-side so it's obvious in logs,
    // but don't leak the OTP to the client/logs in a way that defeats the point.
    throw new Error(
      'Email is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS in server/.env to enable OTP emails.'
    );
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await t.sendMail({
    from: `"Qupon" <${from}>`,
    to: toEmail,
    subject: `${otp} is your Qupon verification code`,
    text: `Hi ${name},\n\nYour Qupon verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="background: #ea580c; color: #fff; width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 22px; margin-bottom: 16px;">Q</div>
        <h2 style="margin: 0 0 8px;">Verify your email</h2>
        <p style="color: #555; margin: 0 0 24px;">Hi ${name}, use the code below to finish creating your Qupon account.</p>
        <div style="background: #f9fafb; border: 1px solid #eee; border-radius: 12px; padding: 20px; text-align: center; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #111;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 20px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

module.exports = { sendOtpEmail };
