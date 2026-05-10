const { authenticateAdmin } = require('../_lib/supabase');

/**
 * Master-admin-only: returns the full list of admin users for the
 * /admin/users management page.
 */
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ctx = await authenticateAdmin(req, res, { requireMaster: true });
  if (!ctx) return;
  const { supabase } = ctx;

  try {
    const { data: adminRows, error: adminError } = await supabase
      .from('admin_users')
      .select('*');
    if (adminError) throw adminError;

    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) throw authError;

    const adminIds = new Set(adminRows.map((a) => a.user_id));
    const users = (authData?.users || [])
      .filter((u) => adminIds.has(u.id))
      .map((u) => {
        const row = adminRows.find((a) => a.user_id === u.id);
        return {
          id: u.id,
          email: u.email || '',
          name: u.user_metadata?.name || u.user_metadata?.full_name || '',
          created_at: row?.created_at || u.created_at,
          roles: row?.roles ?? [],
          is_master_admin: row?.is_master_admin ?? false,
        };
      });

    return res.status(200).json({ users });
  } catch (err) {
    console.error('list-users error:', err?.message || err);
    return res.status(500).json({ error: 'Failed to load users' });
  }
};
