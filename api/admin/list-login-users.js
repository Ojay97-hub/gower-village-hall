const { getSupabaseAdmin } = require('../_lib/supabase');

/**
 * Public endpoint that backs the "Choose an Account" view on /admin/login.
 * Returns minimal admin user info (id, email, name) for admins who have
 * already completed setup. Pre-auth — so do not include anything sensitive
 * beyond what was already shown on this screen.
 */
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { data: adminRows, error: adminError } = await supabase
      .from('admin_users')
      .select('user_id');
    if (adminError) throw adminError;
    if (!adminRows?.length) return res.status(200).json({ users: [] });

    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const adminIds = new Set(adminRows.map((a) => a.user_id));
    const users = (authData?.users || [])
      .filter((u) => adminIds.has(u.id) && u.email && u.last_sign_in_at)
      .map((u) => {
        const name = u.user_metadata?.name || u.user_metadata?.full_name || '';
        return { id: u.id, email: u.email, name };
      });

    return res.status(200).json({ users });
  } catch (err) {
    console.error('list-login-users error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load users' });
  }
};
