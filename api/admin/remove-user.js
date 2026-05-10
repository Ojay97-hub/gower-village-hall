const { authenticateAdmin } = require('../_lib/supabase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await authenticateAdmin(req, res, { requireMaster: true });
  if (!ctx) return;
  const { supabase, user } = ctx;

  const { userId } = req.body || {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (userId === user.id) {
    return res.status(400).json({ error: 'Cannot remove yourself.' });
  }

  try {
    const { error: dbError } = await supabase
      .from('admin_users')
      .delete()
      .eq('user_id', userId);
    if (dbError) return res.status(500).json({ error: dbError.message });

    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) return res.status(500).json({ error: authError.message });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('remove-user error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to remove user' });
  }
};
