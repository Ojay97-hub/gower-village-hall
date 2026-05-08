const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASS,
  },
});

const supabaseAdmin = process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY)
  : null;

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { group, subject, body } = req.body || {};

  if (!subject || !body) {
    return res.status(400).json({ error: 'Subject and body are required' });
  }
  if (!supabaseAdmin) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  const fromEmail = process.env.BREVO_FROM_EMAIL;
  if (!fromEmail) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  let query = supabaseAdmin
    .from('newsletter_subscribers')
    .select('name, email, group_name')
    .eq('status', 'active');

  if (group && group !== 'all') {
    query = query.eq('group_name', group);
  }

  const { data: subscribers, error: fetchError } = await query;
  if (fetchError) {
    return res.status(500).json({ error: 'Failed to fetch subscribers' });
  }
  if (!subscribers || subscribers.length === 0) {
    return res.status(400).json({ error: 'No active subscribers found for this group' });
  }

  const results = await Promise.allSettled(
    subscribers.map(sub =>
      transporter.sendMail({
        from: `"Penmaen & Nicholaston Village Hall" <${fromEmail}>`,
        to: sub.email,
        subject,
        html: buildHtml(subject, body, sub.name),
      })
    )
  );

  const sent = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;

  return res.status(200).json({ sent, failed });
};

function buildHtml(subject, body, name) {
  const greeting = name ? `Hi ${escapeHtml(name)},` : 'Hello,';
  const paragraphs = body
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
    <div style="font-family:sans-serif;font-size:15px;color:#222;max-width:560px;margin:0 auto;">
      <p style="margin:0 0 20px;">${greeting}</p>
      ${paragraphs}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="font-size:12px;color:#9ca3af;margin:0;">
        You're receiving this because you signed up for updates from
        Penmaen &amp; Nicholaston Village Hall.
      </p>
    </div>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
