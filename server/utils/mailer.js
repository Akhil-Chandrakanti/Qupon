// Sends OTP emails via the Resend HTTP API (https://resend.com).
//
// Why not SMTP? Cloud hosts like Render frequently have their outbound SMTP
// connections to Gmail time out or get silently blocked, regardless of port.
// Resend sends over plain HTTPS (port 443), which is never blocked, and has
// a generous free tier that needs no credit card.
//
// Setup:
//   1. Create a free account at https://resend.com
//   2. Grab your API key from the dashboard and set RESEND_API_KEY in your
//      environment (Render -> Environment tab).
//   3. For quick testing with no domain setup, you can send FROM
//      "onboarding@resend.dev" (Resend's shared test sender) TO your own
//      verified Resend account email. To send to *any* recipient, verify a
//      domain in Resend and set SMTP_FROM (or RESEND_FROM) to an address on
//      that domain.

async function sendOtpEmail(toEmail, name, otp) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Email is not configured. Set RESEND_API_KEY in your environment (get one free at https://resend.com) to enable OTP emails.'
    );
  }

  const from = process.env.RESEND_FROM || process.env.SMTP_FROM || 'onboarding@resend.dev';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Qupon <${from}>`,
      to: [toEmail],
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
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`Resend API error (${response.status}): ${errText || 'failed to send email'}`);
  }
}

module.exports = { sendOtpEmail };
