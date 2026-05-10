const { authenticateAdmin } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await authenticateAdmin(req, res, { requireMaster: true });
  if (!ctx) return;
  const { supabase } = ctx;

  const { userId, isMasterAdmin } = req.body || {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (typeof isMasterAdmin !== 'boolean') {
    return res.status(400).json({ error: 'isMasterAdmin must be boolean' });
  }

  try {
    const { error } = await supabase
      .from('admin_users')
      .update({ is_master_admin: isMasterAdmin })
      .eq('user_id', userId);
    if (error) return res.status(500).json({ error: error.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('set-master-admin error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to update privileges' });
  }
};
