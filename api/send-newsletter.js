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

  const { name, email, group } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const toEmail = process.env.NOTIFICATION_EMAIL;
  const fromEmail = process.env.BREVO_FROM_EMAIL;

  if (!toEmail || !fromEmail) {
    console.error('Missing NOTIFICATION_EMAIL or BREVO_FROM_EMAIL env vars');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const displayName = name ? escapeHtml(name) : 'Someone';
  const displayGroup = group === 'churches'
    ? "Friends of St. John's & St. Nicholas"
    : 'Friends of Gower Village Hall';

  const adminHtml = `
    <h2>New Member Interest — ${displayGroup}</h2>
    <table cellpadding="6" cellspacing="0" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
      <tr><td style="font-weight:bold;padding-right:16px;">Name</td><td>${displayName}</td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">Email</td><td><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
      <tr><td style="font-weight:bold;padding-right:16px;">Group</td><td>${displayGroup}</td></tr>
    </table>
  `;

  const confirmationHtml = `
    <div style="font-family:sans-serif;font-size:15px;color:#222;max-width:560px;">
      <h2 style="color:#6b7564;">Thank you for joining, ${displayName}!</h2>
      <p>We've received your sign-up for <strong>${displayGroup}</strong> and someone will be in contact with you shortly.</p>
      <p>In the meantime, keep an eye out for updates on upcoming events and community news.</p>
      <p style="margin-top:24px;">If you have any questions, feel free to reply to this email.</p>
      <p>Kind regards,<br><strong>Penmaen &amp; Nicholaston Village Hall</strong></p>
    </div>
  `;

  const listId = group === 'churches'
    ? parseInt(process.env.BREVO_CHURCHES_LIST_ID, 10)
    : parseInt(process.env.BREVO_HALL_LIST_ID, 10);

  const addToBrevoList = async () => {
    if (!process.env.BREVO_API_KEY || !listId) return;
    const body = {
      email,
      attributes: name ? { FIRSTNAME: name } : undefined,
      listIds: [listId],
      updateEnabled: true,
    };
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text();
      console.error('Brevo contacts API error:', text);
    }
  };

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"Gower Village Hall Website" <${fromEmail}>`,
        to: toEmail,
        replyTo: email,
        subject: `${displayGroup} — New Member Interest from ${name || email}`,
        html: adminHtml,
      }),
      transporter.sendMail({
        from: `"Gower Village Hall Website" <${fromEmail}>`,
        to: email,
        subject: `Thanks for joining ${displayGroup}`,
        html: confirmationHtml,
      }),
      addToBrevoList(),
    ]);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Failed to send newsletter email:', err.message);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
