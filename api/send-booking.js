const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, date, endDate, session, details } = req.body || {};

  if (!name || !email || !details || !date) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const toEmail = process.env.NOTIFICATION_EMAIL;
  const fromEmail = process.env.BREVO_FROM_EMAIL;

  if (!toEmail || !fromEmail) {
    console.error('Missing NOTIFICATION_EMAIL or BREVO_FROM_EMAIL env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const html = `
    <h2>Hall Booking Enquiry</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${escapeHtml(name)}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">Phone</td><td>${escapeHtml(phone || 'Not provided')}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">Start Date</td><td>${escapeHtml(date)}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">End Date</td><td>${escapeHtml(endDate || 'Not specified')}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;vertical-align:top;">Details</td><td style="white-space:pre-wrap;">${escapeHtml(details)}</td></tr>
    </table>
  `;

  const confirmationHtml = `
    <div style="font-family:sans-serif;font-size:15px;color:#222;max-width:560px;">
      <h2 style="color:#2d6a4f;">Thank you for your enquiry, ${escapeHtml(name)}!</h2>
      <p>We've received your hall booking enquiry and will be in touch shortly to discuss availability and next steps.</p>
      <p>Here's a summary of what you submitted:</p>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
        <tr><td style="font-weight:bold;padding-right:16px;">Date(s)</td><td>${escapeHtml(date)}${endDate ? ` – ${escapeHtml(endDate)}` : ''}</td></tr>
        <tr><td style="font-weight:bold;padding-right:16px;vertical-align:top;">Details</td><td style="white-space:pre-wrap;">${escapeHtml(details)}</td></tr>
      </table>
      <p style="margin-top:24px;">If you have any questions in the meantime, feel free to reply to this email.</p>
      <p>Kind regards,<br><strong>Penmaen &amp; Nicholaston Village Hall</strong></p>
    </div>
  `;

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"Penmaen & Nicholaston Village Hall" <${fromEmail}>`,
        to: toEmail,
        replyTo: email,
        subject: `Hall Booking Enquiry from ${name}`,
        html,
      }),
      transporter.sendMail({
        from: `"Penmaen & Nicholaston Village Hall" <${fromEmail}>`,
        to: email,
        subject: `We've received your hall booking enquiry`,
        html: confirmationHtml,
      }),
    ]);
  } catch (err) {
    console.error('Failed to send booking email:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }

  // Insert booking record into Supabase (best-effort — email already sent)
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

  if (supabaseUrl && serviceRoleKey) {
    try {
      const dbRes = await fetch(`${supabaseUrl}/rest/v1/bookings`, {
        method: 'POST',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          event_type: session || null,
          date,
          end_date: endDate || null,
          message: details || null,
          status: 'pending',
        }),
      });
      if (!dbRes.ok) {
        const errText = await dbRes.text();
        console.error('Supabase booking insert failed:', dbRes.status, errText);
      }
    } catch (dbErr) {
      console.error('Supabase booking insert error:', dbErr.message);
    }
  } else {
    console.warn('Missing Supabase env vars — booking not saved to database');
  }

  return res.status(200).json({ success: true });
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
