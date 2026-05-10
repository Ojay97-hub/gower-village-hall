const { authenticateAdmin } = require('../_lib/supabase');

const INVITE_REDIRECT = 'https://www.penmaenandnicholastonvh.co.uk/admin/login';

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await authenticateAdmin(req, res, { requireMaster: true });
  if (!ctx) return;
  const { supabase } = ctx;

  const { email } = req.body || {};
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: INVITE_REDIRECT,
    });
    if (error) return res.status(400).json({ error: error.message });

    const existingUser = !!data?.user?.email_confirmed_at;

    if (data?.user) {
      const { error: dbError } = await supabase
        .from('admin_users')
        .insert([{ user_id: data.user.id }]);
      if (
        dbError &&
        !dbError.message?.includes('duplicate') &&
        !dbError.code?.includes('23505')
      ) {
        return res.status(500).json({ error: dbError.message });
      }
    }

    return res.status(200).json({ existingUser });
  } catch (err) {
    console.error('invite-user error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to invite user' });
  }
};
