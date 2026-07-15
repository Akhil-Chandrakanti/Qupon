// Sends OTP emails via the SendGrid HTTP API (https://sendgrid.com).
//
// Why not SMTP? Cloud hosts like Render frequently have their outbound SMTP
// connections to Gmail time out or get silently blocked, regardless of port.
// SendGrid sends over plain HTTPS (port 443), which is never blocked.
//
// Setup (no domain / DNS needed - just single sender verification):
//   1. Create a free account at https://sendgrid.com
//   2. Go to Settings -> Sender Authentication -> "Verify a Single Sender"
//      and verify the email address you want to send FROM (e.g. your Gmail
//      address). You just click a confirmation link in your inbox - no DNS.
//   3. Go to Settings -> API Keys -> Create API Key (give it "Mail Send"
//      permission) and copy it.
//   4. In Render -> Environment, set:
//        SENDGRID_API_KEY = the key you just copied
//        SENDGRID_FROM    = the exact email address you verified in step 2
//   Once the single sender is verified, you can send to ANY recipient email
//   (unlike Resend's sandbox mode, which only lets you email yourself).

async function sendOtpEmail(toEmail, name, otp) {
  const apiKey = process.env.SENDGRID_API_KEY;
  const from = process.env.SENDGRID_FROM || process.env.SMTP_FROM;

  if (!apiKey || !from) {
    throw new Error(
      'Email is not configured. Set SENDGRID_API_KEY and SENDGRID_FROM in your environment (see https://sendgrid.com - use Single Sender Verification, no domain needed).'
    );
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: from, name: 'Qupon' },
      subject: `${otp} is your Qupon verification code`,
      content: [
        {
          type: 'text/plain',
          value: `Hi ${name},\n\nYour Qupon verification code is ${otp}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
        },
        {
          type: 'text/html',
          value: `
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
        },
      ],
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`SendGrid API error (${response.status}): ${errText || 'failed to send email'}`);
  }
}

module.exports = { sendOtpEmail };
