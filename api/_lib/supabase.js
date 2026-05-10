const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const MASTER_ADMIN_EMAILS = (process.env.VITE_MASTER_ADMIN_EMAILS || '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isMasterAdminEmail(email) {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Verify the Authorization header, look up the caller's admin record, and
 * return { user, adminRow }. Sends an HTTP error response and returns null
 * if the request is unauthenticated or the caller is not an admin.
 *
 * Options:
 *   requireMaster: boolean   — require master admin
 *   requireRole:   string    — require this role in admin_users.roles
 *                              (master admins always pass)
 */
async function authenticateAdmin(req, res, options = {}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    res.status(500).json({ error: 'Server configuration error' });
    return null;
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) {
    res.status(401).json({ error: 'Missing authentication' });
    return null;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  if (userError || !userData?.user) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return null;
  }
  const user = userData.user;

  const { data: adminRow, error: adminError } = await supabase
    .from('admin_users')
    .select('user_id, roles, is_master_admin')
    .eq('user_id', user.id)
    .maybeSingle();

  if (adminError) {
    res.status(500).json({ error: 'Failed to verify admin status' });
    return null;
  }
  if (!adminRow) {
    res.status(403).json({ error: 'Not an admin user' });
    return null;
  }

  const isMaster = adminRow.is_master_admin === true || isMasterAdminEmail(user.email);

  if (options.requireMaster && !isMaster) {
    res.status(403).json({ error: 'Master admin required' });
    return null;
  }

  if (options.requireRole && !isMaster) {
    const roles = Array.isArray(adminRow.roles) ? adminRow.roles : [];
    if (!roles.includes(options.requireRole)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return null;
    }
  }

  return { supabase, user, adminRow, isMaster };
}

module.exports = {
  getSupabaseAdmin,
  authenticateAdmin,
  isMasterAdminEmail,
};
