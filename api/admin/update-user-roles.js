const { authenticateAdmin } = require('../_lib/supabase');

const ALLOWED_ROLES = new Set([
  'blog',
  'events',
  'bookings',
  'coffee_mornings',
  'committee',
  'churches',
  'newsletter',
]);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await authenticateAdmin(req, res, { requireMaster: true });
  if (!ctx) return;
  const { supabase } = ctx;

  const { userId, roles } = req.body || {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (!Array.isArray(roles) || !roles.every((r) => typeof r === 'string' && ALLOWED_ROLES.has(r))) {
    return res.status(400).json({ error: 'Invalid roles' });
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ roles })
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('update-user-roles error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to update roles' });
  }
};
